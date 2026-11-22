// REV-24/25: reports press review and recognition links that stopped answering.
//   node scripts/check-review-links.cjs
// Run by hand; it is not part of `npm test` or `npm run build`, and always exits 0.
const TIMEOUT_MS = 20000;

const reviewLinks = data => [...data.reviews.map(r => r.url), ...data.recognitions.map(r => r.url)];

// Returns [{ url, status }] for every link that does not answer 2xx or 3xx.
async function checkLinks(links, fetch) {
    const failures = [];
    for (const url of links) {
        try {
            const { status } = await fetch(url);
            if (status < 200 || status >= 400) failures.push({ url, status });
        } catch (err) {
            failures.push({ url, status: err.message });
        }
    }
    return failures;
}

const report = (failures, total) => failures.length
    ? [...failures.map(f => `${f.status}\t${f.url}`), `${failures.length} of ${total} links failed`].join('\n')
    : `All ${total} links answered 2xx or 3xx`;

if (require.main === module) {
    const links = reviewLinks(require('../_data/reviews.json'));
    const fetchOnce = url => fetch(url, {
        redirect: 'manual',
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: { 'user-agent': 'Mozilla/5.0 (link check)' },
    });
    checkLinks(links, fetchOnce).then(failures => console.log(report(failures, links.length)));
}

module.exports = { reviewLinks, checkLinks, report };
