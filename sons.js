// ============================================================================
// MÓDULO DE ÁUDIO: EFEITOS "CRISTAL & ZEN" + MÚSICA "CAIXINHA DE MÚSICA / HARPA"
// ============================================================================
// Como funciona este arquivo:
// 1. Efeitos de clique (Cristal & Zen): toques curtos ao interagir com tarefas.
// 2. Música de Fundo (Caixinha de Música / Kalimbá): notas dedilhadas uma a uma
//    formando uma melodia suave e nostálgica (estilo Studio Ghibli), sem sons
//    contínuos de sintetizador.
// ============================================================================

let contextoAudio = null;
let somAtivo = carregarPreferenciaSom();

// Variáveis que controlam a Caixinha de Música (Modo Foco)
let ambienteAtivo = false; // Começa desligado por padrão
let intervaloMusica = null;
let passoAtual = 0;

// Frequências das notas musicais (em Hz) para facilitar a leitura da partitura
const NOTAS = {
  La3: 220.00, Do4: 261.63, Re4: 293.66, Mi4: 329.63, Fa4: 349.23, Sol4: 392.00, La4: 440.00, Si4: 493.88,
  Do5: 523.25, Re5: 587.33, Mi5: 659.25, Fa5: 698.46, Sol5: 783.99, La5: 880.00
};

// Melodia dedilhada passo a passo (cada item tem a nota da melodia e, no início do compasso, um bordão suave da harpa)
const PARTITURA_HARPA = [
  // Compasso 1 (Dó Maior)
  { melodia: NOTAS.Mi5, baixo: NOTAS.Do4 },
  { melodia: NOTAS.Sol4 },
  { melodia: NOTAS.Do5 },
  { melodia: NOTAS.Mi5 },
  { melodia: NOTAS.Sol5, baixo: NOTAS.Mi4 },
  { melodia: NOTAS.Mi5 },
  { melodia: NOTAS.Do5 },
  { melodia: NOTAS.Sol4 },

  // Compasso 2 (Lá menor)
  { melodia: NOTAS.Mi5, baixo: NOTAS.La3 },
  { melodia: NOTAS.La4 },
  { melodia: NOTAS.Do5 },
  { melodia: NOTAS.Mi5 },
  { melodia: NOTAS.Re5, baixo: NOTAS.Do4 },
  { melodia: NOTAS.Do5 },
  { melodia: NOTAS.La4 },
  { melodia: NOTAS.Mi4 },

  // Compasso 3 (Fá Maior)
  { melodia: NOTAS.Do5, baixo: NOTAS.Fa4 },
  { melodia: NOTAS.Fa4 },
  { melodia: NOTAS.La4 },
  { melodia: NOTAS.Do5 },
  { melodia: NOTAS.Mi5, baixo: NOTAS.La3 },
  { melodia: NOTAS.Do5 },
  { melodia: NOTAS.La4 },
  { melodia: NOTAS.Fa4 },

  // Compasso 4 (Sol Maior preparando retorno suave)
  { melodia: NOTAS.Re5, baixo: NOTAS.Sol4 },
  { melodia: NOTAS.Sol4 },
  { melodia: NOTAS.Si4 },
  { melodia: NOTAS.Re5 },
  { melodia: NOTAS.Mi5, baixo: NOTAS.Sol4 },
  { melodia: NOTAS.Re5 },
  { melodia: NOTAS.Si4 },
  { melodia: NOTAS.Sol4 }
];

/**
 * Inicializa (ou recupera) o sintetizador de áudio do navegador.
 */
function obterContextoAudio() {
  if (!contextoAudio) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    contextoAudio = new AudioCtx();
  }
  if (contextoAudio.state === 'suspended') {
    contextoAudio.resume();
  }
  return contextoAudio;
}

/**
 * Toca uma nota com timbre de sino de cristal (para os efeitos de clique).
 */
function tocarSinoCristal(frequencia, duracao, atraso = 0, volume = 0.14) {
  if (!somAtivo) return;

  const ctx = obterContextoAudio();
  const inicio = ctx.currentTime + atraso;

  // 1. Oscilador principal (corpo do som do cristal)
  const oscPrincipal = ctx.createOscillator();
  const ganhoPrincipal = ctx.createGain();

  oscPrincipal.type = 'sine';
  oscPrincipal.frequency.setValueAtTime(frequencia, inicio);

  ganhoPrincipal.gain.setValueAtTime(0.0001, inicio);
  ganhoPrincipal.gain.linearRampToValueAtTime(volume, inicio + 0.015);
  ganhoPrincipal.gain.exponentialRampToValueAtTime(0.0001, inicio + duracao);

  oscPrincipal.connect(ganhoPrincipal);
  ganhoPrincipal.connect(ctx.destination);

  oscPrincipal.start(inicio);
  oscPrincipal.stop(inicio + duracao);

  // 2. Oscilador harmônico (dá o brilho acústico de vidro)
  const oscBrilho = ctx.createOscillator();
  const ganhoBrilho = ctx.createGain();

  oscBrilho.type = 'sine';
  oscBrilho.frequency.setValueAtTime(frequencia * 2.5, inicio);

  ganhoBrilho.gain.setValueAtTime(0.0001, inicio);
  ganhoBrilho.gain.linearRampToValueAtTime(volume * 0.22, inicio + 0.01);
  ganhoBrilho.gain.exponentialRampToValueAtTime(0.0001, inicio + duracao * 0.55);

  oscBrilho.connect(ganhoBrilho);
  ganhoBrilho.connect(ctx.destination);

  oscBrilho.start(inicio);
  oscBrilho.stop(inicio + duracao * 0.55);
}

// ============================================================================
// EFEITOS SONOROS DE CADA AÇÃO DA LISTA
// ============================================================================

function tocarSomAdicionar() {
  tocarSinoCristal(587.33, 0.35, 0, 0.12);    // Ré (D5)
  tocarSinoCristal(880.00, 0.50, 0.08, 0.14); // Lá (A5)
}

function tocarSomConcluir() {
  tocarSinoCristal(523.25, 0.45, 0.00, 0.12); // Dó (C5)
  tocarSinoCristal(659.25, 0.50, 0.08, 0.13); // Mi (E5)
  tocarSinoCristal(783.99, 0.55, 0.16, 0.14); // Sol (G5)
  tocarSinoCristal(1046.50, 0.85, 0.24, 0.16); // Dó agudo (C6)
}

function tocarSomDesmarcar() {
  tocarSinoCristal(659.25, 0.28, 0, 0.09);    // Mi (E5)
  tocarSinoCristal(523.25, 0.35, 0.07, 0.09); // Dó (C5)
}

function tocarSomRemover() {
  tocarSinoCristal(440.00, 0.32, 0, 0.12);    // Lá (A4)
  tocarSinoCristal(293.66, 0.48, 0.08, 0.12); // Ré grave (D4)
}

// ============================================================================
// MÚSICA DE FUNDO: CAIXINHA DE MÚSICA & HARPA DEDILHADA
// ============================================================================

/**
 * Toca uma única nota dedilhada (ataque rápido de harpa/kalimbá e ressonância suave).
 */
function tocarNotaDedilhada(frequencia, volume, duracao) {
  const ctx = obterContextoAudio();
  const agora = ctx.currentTime;

  // Nota fundamental (aveludada)
  const osc = ctx.createOscillator();
  const ganho = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(frequencia, agora);

  // Envelope de corda dedilhada (sobe em 0.01s e cai suavemente como harpa)
  ganho.gain.setValueAtTime(0.0001, agora);
  ganho.gain.linearRampToValueAtTime(volume, agora + 0.012);
  ganho.gain.exponentialRampToValueAtTime(volume * 0.25, agora + 0.22);
  ganho.gain.exponentialRampToValueAtTime(0.0001, agora + duracao);

  osc.connect(ganho);
  ganho.connect(ctx.destination);

  osc.start(agora);
  osc.stop(agora + duracao);

  // Toque de brilho de caixinha de música (uma oitava acima, bem curtinho)
  const oscPonte = ctx.createOscillator();
  const ganhoPonte = ctx.createGain();

  oscPonte.type = 'sine';
  oscPonte.frequency.setValueAtTime(frequencia * 2, agora);

  ganhoPonte.gain.setValueAtTime(0.0001, agora);
  ganhoPonte.gain.linearRampToValueAtTime(volume * 0.18, agora + 0.008);
  ganhoPonte.gain.exponentialRampToValueAtTime(0.0001, agora + 0.18);

  oscPonte.connect(ganhoPonte);
  ganhoPonte.connect(ctx.destination);

  oscPonte.start(agora);
  oscPonte.stop(agora + 0.18);
}

/**
 * Executa o próximo passo da partitura da Caixinha de Música.
 */
function tocarProximoPassoMusica() {
  if (!ambienteAtivo) return;

  const compasso = PARTITURA_HARPA[passoAtual];
  passoAtual = (passoAtual + 1) % PARTITURA_HARPA.length;

  if (compasso.melodia) {
    tocarNotaDedilhada(compasso.melodia, 0.075, 1.35);
  }
  if (compasso.baixo) {
    tocarNotaDedilhada(compasso.baixo, 0.055, 1.80);
  }
}

/**
 * Liga ou desliga a Caixinha de Música / Harpa Dedilhada.
 */
function alternarAmbiente() {
  ambienteAtivo = !ambienteAtivo;

  if (ambienteAtivo) {
    passoAtual = 0;
    tocarProximoPassoMusica();
    // Dedilha uma nota a cada 380ms (andamento calmo e relaxante)
    intervaloMusica = setInterval(tocarProximoPassoMusica, 380);
  } else {
    if (intervaloMusica) {
      clearInterval(intervaloMusica);
      intervaloMusica = null;
    }
  }

  return ambienteAtivo;
}

// ============================================================================
// CONTROLE DOS EFEITOS SONOROS (LIGAR / DESLIGAR CLIQUES)
// ============================================================================

function alternarSom() {
  somAtivo = !somAtivo;
  localStorage.setItem('checklisto_som_ativo', JSON.stringify(somAtivo));

  if (somAtivo) {
    tocarSinoCristal(783.99, 0.40, 0, 0.12);
  }
  return somAtivo;
}

function carregarPreferenciaSom() {
  const salvo = localStorage.getItem('checklisto_som_ativo');
  if (salvo !== null) {
    return JSON.parse(salvo);
  }
  return true;
}
