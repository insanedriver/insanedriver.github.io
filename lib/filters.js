// JSON-LD values: a JSON literal, with "<" escaped so no string can close the <script>.
function jsonify(value) {
    return JSON.stringify(value).replace(/</g, "\\u003c");
}

// SEO-07: a description of at most 160 characters, cut at a sentence boundary
// (or, if the first sentence alone is too long, at a word boundary with an ellipsis).
function metaDescription(text) {
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
}

module.exports = { jsonify, metaDescription };
