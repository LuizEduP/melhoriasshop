/* =========================================================
   Animações — Novidades wShop 6.1514
   O trabalho visual é feito pelo CSS; aqui apenas disparamos
   as classes quando os elementos entram na tela.
   ========================================================= */

/* 1) Faz os elementos surgirem conforme a rolagem da página */
(function () {
  var elementos = document.querySelectorAll('.revelar');

  if (!('IntersectionObserver' in window)) {
    elementos.forEach(function (el) { el.classList.add('visivel'); });
    return;
  }

  var observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('visivel');
        observador.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.15 });

  elementos.forEach(function (el) { observador.observe(el); });
})();

/* 2) Anima os números da visão geral (225, 130, 87 e 5) */
(function () {
  var contadores = document.querySelectorAll('[data-contador]');
  if (!contadores.length) { return; }

  function definirFinal(el) {
    el.textContent = el.getAttribute('data-contador');
  }

  function animar(el) {
    var alvo = parseInt(el.getAttribute('data-contador'), 10);
    var duracao = 1200;
    var inicio = null;

    function passo(tempo) {
      if (inicio === null) { inicio = tempo; }
      var progresso = Math.min((tempo - inicio) / duracao, 1);
      var suavizado = 1 - Math.pow(1 - progresso, 3);
      el.textContent = Math.round(alvo * suavizado);
      if (progresso < 1) {
        requestAnimationFrame(passo);
      }
    }

    requestAnimationFrame(passo);

    /* rede de segurança: se o navegador suspender os quadros
       (aba em segundo plano), o valor final aparece mesmo assim */
    setTimeout(function () { definirFinal(el); }, duracao + 300);
  }

  if (!('IntersectionObserver' in window)) {
    contadores.forEach(definirFinal);
    return;
  }

  var observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (entrada.isIntersecting) {
        animar(entrada.target);
        observador.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.5 });

  contadores.forEach(function (el) { observador.observe(el); });
})();

/* 3) Seção "Todos os ajustes": chips, busca e lista dos 200 processos
      (dados em js/processos.js, extraídos da central de ajuda oficial) */
(function () {
  var lista = document.getElementById('lista-ajuste');
  var chips = document.getElementById('chips-ajuste');
  var busca = document.getElementById('busca-ajuste');
  var contador = document.getElementById('contador-ajuste');

  if (!lista || !window.PROCESSOS_61514) { return; }

  var dados = window.PROCESSOS_61514;
  var tipoAtivo = 'Todos';
  var textoBusca = '';

  var ORDEM = ['Todos', 'Erro', 'Melhoria', 'Legislação', 'Proteção',
    'Novo Recurso', 'Sugestão de melhoria da Usabilidade'];

  function rotuloTipo(t) {
    return t === 'Sugestão de melhoria da Usabilidade' ? 'Usabilidade' : t;
  }

  function classeTipo(t) {
    var mapa = {
      'Erro': 'erro',
      'Melhoria': 'melhoria',
      'Legislação': 'legislacao',
      'Proteção': 'protecao',
      'Novo Recurso': 'novo',
      'Sugestão de melhoria da Usabilidade': 'usabilidade'
    };
    return mapa[t] || 'erro';
  }

  function contar(t) {
    if (t === 'Todos') { return dados.length; }
    return dados.filter(function (p) { return p.tipo === t; }).length;
  }

  /* chips (botões de filtro com a contagem de cada tipo) */
  ORDEM.forEach(function (t) {
    if (t !== 'Todos' && contar(t) === 0) { return; }
    var botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'chip' + (t === tipoAtivo ? ' ativo' : '');
    botao.appendChild(document.createTextNode(rotuloTipo(t)));
    var n = document.createElement('span');
    n.className = 'chip-n';
    n.textContent = contar(t);
    botao.appendChild(n);
    botao.addEventListener('click', function () {
      tipoAtivo = t;
      Array.prototype.forEach.call(chips.querySelectorAll('.chip'), function (c) {
        c.classList.remove('ativo');
      });
      botao.classList.add('ativo');
      renderizar();
    });
    chips.appendChild(botao);
  });

  function renderizar() {
    var q = textoBusca.trim().toLowerCase();
    var visiveis = dados.filter(function (p) {
      if (tipoAtivo !== 'Todos' && p.tipo !== tipoAtivo) { return false; }
      if (!q) { return true; }
      return (p.descricao + ' ' + p.processo + ' ' + p.sistema)
        .toLowerCase().indexOf(q) >= 0;
    });

    lista.textContent = '';

    if (!visiveis.length) {
      var vazio = document.createElement('li');
      vazio.className = 'vazio';
      vazio.textContent = 'Nenhum processo encontrado com esse filtro.';
      lista.appendChild(vazio);
    }

    visiveis.forEach(function (p) {
      var li = document.createElement('li');
      li.className = 'ajuste-item';

      var topo = document.createElement('div');
      topo.className = 'ajuste-topo';

      var proc = document.createElement('span');
      proc.className = 'ajuste-proc';
      proc.textContent = p.processo;

      var badge = document.createElement('span');
      badge.className = 'badge-tipo ' + classeTipo(p.tipo);
      badge.textContent = rotuloTipo(p.tipo);

      topo.appendChild(proc);
      topo.appendChild(badge);

      var desc = document.createElement('p');
      desc.className = 'ajuste-desc';
      desc.textContent = p.descricao;

      li.appendChild(topo);
      li.appendChild(desc);

      if (p.sistema) {
        var sys = document.createElement('p');
        sys.className = 'ajuste-sys';
        sys.textContent = 'Afeta: ' + p.sistema;
        li.appendChild(sys);
      }

      lista.appendChild(li);
    });

    contador.textContent = 'Exibindo ' + visiveis.length +
      ' de ' + dados.length + ' processos';
  }

  busca.addEventListener('input', function () {
    textoBusca = busca.value;
    renderizar();
  });

  renderizar();
})();

/* 4) Botões "Ver novidades" e "Formas de controlar melhor a operação":
      abrem/fecha o painel logo abaixo do topo e trocam o conteúdo
      (novidades ou funções) sem pular a página. Clicar de novo no mesmo
      botão fecha o painel. Sem JavaScript os links continuam levando
      às seções originais (#novidades e #funcoes). */
(function () {
  var painel = document.getElementById('formas');
  if (!painel) { return; }

  var botoes = [
    {
      botao: document.getElementById('btn-novidades'),
      conteudo: document.getElementById('painel-novidades'),
      origem: document.querySelector('#novidades .lista-cards'),
      destino: document.getElementById('lista-novidades')
    },
    {
      botao: document.getElementById('btn-formas'),
      conteudo: document.getElementById('painel-funcoes'),
      origem: document.querySelector('#funcoes .lista-cards'),
      destino: document.getElementById('lista-formas')
    }
  ];

  var abertoPara = null; /* elemento do botão que está com o painel aberto */

  botoes.forEach(function (item) {
    if (!item.botao || !item.conteudo || !item.origem || !item.destino) { return; }

    /* espelha os cards da seção original dentro do painel —
       as seções do corpo da página continuam sendo a fonte única de conteúdo */
    Array.prototype.forEach.call(item.origem.children, function (card) {
      var copia = card.cloneNode(true);
      copia.classList.remove('revelar');
      item.destino.appendChild(copia);
    });

    item.botao.addEventListener('click', function (evento) {
      evento.preventDefault();

      /* mesmo botão de novo → fecha; outro botão → abre/troca o conteúdo */
      abertoPara = (abertoPara === item.botao) ? null : item.botao;

      if (abertoPara) {
        painel.removeAttribute('hidden');
      } else {
        painel.setAttribute('hidden', '');
      }

      botoes.forEach(function (outro) {
        var ativo = abertoPara !== null && abertoPara === outro.botao;
        if (outro.botao) {
          outro.botao.setAttribute('aria-expanded', ativo ? 'true' : 'false');
        }
        if (outro.conteudo) {
          if (ativo) {
            outro.conteudo.removeAttribute('hidden');
          } else {
            outro.conteudo.setAttribute('hidden', '');
          }
        }
      });
    });
  });
})();
