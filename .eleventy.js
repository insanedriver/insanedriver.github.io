const htmlmin = require("html-minifier");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

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

    // We simply tell eleventy to pass a copy of our assets folder
    eleventyConfig.addPassthroughCopy("./assets");
    eleventyConfig.addPassthroughCopy("./google*.html");

    return {
        dir: {
            layouts: "_layouts",
            output: "docs",
        },
        htmlTemplateEngine: "liquid",
        markdownTemplateEngine: "liquid",
    };
};