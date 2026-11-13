// JSON-LD values: a JSON literal, with "<" escaped so no string can close the <script>.
function jsonify(value) {
    return JSON.stringify(value).replace(/</g, "\\u003c");
}

// SEO-07: a description of at most `max` characters (default 160), cut at a sentence boundary
// (or, if the first sentence alone is too long, at a word boundary with an ellipsis).
function metaDescription(text, max = 160) {
    const clean = String(text).replace(/\s+/g, " ").trim();
    if (clean.length <= max) {
        return clean;
    }
    let out = "";
    for (const sentence of clean.match(/[^.!?]+[.!?]+(?=\s|$)/g) || []) {
        const next = (out + " " + sentence.trim()).trim();
        if (next.length > max) {
            break;
        }
        out = next;
    }
    return out || clean.slice(0, max - 1).replace(/\s+\S*$/, "") + "…";
}

// Reserves budget for `For fans of ...` so both the track summary and band list fit in 160 chars.
function songMetaDescription(baseDesc, fansOf) {
    if (!fansOf) {
        return metaDescription(baseDesc);
    }
    const suffix = " " + String(fansOf).replace(/\s+/g, " ").trim().replace(/\.$/, "") + ".";
    const budget = 160 - suffix.length;
    if (budget < 20) {
        return metaDescription(fansOf + ".");
    }
    return metaDescription(baseDesc, budget) + suffix;
}

module.exports = { jsonify, metaDescription, songMetaDescription };
