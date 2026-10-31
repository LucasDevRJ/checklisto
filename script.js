// ============================================================================
// 1. SELEÇÃO DOS ELEMENTOS DA PÁGINA (DOM)
// Aqui guardamos em variáveis as referências para os elementos do HTML
// ============================================================================
const formulario = document.getElementById('form-tarefa');
const inputTarefa = document.getElementById('input-tarefa');
const listaTarefas = document.getElementById('lista-tarefas');
const mensagemVazia = document.getElementById('mensagem-vazia');
const contadorTotal = document.getElementById('contador-total');
const contadorConcluidas = document.getElementById('contador-concluidas');
const botaoSom = document.getElementById('botao-som');
const botaoAmbiente = document.getElementById('botao-ambiente');

// ============================================================================
// 2. ESTADO DA APLICAÇÃO (Onde os dados ficam guardados)
// Cada tarefa será um objeto com: { id, texto, concluida }
// Tentamos carregar tarefas salvas no navegador (localStorage) ou começamos com []
// ============================================================================
let tarefas = carregarTarefasSalvas();

// ============================================================================
// 3. FUNÇÕES PRINCIPAIS (Adicionar, Concluir, Remover e Salvar)
// ============================================================================

/**
 * Cria uma nova tarefa e adiciona na nossa lista de dados.
 */
function adicionarTarefa(textoDigitado) {
  const novaTarefa = {
    id: Date.now(), // Gera um identificador único baseado no horário atual
    texto: textoDigitado,
    concluida: false
  };

  tarefas.push(novaTarefa);
  salvarTarefas();
  renderizarTarefas();
  tocarSomAdicionar();
}

/**
 * Alterna o estado de uma tarefa entre concluída (true) e pendente (false).
 */
function alternarConclusao(idDaTarefa) {
  let ficouConcluida = false;

  tarefas = tarefas.map(function (tarefa) {
    if (tarefa.id === idDaTarefa) {
      ficouConcluida = !tarefa.concluida;
      return {
        id: tarefa.id,
        texto: tarefa.texto,
        concluida: ficouConcluida // Inverte o valor atual
      };
    }
    return tarefa;
  });

  salvarTarefas();
  renderizarTarefas();

  if (ficouConcluida) {
    tocarSomConcluir();
  } else {
    tocarSomDesmarcar();
  }
}

/**
 * Remove uma tarefa da lista usando o seu identificador (id).
 */
function removerTarefa(idDaTarefa) {
  tarefas = tarefas.filter(function (tarefa) {
    return tarefa.id !== idDaTarefa;
  });

  salvarTarefas();
  renderizarTarefas();
  tocarSomRemover();
}

// ============================================================================
// 4. ATUALIZAÇÃO DA INTERFACE VISUAL (Renderização)
// Transforma os dados da variável `tarefas` em elementos visuais no HTML
// ============================================================================

function renderizarTarefas() {
  // Limpa a lista visual antes de recriar os itens
  listaTarefas.innerHTML = '';

  // Mostra ou esconde a mensagem de "Nenhuma tarefa"
  if (tarefas.length === 0) {
    mensagemVazia.classList.remove('escondido');
  } else {
    mensagemVazia.classList.add('escondido');
  }

  // Para cada tarefa na nossa lista de dados, criamos um item <li> no HTML
  tarefas.forEach(function (tarefa) {
    const itemLista = document.createElement('li');
    itemLista.className = 'item-tarefa';
    if (tarefa.concluida) {
      itemLista.classList.add('concluida');
    }

    // Área clicável com a caixinha de seleção (checkbox) e o texto
    const conteudo = document.createElement('label');
    conteudo.className = 'conteudo-tarefa';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'checkbox-tarefa';
    checkbox.checked = tarefa.concluida;
    checkbox.addEventListener('change', function () {
      alternarConclusao(tarefa.id);
    });

    const texto = document.createElement('span');
    texto.className = 'texto-tarefa';
    texto.textContent = tarefa.texto;

    conteudo.appendChild(checkbox);
    conteudo.appendChild(texto);

    // Botão para excluir a atividade
    const botaoRemover = document.createElement('button');
    botaoRemover.type = 'button';
    botaoRemover.className = 'botao-remover';
    botaoRemover.textContent = 'Remover';
    botaoRemover.addEventListener('click', function () {
      removerTarefa(tarefa.id);
    });

    // Monta o item completo e adiciona na lista <ul>
    itemLista.appendChild(conteudo);
    itemLista.appendChild(botaoRemover);
    listaTarefas.appendChild(itemLista);
  });

  atualizarContadores();
}

/**
 * Atualiza os números de "Total" e "Concluídas" no topo da lista.
 */
function atualizarContadores() {
  const total = tarefas.length;
  const concluidas = tarefas.filter(function (tarefa) {
    return tarefa.concluida;
  }).length;

  contadorTotal.textContent = 'Total: ' + total;
  contadorConcluidas.textContent = 'Concluídas: ' + concluidas;
}

// ============================================================================
// 5. PERSISTÊNCIA DE DADOS (Salvar e carregar do navegador)
// ============================================================================

function salvarTarefas() {
  localStorage.setItem('minhas_tarefas', JSON.stringify(tarefas));
}

function carregarTarefasSalvas() {
  const dadosSalvos = localStorage.getItem('minhas_tarefas');
  if (dadosSalvos) {
    return JSON.parse(dadosSalvos);
  }
  return [];
}

// ============================================================================
// 6. EVENTOS E INICIALIZAÇÃO
// ============================================================================

// Quando o usuário envia o formulário (clica em "Adicionar" ou aperta Enter)
formulario.addEventListener('submit', function (evento) {
  evento.preventDefault(); // Evita que a página recarregue

  const textoLimpo = inputTarefa.value.trim();
  if (textoLimpo !== '') {
    adicionarTarefa(textoLimpo);
    inputTarefa.value = ''; // Limpa o campo de texto
    inputTarefa.focus();    // Devolve o cursor para o campo
  }
});

// Atualiza o texto e estilo do botão de som (🔊 Som / 🔇 Mudo)
function atualizarBotaoSom() {
  if (somAtivo) {
    botaoSom.textContent = '🔊 Som';
    botaoSom.classList.remove('mudo');
  } else {
    botaoSom.textContent = '🔇 Mudo';
    botaoSom.classList.add('mudo');
  }
}

botaoSom.addEventListener('click', function () {
  alternarSom();
  atualizarBotaoSom();
});

// Controla o botão de som ambiente (🎵 Foco: Aurora Zen)
botaoAmbiente.addEventListener('click', function () {
  const ligado = alternarAmbiente();
  if (ligado) {
    botaoAmbiente.textContent = '🎵 Foco: On';
    botaoAmbiente.classList.remove('mudo');
    botaoAmbiente.classList.add('ativo-aurora');
  } else {
    botaoAmbiente.textContent = '🎵 Foco: Off';
    botaoAmbiente.classList.add('mudo');
    botaoAmbiente.classList.remove('ativo-aurora');
  }
});

// Inicializa o visual do botão de som e desenha as tarefas na tela
atualizarBotaoSom();
renderizarTarefas();
