// Extrai destaques (seções h2) e a tabela de processos do ndvw_61514.html
const fs = require('fs');
const html = fs.readFileSync(__dirname + '/ndvw_61514.html', 'utf8');

const limpar = (s) => s
  .replace(/<script[\s\S]*?<\/script>/gi, '')
  .replace(/<style[\s\S]*?<\/style>/gi, '')
  .replace(/<br\s*\/?>/gi, '\n')
  .replace(/<\/(p|li|h[1-6]|div|tr)>/gi, '\n')
  .replace(/<[^>]+>/g, '')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n))
  .replace(/[ \t]+/g, ' ')
  .replace(/\n{3,}/g, '\n\n')
  .trim();

// ---------- 1) Seções h2 ----------
const cortes = [];
const reH = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
let m;
while ((m = reH.exec(html))) {
  cortes.push({ ini: m.index, fim: m.index + m[0].length, titulo: limpar(m[1]) });
}

const destaques = [];
for (let i = 0; i < cortes.length; i++) {
  const fim = i + 1 < cortes.length ? cortes[i + 1].ini : html.length;
  let corpo = html.slice(cortes[i].fim, fim);
  // limita antes da seção da tabela gigante, se necessário
  const texto = limpar(corpo);
  // processos citados no corpo (ex.: NOTAF-9593, WSHOP-135810, 136181)
  const proc = [...corpo.matchAll(/(?:Processo:?\s*|processo\s+)([\w\-]+)/gi)].map(x => x[1]);
  const proc2 = [...texto.matchAll(/\b(?:Processo:?\s*)([\w\-]+)/gi)].map(x => x[1]);
  // links internos do corpo
  const links = [...corpo.matchAll(/<a\s[^>]*href="(https?:[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)]
    .map(x => ({ url: x[1], texto: limpar(x[2]) }))
    .filter(l => !/Voltar ao topo|stiltsoft|alchemer/i.test(l.texto));
  destaques.push({
    titulo: cortes[i].titulo,
    processo: [...new Set([...proc, ...proc2])].slice(0, 3),
    links,
    texto: texto.slice(0, 2600)
  });
}

// ---------- 2) Tabela de processos ----------
const tabela = html.match(/<table[\s\S]*?<\/table>/i);
const linhas = [];
if (tabela) {
  const reTr = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let t;
  while ((t = reTr.exec(tabela[0]))) {
    const celulas = [...t[1].matchAll(/<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi)].map(c => limpar(c[1]));
    if (celulas.length >= 4 && !/Número do Processo/.test(celulas[0])) {
      linhas.push({ processo: celulas[0], tipo: celulas[1], descricao: celulas[2], sistema: celulas[3] });
    }
  }
}

fs.writeFileSync(__dirname + '/ndvw_extraido.json',
  JSON.stringify({ destaques, processos: linhas }, null, 1));

console.log('destaques:', destaques.length);
destaques.forEach(d => console.log(' -', d.titulo, '| proc:', d.processo.join(','), '| links:', d.links.length, '| texto:', d.texto.length));
console.log('processos na tabela:', linhas.length);
const tipos = {};
linhas.forEach(l => { tipos[l.tipo] = (tipos[l.tipo] || 0) + 1; });
console.log('tipos:', JSON.stringify(tipos));
console.log('amostra:', JSON.stringify(linhas.slice(0, 3), null, 1));
