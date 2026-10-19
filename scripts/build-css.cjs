// Compiles less/core.less and every less/pages/<area>.less into assets/css/<name>.min.css.
//   node scripts/build-css.cjs           one-shot build, exits 1 on a Less error
//   node scripts/build-css.cjs --watch   rebuilds on any change under less/
const fs = require('node:fs');
const path = require('node:path');
const less = require('less');

const ROOT = path.join(__dirname, '..');
const LESS_DIR = path.join(ROOT, 'less');
const OUT_DIR = path.join(ROOT, 'assets/css');

const entries = () => [
  path.join(LESS_DIR, 'core.less'),
  ...fs.readdirSync(path.join(LESS_DIR, 'pages'))
    .filter(f => f.endsWith('.less'))
    .sort()
    .map(f => path.join(LESS_DIR, 'pages', f)),
];

async function compile(file) {
  const { css } = await less.render(fs.readFileSync(file, 'utf8'), { filename: file, compress: true });
  // compress keeps /*! license */ comments; the shipped CSS carries none (PERF-18).
  const out = path.join(OUT_DIR, `${path.basename(file, '.less')}.min.css`);
  fs.writeFileSync(out, css.replace(/\/\*[\s\S]*?\*\//g, ''));
  return out;
}

async function buildAll() {
  for (const file of entries()) {
    const out = await compile(file);
    console.log(`${path.relative(ROOT, out)} (${fs.statSync(out).size} bytes)`);
  }
}

const report = err => console.error(err.filename ? `${err.filename}:${err.line}: ${err.message}` : err);

if (process.argv.includes('--watch')) {
  let timer;
  const rebuild = () => buildAll().catch(report);
  rebuild();
  fs.watch(LESS_DIR, { recursive: true }, (event, name) => {
    if (!name || !name.endsWith('.less')) return;
    clearTimeout(timer);
    timer = setTimeout(rebuild, 100);
  });
  console.log('watching less/');
} else {
  buildAll().catch(err => { report(err); process.exit(1); });
}
