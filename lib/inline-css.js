const fs = require("fs");
const path = require("path");

// PS2-14/15/20: the compiled assets/css/<name>.min.css as a string for a <style>,
// with url(../X) rewritten to url(/assets/X) so it resolves from any page.
function inlineCss(name, root = path.join(__dirname, "..")) {
    const rel = `assets/css/${name}.min.css`;
    const file = path.join(root, rel);
    if (!fs.existsSync(file)) {
        throw new Error(`inline-css: ${rel} not found - run npm run less:build`);
    }
    return fs.readFileSync(file, "utf8").replace(/url\((\s*["']?)\.\.\//g, "url($1/assets/");
}

module.exports = { inlineCss };
