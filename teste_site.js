// Teste headless: renderiza o site e valida o DOM gerado
const { execFileSync } = require('child_process');
const { pathToFileURL } = require('url');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const html = pathToFileURL(__dirname + '/site/index.html').href;

let dom = '';
try {
  dom = execFileSync(CHROME, [
    '--headless=new', '--disable-gpu', '--no-sandbox',
    '--window-size=1280,2600',
    '--virtual-time-budget=8000', '--dump-dom', html
  ], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
} catch (e) {
  console.log('ERRO no Chrome:', e.message.slice(0, 300));
  process.exit(1);
}

let falhas = 0;
function checar(nome, ok, detalhe) {
  console.log((ok ? 'OK   ' : 'FALHA') + ' - ' + nome + (detalhe ? ' | ' + detalhe : ''));
  if (!ok) { falhas++; }
}

const qtd = (re) => (dom.match(re) || []).length;

// --- seção de ajustes ---
const chips = qtd(/class="chip(?: ativo)?"/g);
checar('chips de filtro renderizados (7)', chips === 7, 'encontrados: ' + chips);

const itens = qtd(/class="ajuste-item"/g);
checar('200 processos na lista', itens === 200, 'encontrados: ' + itens);

checar('contador exibido', /Exibindo 200 de 200 processos/.test(dom));

checar('chip Todos com contagem 200',
  /chip-n">200<\/span>/.test(dom));
checar('chip Erro com contagem 123',
  /chip-n">123<\/span>/.test(dom));

// --- cards de novidades ---
const artigosNovidades = (() => {
  const secao = dom.split('id="novidades"')[1];
  if (!secao) { return -1; }
  return (secao.split('id="ajustes"')[0].match(/<article /g) || []).length;
})();
checar('15 cards de novidades', artigosNovidades === 15, 'encontrados: ' + artigosNovidades);

checar('processos oficiais nos cards',
  /Processo NOTAF-9593/.test(dom) && /Processo WSHOP-135810/.test(dom) &&
  /Processo 136181/.test(dom) && /Processo WSHOP-135320/.test(dom) &&
  /Processo WSHOP-135274/.test(dom) && /Processo WSHOP-83833/.test(dom));

checar('secao ajustes com id', /id="ajustes"/.test(dom));
checar('menu link ajustes', /href="#ajustes">Ajustes 6.1514<\/a>/.test(dom));

// --- grupos de manuais ---
checar('grupo manuais novidades 6.1514', /Novidades 6.1514 e aprendizagem/.test(dom));
checar('link suporteexpress no manuais', /suporteexpress/.test(dom));

// --- botões "Ver novidades" e "Formas de controlar melhor a operação" + painel ---
checar('botao Ver novidades no padrao (sem verde cheio) com ancora #novidades',
  /class="btn btn-secundario" href="#novidades" id="btn-novidades"[^>]*>Ver novidades</.test(dom));
checar('sem botao verde (btn-primario) no topo', !/btn-primario/.test(dom));
checar('botao formas renomeado no topo',
  /id="btn-formas"[^>]*>Formas de controlar melhor a operação</.test(dom));
checar('botao formas mantem fallback de ancora #funcoes (sem JS)',
  /href="#funcoes" id="btn-formas"/.test(dom));
checar('painel #formas criado oculto por padrao', /id="formas" hidden[="">]/.test(dom));
checar('blocos do painel: novidades oculto e funcoes pronto',
  /id="painel-novidades" hidden[="">]/.test(dom) && /id="painel-funcoes"/.test(dom));

const trechoNovidades = (() => {
  const p = dom.split('id="lista-novidades"')[1];
  return p ? p.split('id="painel-funcoes"')[0] : '';
})();
const cartoesNovPainel = (trechoNovidades.match(/<article /g) || []).length;
checar('painel espelha os 15 cards de #novidades',
  cartoesNovPainel === 15 && !/revelar/.test(trechoNovidades),
  'cartoes: ' + cartoesNovPainel);

const trechoPainel = (() => {
  const p = dom.split('id="lista-formas"')[1];
  return p ? p.split('</section>')[0] : '';
})();
const cartoesPainel = (trechoPainel.match(/<article /g) || []).length;
checar('painel espelha as 15 funcoes de #funcoes',
  cartoesPainel === 15 && !/revelar/.test(trechoPainel),
  'cartoes: ' + cartoesPainel);

// --- visão geral movida para o topo / opção "Baixar PDF" removida ---
checar('opcao Baixar PDF removida da pagina',
  !/Baixar PDF/.test(dom) && !/Baixar apresentação em PDF/.test(dom) &&
  !/Review-6\.1514\.pdf/.test(dom));
const iVisao = dom.indexOf('id="visao-geral"');
const iFormas = dom.indexOf('id="formas"');
const iNovidades = dom.indexOf('id="novidades"');
checar('visao geral no topo (antes do painel e das secoes), id unico',
  iVisao > -1 && iVisao < iFormas && iFormas < iNovidades &&
  dom.split('id="visao-geral"').length === 2,
  'visao: ' + iVisao + ' | formas: ' + iFormas + ' | novidades: ' + iNovidades);
checar('contadores 225/130/87/5 subiram para o topo',
  iVisao > -1 && iVisao < iFormas &&
  /data-contador="225"/.test(dom) && /data-contador="130"/.test(dom) &&
  /data-contador="87"/.test(dom) && /data-contador="5"/.test(dom));
checar('seta do topo agora aponta para novidades',
  /class="seta-baixo" href="#novidades"/.test(dom));
checar('menu mantem link para visao-geral',
  /href="#visao-geral">Visão geral</.test(dom));

// --- funções em grid de 4 por linha (cards 10 em diante menos longos) ---
checar('lista de funcoes em grid de 4 (cards-4)',
  /<div class="lista-cards cards-4">/.test(dom));
checar('painel de funcoes espelha o grid de 4',
  /class="lista-cards cards-4" id="lista-formas"/.test(dom));
checar('lista de novidades mantida no layout original (sem cards-4)',
  /<div class="lista-cards">/.test(dom));
const cssCards = require('fs').readFileSync(__dirname + '/site/css/style.css', 'utf8');
checar('CSS: grid repeat(4, 1fr) com gap menor (engordar cards)',
  /\.lista-cards\.cards-4\s*\{[^}]*grid-template-columns:\s*repeat\(4,\s*1fr\)[^}]*\}/.test(cssCards) &&
  /\.lista-cards\.cards-4\s*\{[^}]*gap:\s*14px/.test(cssCards));
checar('funcoes/painel com container largo (cards deixam de ser finos)',
  /#funcoes \.container,\s*#formas \.container\s*\{[^}]*max-width:\s*1320px/.test(cssCards));
checar('numero flutuante: texto do card usa a largura toda (nao comprido)',
  /\.card-funcao\s*\{\s*display:\s*block/.test(cssCards) &&
  /\.card-funcao \.num\s*\{[^}]*float:\s*left[^}]*width:\s*42px/.test(cssCards));
checar('4 colunas so a partir de 1201px (abaixo vira 3)',
  /@media \(max-width: 1200px\)\s*\{\s*\.lista-cards\.cards-4\s*\{\s*grid-template-columns:\s*repeat\(3,\s*1fr\)/.test(cssCards));

// --- novas utilidades do Untitled-2 (cards 11 a 15) ---
checar('5 utilidades do Untitled-2 incluidas em #funcoes',
  /num">11</.test(dom) && /AlterAgente/.test(dom) &&
  /num">12</.test(dom) && /Conferência de Expedição/.test(dom) &&
  /num">13</.test(dom) && /Controle de Entrega e Expedição/.test(dom) &&
  /num">14</.test(dom) && /Cotação de preços com pedidos de compra/.test(dom) &&
  /num">15</.test(dom) && /Reajuste de preços por fórmula/.test(dom));

// --- animação dos contadores (com nova tentativa: o headless às vezes
//     esgota o orçamento de tempo virtual antes do fallback de 1500ms) ---
let contadorOk = /data-contador="225">225</.test(dom);
if (!contadorOk) {
  try {
    dom = execFileSync(CHROME, [
      '--headless=new', '--disable-gpu', '--no-sandbox',
      '--window-size=1280,2600',
      '--virtual-time-budget=8000', '--dump-dom', html
    ], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
    contadorOk = /data-contador="225">225</.test(dom);
  } catch (e) { /* mantém false */ }
}
checar('contador 225 animou até o valor final', contadorOk);

// --- revelações na tela (IntersectionObserver funcionando) ---
const revelar = qtd(/class="[^"]*\brevelar\b/g);
const visivel = qtd(/class="[^"]*\bvisivel\b/g);
checar('animações disparando (visivel > 0)', visivel > 0,
  'revelar: ' + revelar + ', visivel: ' + visivel);

// --- imagens referenciadas existem ---
const fs = require('fs');
const imgs = [...dom.matchAll(/<img src="([^"]+)"/g)].map(m => m[1]);
const faltando = imgs.filter(i => !fs.existsSync(__dirname + '/site/' + i));
checar('todas as imagens existem', faltando.length === 0,
  faltando.length ? 'faltando: ' + faltando.join(', ') : imgs.length + ' imagens');

console.log(falhas === 0 ? '\nTODOS OS TESTES PASSARAM' : '\n' + falhas + ' FALHA(S)');
process.exit(falhas === 0 ? 0 : 1);
