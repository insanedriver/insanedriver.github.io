const htmlmin = require("html-minifier");

module.exports = function (eleventyConfig) {

    // Allow include subfolders
    eleventyConfig.setLiquidOptions({
        dynamicPartials: true
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