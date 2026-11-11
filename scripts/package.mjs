import { cp, mkdir, readFile, copyFile, rm } from 'node:fs/promises';
import { resolve, dirname, relative, sep } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, '.local/site');
const pages = JSON.parse(await readFile(resolve(root, 'assets/pages.json'), 'utf8'));
if (relative(root, output) !== `.local${sep}site`) throw new Error('Unexpected packaging directory');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const file of [...pages, '404.html', 'robots.txt', 'sitemap.xml', '.nojekyll']) {
  const target = resolve(output, file);
  await mkdir(dirname(target), { recursive: true });
  await copyFile(resolve(root, file), target);
}
await cp(resolve(root, 'assets'), resolve(output, 'assets'), { recursive: true });
console.log('Packaged public site files. Source, tests and local credentials are excluded.');
