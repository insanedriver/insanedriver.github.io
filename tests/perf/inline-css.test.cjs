// PS2-15/20: the helper that inlines a compiled page bundle into a <style>.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { inlineCss } = require('../../lib/inline-css.js');

// A temp project root holding assets/css/<name>.min.css with the given CSS.
function rootWith(name, css) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'inline-css-'));
  fs.mkdirSync(path.join(root, 'assets/css'), { recursive: true });
  if (css !== undefined) fs.writeFileSync(path.join(root, 'assets/css', `${name}.min.css`), css);
  return root;
}

test('PS2-15: url("../X"), url(\'../X\') and url(../X) all become root-absolute /assets/X', () => {
  const root = rootWith('page', 'a{background:url("../images/a.jpg")}b{background:url(\'../fonts/b.woff2\')}c{mask:url(../images/c.png)}');
  const out = inlineCss('page', root);
  assert.equal(out, 'a{background:url("/assets/images/a.jpg")}b{background:url(\'/assets/fonts/b.woff2\')}c{mask:url(/assets/images/c.png)}');
  assert.ok(!out.includes('url(../') && !out.includes('url("../') && !out.includes("url('../"));
});

test('PS2-15: image-set() and -webkit-image-set() url(../X) values are rewritten too', () => {
  const root = rootWith('page', 'a{mask:image-set(url("../images/l.webp") type("image/webp"),url("../images/l.png") type("image/png"));-webkit-mask:-webkit-image-set(url(../images/l.webp) 1x)}');
  assert.equal(inlineCss('page', root), 'a{mask:image-set(url("/assets/images/l.webp") type("image/webp"),url("/assets/images/l.png") type("image/png"));-webkit-mask:-webkit-image-set(url(/assets/images/l.webp) 1x)}');
});

test('PS2-15: absolute, root-absolute and data: URLs are left untouched', () => {
  const css = 'a{background:url("https://cdn.example/x.png")}b{background:url(/assets/images/y.jpg)}c{background:url("data:image/svg+xml,%3Csvg%3E%3Cfilter id=\'n\'/%3E%3Crect filter=\'url(%23n)\'/%3E%3C/svg%3E")}d{background:url(data:image/png;base64,AAAA)}';
  assert.equal(inlineCss('page', rootWith('page', css)), css);
});

test('PS2-20: a missing bundle throws an error naming assets/css/<name>.min.css', () => {
  const root = rootWith('page');
  assert.throws(() => inlineCss('home', root), err => err instanceof Error && err.message.includes('assets/css/home.min.css'));
});

test('PS2-15: with no root it reads the emitted repo home bundle and leaves no url(../', () => {
  const src = fs.readFileSync(path.join(__dirname, '../../assets/css/home.min.css'), 'utf8');
  const out = inlineCss('home');
  assert.equal(out.length, src.length + ('/assets/'.length - '../'.length) * (src.match(/url\(\s*["']?\.\.\//g) || []).length);
  assert.ok(out.includes('url("/assets/images/logo_loading.webp")'), 'logo mask resolves to /assets/images/');
  assert.ok(!/url\(\s*["']?\.\.\//.test(out), 'no url(../ left');
});
