# ✅ CheckListo — Guia do Projeto

Bem-vindo(a) ao **CheckListo**! Este projeto foi construído com a tríade fundamental do desenvolvimento web (**HTML, CSS e JavaScript puro**), sem bibliotecas externas, para que você consiga enxergar exatamente como cada peça funciona.

---

## 🗂️ Estrutura dos Arquivos

O projeto está dividido em **3 arquivos principais**, cada um com uma única responsabilidade (um conceito importante chamado *Separação de Responsabilidades*):

```text
checklisto/
├── index.html   → Estrutura (O esqueleto da página)
├── style.css    → Estilo (Glassmorphism & Aurora)
├── script.js    → Comportamento (Lógica de adicionar, concluir e remover)
├── sons.js      → Módulo de áudio (Efeitos "Cristal & Zen" via Web Audio API)
├── server.js    → Servidor local simples (Node.js) para rodar no navegador
└── README.md    → Documentação explicativa do projeto
```

### 1. `index.html` (A Estrutura)
Define **o que** aparece na tela usando marcações (*tags*):
- `<form id="form-tarefa">`: Agrupa o campo de texto (`<input>`) e o botão de envio (`<button>`).
- `<ul id="lista-tarefas">`: Uma lista inicialmente vazia onde o JavaScript insere cada tarefa criada.
- No final do arquivo, a tag `<script src="script.js"></script>` conecta a lógica à página.

### 2. `style.css` (O Visual)
Define **como** os elementos se parecem:
- Usa **Flexbox** (`display: flex`) para alinhar o campo de texto ao lado do botão e posicionar o botão "Remover" à direita de cada tarefa.
- Possui a classe `.concluida`, que risca o texto (`text-decoration: line-through`) e muda a cor de fundo quando uma atividade é marcada como feita.

### 3. `script.js` (A Lógica)
Define **como a aplicação funciona** e está organizado em 6 blocos:
1. **Seleção de Elementos (DOM):** Conecta o JavaScript aos elementos do HTML usando `document.getElementById(...)`.
2. **Estado (`tarefas`):** Uma lista (Array) na memória onde cada tarefa é um objeto no formato `{ id, texto, concluida }`.
3. **Funções Principais:**
   - `adicionarTarefa`: Cria um novo objeto de tarefa e o coloca na lista.
   - `alternarConclusao`: Marca ou desmarca uma tarefa como concluída.
   - `removerTarefa`: Filtra a lista removendo a tarefa escolhida.
4. **Renderização (`renderizarTarefas`):** Lê a lista `tarefas` e cria os elementos visuais (`<li>`, `<input type="checkbox">`, `<button>`) na tela.
5. **Persistência (`localStorage`):** Salva as tarefas no próprio navegador para que elas não sumam quando você atualizar ou fechar a página.
6. **Eventos:** Escuta o envio do formulário e os cliques nos botões.

---

## 🚀 Como Executar

Como utilizamos tecnologias nativas da Web, você não precisa instalar nada:
1. Abra a pasta `c:\workspace\checklisto` no seu computador.
2. Dê um **duplo clique** no arquivo `index.html` para abri-lo em qualquer navegador (ou execute `node server.js` e acesse `http://localhost:3000`).
