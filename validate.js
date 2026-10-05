const fs = require('fs');
const p = require('path');

const base = p.join(__dirname, 'site');
const html = fs.readFileSync(p.join(base, 'index.html'), 'utf8');
let bad = 0;

const tags = ['div', 'section', 'article', 'ul', 'li', 'p', 'a', 'span',
  'h1', 'h2', 'h3', 'figure', 'figcaption', 'main', 'header', 'footer',
  'nav', 'html', 'body', 'head', 'title', 'strong', 'script'];

for (const t of tags) {
  const abre = (html.match(new RegExp('<' + t + '(\\s|>)', 'g')) || []).length;
  const fecha = (html.match(new RegExp('</' + t + '>', 'g')) || []).length;
  if (abre !== fecha) {
    console.log('TAG DESBALANCEADA:', t, 'abre', abre, 'fecha', fecha);
    bad++;
  }
}

// referencias locais (src/href) precisam existir
const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
  .map(m => m[1])
  .filter(u => !u.startsWith('http') && !u.startsWith('#'));

for (const r of refs) {
  if (!fs.existsSync(p.join(base, r))) {
    console.log('ARQUIVO AUSENTE:', r);
    bad++;
  }
}

// checagem extra: cada link dos txts originais foi usado?
const links = [];
for (const arq of ['Untitled-1.txt', 'Untitled-2.txt']) {
  fs.readFileSync(p.join(__dirname, arq), 'utf8')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.startsWith('http'))
    .forEach((l) => links.push(l));
}
for (const l of links) {
  if (!html.includes(l)) {
    console.log('LINK DO TXT NAO INCLUIDO:', l);
    bad++;
  }
}

console.log(bad === 0
  ? 'OK - tags balanceadas, arquivos presentes e todos os links dos txts incluidos'
  : 'ERROS: ' + bad);

// ---- variavel CSS: toda var(...) usada precisa existir em :root ----
const css = fs.readFileSync(p.join(base, 'css', 'style.css'), 'utf8');
const definidas = new Set([...css.matchAll(/(--[\w-]+)\s*:/g)].map(m => m[1]));
const usadas = new Set([...css.matchAll(/var\((--[\w-]+)/g)].map(m => m[1]));
let cssBad = 0;
for (const v of usadas) {
  if (!definidas.has(v)) {
    console.log('VAR CSS UNDEFINIDA:', v);
    cssBad++;
  }
}
const abre = (css.match(/{/g) || []).length;
const fecha = (css.match(/}/g) || []).length;
if (abre !== fecha) {
  console.log('CSS CHAVES DESBALANCEADAS:', abre, fecha);
  cssBad++;
}
// media query responsiva precisa ser o ultimo bloco (senao perde para o estilo base)
const fimResponsivo = css.lastIndexOf('@media (max-width: 760px)');
const fimBase = css.lastIndexOf('}', fimResponsivo);
console.log(cssBad === 0
  ? 'OK - CSS: variaveis definidas, chaves balanceadas, responsivo ao final'
  : 'ERROS CSS: ' + cssBad);

