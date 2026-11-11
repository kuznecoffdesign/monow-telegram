import { readFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const pages = JSON.parse(await readFile(resolve(root, 'assets/pages.json'), 'utf8'));
const titles = new Set();
let links = 0;
for (const file of pages) {
  const html = await readFile(resolve(root, file), 'utf8');
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, `${file}: one H1`);
  const title = html.match(/<title>(.*?)<\/title>/)?.[1];
  assert.ok(title && !titles.has(title), `${file}: unique title`);
  titles.add(title);
  assert.match(html, /name="description" content="[^"]{40,}"/, `${file}: description`);
  assert.match(html, /name="robots" content="noindex, follow"/, `${file}: development must not be indexed`);
  assert.match(html, /Content-Security-Policy/, `${file}: CSP`);
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)];
  for (const [, schema] of schemas) {
    JSON.parse(schema);
    const hash = createHash('sha256').update(schema).digest('base64');
    assert.ok(html.includes(hash), `${file}: structured data CSP hash`);
  }
  assert.doesNotMatch(html, /(?:\bon\w+\s*=|javascript:|<iframe|<object)/i, `${file}: unsafe HTML`);
  assert.doesNotMatch(html, /(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|\d{8,12}:[A-Za-z0-9_-]{30,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)/, `${file}: exposed credential`);
  for (const [, attr, value] of html.matchAll(/\b(href|src)="([^"]+)"/g)) {
    if (value.startsWith('/monow-telegram/')) {
      const target = value.split('#')[0].split('?')[0].slice('/monow-telegram/'.length);
      await access(resolve(root, target.endsWith('/') || !target ? `${target}index.html` : target));
      links++;
    } else if (value.startsWith('#')) {
      assert.ok(value === '#' || html.includes(`id="${value.slice(1)}"`), `${file}: missing anchor ${value}`);
    } else assert.ok(value.startsWith('https://') || value.startsWith('data:'), `${file}: unsafe ${attr}`);
  }
  for (const match of html.matchAll(/<a [^>]*target="_blank"[^>]*>/g)) assert.match(match[0], /rel="noopener noreferrer"/, `${file}: safe external tab`);
}
const app = await readFile(resolve(root, 'assets/app.mjs'), 'utf8');
assert.doesNotMatch(app, /innerHTML|outerHTML|document\.write|eval\(|localStorage|sessionStorage|fetch\(/, 'no unsafe HTML, persistent form storage or network calls');
assert.match(await readFile(resolve(root, '.gitignore'), 'utf8'), /\.env/);
console.log(`Checked ${pages.length} pages and ${links} local links: metadata, CSP, structured data, credentials and safe markup.`);
