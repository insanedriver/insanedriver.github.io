const htmlmin = require("html-minifier");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { selectSitemapEntries } = require("./lib/sitemap");

// Cache busting: appends ?v=<content hash> to local /assets/*.css|js references,
// so browsers refetch a file exactly when its content changes.
const hashCache = new Map();
function assetHash(urlPath) {
    if (!hashCache.has(urlPath)) {
        const file = path.join(__dirname, urlPath);
        hashCache.set(
            urlPath,
            fs.existsSync(file)
                ? crypto.createHash("md5").update(fs.readFileSync(file)).digest("hex").slice(0, 10)
                : null
        );
    }
    return hashCache.get(urlPath);
}

module.exports = function (eleventyConfig) {

    // Allow include subfolders
    eleventyConfig.setLiquidOptions({
        dynamicPartials: true
    });

    // Cache busting (must run before the minifier)
    eleventyConfig.addTransform("cachebust", function (content, outputPath) {
        if (!outputPath || !outputPath.endsWith(".html")) {
            return content;
        }
        return content.replace(
            /((?:src|href)=["'])(\/assets\/[^"'?#]+\.(?:css|js))(?:\?[^"'#]*)?(["'])/g,
            (match, pre, url, post) => {
                const hash = assetHash(url);
                return hash ? `${pre}${url}?v=${hash}${post}` : match;
            }
        );
    });

    // Minify
    eleventyConfig.addTransform("htmlmin", function (content, outputPath) {
        // Eleventy 1.0+: use this.inputPath and this.outputPath instead
        if (outputPath && outputPath.endsWith(".html")) {
            let minified = htmlmin.minify(content, {
                useShortDoctype: true,
                removeComments: true,
                collapseWhitespace: true
            });
            return minified;
        }

        return content;
    });

    // SEO-01/02: the pages listed in sitemap.xml
    eleventyConfig.addFilter("sitemapEntries", selectSitemapEntries);

    // JSON-LD values: a JSON literal, with "<" escaped so no string can close the <script>.
    eleventyConfig.addFilter("jsonify", value => JSON.stringify(value).replace(/</g, "\\u003c"));

    // SEO-07: a description of at most 160 characters, cut at a sentence boundary
    // (or, if the first sentence alone is too long, at a word boundary with an ellipsis).
    eleventyConfig.addFilter("metaDescription", text => {
        const MAX = 160;
        const clean = String(text).replace(/\s+/g, " ").trim();
        if (clean.length <= MAX) {
            return clean;
        }
        let out = "";
        for (const sentence of clean.match(/[^.!?]+[.!?]+(?=\s|$)/g) || []) {
            const next = (out + " " + sentence.trim()).trim();
            if (next.length > MAX) {
                break;
            }
            out = next;
        }
        return out || clean.slice(0, MAX - 1).replace(/\s+\S*$/, "") + "…";
    });

    // We simply tell eleventy to pass a copy of our assets folder
    eleventyConfig.addPassthroughCopy("./assets");
    eleventyConfig.addPassthroughCopy("./google*.html");
    eleventyConfig.addPassthroughCopy("./robots.txt");

    return {
        dir: {
            layouts: "_layouts",
            output: "docs",
        },
        htmlTemplateEngine: "liquid",
        markdownTemplateEngine: "liquid",
    };
};