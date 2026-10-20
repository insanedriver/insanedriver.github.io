// Reads the built site for the perf unit suites: run `npm run build` first. Not a test file itself.
const fs = require('node:fs');
const path = require('node:path');

const DOCS = path.join(__dirname, '../../docs');

// Every built .html page, as [url path, html]. Skips dot folders, the Google
// verification files and the legacy dates/ page (out of scope).
function builtPages(dir = DOCS) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    const rel = '/' + path.relative(DOCS, full).split(path.sep).join('/');
    if (entry.isDirectory()) {
      if (rel === '/dates') continue;
      out.push(...builtPages(full));
    } else if (entry.name.endsWith('.html') && !/^google.*\.html$/.test(entry.name)) {
      out.push([rel.replace(/index\.html$/, ''), fs.readFileSync(full, 'utf8')]);
    }
  }
  return out;
}

// Pages rendered by _layouts/base.html or _layouts/home.html (both open <body id="page_...">).
const layoutPages = () => builtPages().filter(([, html]) => /<body id="?page_/.test(html));

const page = url => {
  const found = builtPages().find(([u]) => u === url);
  if (!found) throw new Error(`no built page ${url}`);
  return found[1];
};

module.exports = { DOCS, builtPages, layoutPages, page };
