// Gera site/js/processos.js a partir de ndvw_extraido.json
const fs = require('fs');
const dados = JSON.parse(fs.readFileSync(__dirname + '/ndvw_extraido.json', 'utf8'));

const limparTxt = (s) => String(s || '')
  .replace(/\s+/g, ' ')
  .replace(/\s+,/g, ',')
  .replace(/,\s*$/, '')
  .trim();

const processos = dados.processos.map(p => ({
  processo: limparTxt(p.processo),
  tipo: limparTxt(p.tipo),
  descricao: limparTxt(p.descricao),
  sistema: limparTxt(p.sistema)
})).filter(p => p.descricao);

// valida contagem por tipo
const contagem = {};
processos.forEach(p => { contagem[p.tipo] = (contagem[p.tipo] || 0) + 1; });

const js = '/* Processos da versão 6.1514 — extraídos da página oficial\n' +
  '   https://ajuda.alterdata.com.br/ndvw/6-1514 */\n' +
  'window.PROCESSOS_61514 = ' + JSON.stringify(processos, null, 0) + ';\n';

fs.writeFileSync(__dirname + '/site/js/processos.js', js);
console.log('gerados:', processos.length, 'processos');
console.log('tipos:', JSON.stringify(contagem, null, 1));
console.log('bytes:', js.length);
