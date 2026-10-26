import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'out');
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(entries.map(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]));
  return nested.flat();
}
const files = await walk(output);
const available = new Set(files);
const htmlFiles = files.filter(file => file.endsWith('.html'));
const documents = new Map(await Promise.all(htmlFiles.map(async file => [file, await readFile(file, 'utf8')])));
const failures = new Set();
let links = 0;
let images = 0;
for (const [file, html] of documents) {
  const relative = path.relative(output, file);
  const route = relative === 'index.html' ? '/' : `/${relative.replace(/\.html$/, '')}`;
  const base = new URL(route, 'https://docs.usecaderninho.com');
  for (const match of html.matchAll(/<img\b[^>]*>/g)) {
    const tag = match[0];
    const src = tag.match(/\bsrc="([^"]+)"/)?.[1]?.replaceAll('&amp;', '&');
    images++;
    if (!/\balt="[^"]*"/.test(tag)) failures.add(`${route} (imagem sem texto alternativo)`);
    if (!src || /^(data:|blob:)/.test(src)) continue;
    const url = new URL(src, base);
    if (url.origin !== base.origin) continue;
    const target = path.join(output, decodeURIComponent(url.pathname));
    if (!available.has(target)) failures.add(`${route} → ${src} (imagem ausente)`);
  }
  for (const match of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)) {
    const href = match[1].replaceAll('&amp;', '&');
    if (/^(https?:|mailto:|tel:|data:)/.test(href) && !href.startsWith('https://docs.usecaderninho.com')) continue;
    const url = new URL(href, base);
    if (url.origin !== base.origin) continue;
    links++;
    const targetPath = decodeURIComponent(url.pathname).replace(/\/$/, '') || '/index';
    const exact = path.join(output, targetPath);
    const target = [exact, `${exact}.html`, path.join(exact, 'index.html')].find(candidate => available.has(candidate));
    if (!target) { failures.add(`${route} → ${href} (destino ausente)`); continue; }
    if (url.hash && documents.has(target)) {
      const id = decodeURIComponent(url.hash.slice(1));
      if (!documents.get(target).includes(`id="${id}"`)) failures.add(`${route} → ${href} (âncora ausente)`);
    }
  }
}
const catalog = JSON.parse(await readFile(path.join(root, 'data/catalog.json'), 'utf8'));
const raw = JSON.parse(await readFile(path.join(root, 'data/mcp-tools.json'), 'utf8'));
const names = new Set(catalog.tools.map(tool => tool.name));
if (names.size !== raw.length || raw.some(tool => !names.has(tool.name))) failures.add('Catálogo incompleto ou com ferramentas duplicadas.');
for (const tool of catalog.tools) if (!available.has(path.join(output, `${tool.url}.html`))) failures.add(`Referência da ferramenta ausente: ${tool.name}`);
for (const filename of ['llms.txt', 'llms-full.txt', 'sitemap.xml', 'robots.txt', 'api/search']) {
  const info = await stat(path.join(output, filename));
  if (!info.size) failures.add(`Arquivo vazio: ${filename}`);
}
if (failures.size) {
  for (const failure of failures) console.error(failure);
  process.exitCode = 1;
} else {
  console.log(`${htmlFiles.length} páginas HTML, ${links} links internos, ${images} imagens e ${raw.length} ferramentas: referências completas, nenhum destino, imagem ou âncora ausente.`);
}
