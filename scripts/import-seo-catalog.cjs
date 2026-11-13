const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_SOURCE = '/home/deivid/Projects/InsaneDriver/classifier-agent/data/seo_catalog_local.md';
const DEFAULT_OUT = path.join(__dirname, '../_data/seo-catalog.json');

const stripTicks = value => value.trim().replace(/^`|`$/g, '').trim();
const stripStars = value => value.trim().replace(/^\*+|\*+$/g, '').trim();

function cleanJustification(text) {
    const idx = text.search(/\s*MERT acoustic similarity of\b/i);
    return (idx === -1 ? text : text.slice(0, idx)).trim();
}

function parseCatalogMarkdown(markdown) {
    const sections = markdown.split(/\n## \d+\. /).slice(1);
    const catalog = {};

    for (const section of sections) {
        const header = section.split('\n', 1)[0];
        const slugMatch = header.match(/\(`([^`]+)`\)/);
        if (!slugMatch) continue;
        const slug = slugMatch[1].trim();

        const primaryMatch = section.match(/- \*\*Classificação Primária\*\*:\s*`([^`]+)`/);
        const secondaryMatch = section.match(/- \*\*Classificação Secundária\*\*:\s*`([^`]+)`/);
        if (!primaryMatch || !secondaryMatch) {
            throw new Error(`seo-catalog: missing classification for ${slug}`);
        }

        const bands = [];
        for (const line of section.split('\n')) {
            if (!line.startsWith('| **')) continue;
            const cols = line.split('|').slice(1, -1).map(c => c.trim());
            if (cols.length < 9) continue;
            const [rawBand, rawEra, rawRefs, rawScore, , , threshold, , rawJustEn] = cols;
            if (threshold !== '✅') continue;

            const name = stripStars(rawBand);
            const era = stripTicks(rawEra);
            const referenceTracks = stripStars(rawRefs);
            const score = Number.parseFloat(stripTicks(rawScore));
            const justification = cleanJustification(rawJustEn);

            if (!name || !referenceTracks || !justification || Number.isNaN(score)) {
                throw new Error(`seo-catalog: invalid checked band row for ${slug}`);
            }
            bands.push({ name, era, referenceTracks, score, justification });
        }

        if (bands.length === 0) {
            throw new Error(`seo-catalog: ${slug} has no checked bands`);
        }

        catalog[slug] = {
            primaryGenre: primaryMatch[1].trim(),
            secondaryGenre: secondaryMatch[1].trim(),
            bands,
        };
    }

    return catalog;
}

function main() {
    const sourcePath = process.argv[2] || DEFAULT_SOURCE;
    const outPath = process.argv[3] || DEFAULT_OUT;
    const markdown = fs.readFileSync(sourcePath, 'utf8');
    const catalog = parseCatalogMarkdown(markdown);
    const slugs = Object.keys(catalog);
    if (slugs.length !== 24) {
        throw new Error(`seo-catalog: expected 24 tracks, got ${slugs.length}`);
    }
    fs.writeFileSync(outPath, JSON.stringify(catalog, null, 2) + '\n', 'utf8');
    console.log(`Wrote ${slugs.length} tracks to ${outPath}`);
}

if (require.main === module) main();

module.exports = { parseCatalogMarkdown, cleanJustification };
