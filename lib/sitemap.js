// SEO-02: the pages worth ranking. Keeps HTML outputs that do not opt out
// with `sitemap: false` and whose robots value has neither noindex nor nofollow.
function selectSitemapEntries(items) {
    return items
        .filter(item => typeof item.outputPath === 'string' && item.outputPath.endsWith('.html'))
        .filter(item => item.data.sitemap !== false)
        .filter(item => !/\b(noindex|nofollow)\b/.test(item.data.page_robots || ''))
        .sort((a, b) => (a.url < b.url ? -1 : a.url > b.url ? 1 : 0));
}

module.exports = { selectSitemapEntries };
