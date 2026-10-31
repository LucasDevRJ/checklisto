// ============================================================================
// MÓDULO DE ÁUDIO: EFEITOS "CRISTAL & ZEN" + MODO FOCO "AURORA ZEN"
// ============================================================================
// Como funciona este arquivo:
// 1. Efeitos de clique (Cristal & Zen): ondas senoidais curtas com harmônicos.
// 2. Música Ambiente (Aurora Zen): acordes atmosféricos longos e suaves
//    passando por um filtro passa-baixa (lowpass) para criar um som aveludado
//    que ajuda na concentração sem distrair.
// ============================================================================

let contextoAudio = null;
let somAtivo = carregarPreferenciaSom();

// Variáveis que controlam a música de fundo (Modo Foco)
let ambienteAtivo = false; // Começa desligado por padrão (boa prática de UX)
let intervaloAmbiente = null;
let osciladoresAmbiente = [];
let indiceAcordeAtual = 0;

// Progressão de acordes relaxantes (Dó com 9ª -> Fá com 7ªM -> Lá menor 7 -> Sol 6)
const ACORDES_AURORA = [
  [130.81, 196.00, 246.94, 293.66], // Cmaj9 (Dó3, Sol3, Si3, Ré4)
  [174.61, 220.00, 261.63, 329.63], // Fmaj7 (Fá3, Lá3, Dó4, Mi4)
  [110.00, 164.81, 220.00, 261.63], // Am7   (Lá2, Mi3, Lá3, Dó4)
  [146.83, 196.00, 246.94, 329.63]  // G6    (Ré3, Sol3, Si3, Mi4)
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
 * Toca uma nota com timbre de sino de cristal (nota base + brilho harmônico).
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
// MÚSICA DE FUNDO: MODO FOCO "AURORA ZEN"
// ============================================================================

/**
 * Toca um acorde atmosférico suave que surge e desaparece lentamente (7 segundos).
 */
function tocarAcordeAurora() {
  if (!ambienteAtivo) return;

  const ctx = obterContextoAudio();
  const agora = ctx.currentTime;
  const duracaoAcorde = 7.2;
  const notas = ACORDES_AURORA[indiceAcordeAtual];
  indiceAcordeAtual = (indiceAcordeAtual + 1) % ACORDES_AURORA.length;

  // Filtro passa-baixa para deixar o som bem quente e aveludado
  const filtroSuave = ctx.createBiquadFilter();
  filtroSuave.type = 'lowpass';
  filtroSuave.frequency.setValueAtTime(650, agora);
  filtroSuave.connect(ctx.destination);

  notas.forEach(function (frequencia, indice) {
    const osc = ctx.createOscillator();
    const ganho = ctx.createGain();

    // Mistura ondas senoidais e triangulares para um timbre de "Pad" espacial
    osc.type = indice % 2 === 0 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(frequencia, agora);

    // Volume bem suave (0.025 por nota) com entrada e saída lentas (respiração)
    ganho.gain.setValueAtTime(0.0001, agora);
    ganho.gain.linearRampToValueAtTime(0.024, agora + 2.8);
    ganho.gain.exponentialRampToValueAtTime(0.0001, agora + duracaoAcorde);

    osc.connect(ganho);
    ganho.connect(filtroSuave);

    osc.start(agora);
    osc.stop(agora + duracaoAcorde);

    osciladoresAmbiente.push({ osc: osc, ganho: ganho });
  });

  // Limpa referências antigas de osciladores que já terminaram
  osciladoresAmbiente = osciladoresAmbiente.slice(-16);
}

/**
 * Liga ou desliga o som ambiente "Aurora Zen".
 */
function alternarAmbiente() {
  ambienteAtivo = !ambienteAtivo;

  if (ambienteAtivo) {
    tocarAcordeAurora();
    // A cada 5.5 segundos inicia o próximo acorde, criando uma transição contínua
    intervaloAmbiente = setInterval(tocarAcordeAurora, 5500);
  } else {
    if (intervaloAmbiente) {
      clearInterval(intervaloAmbiente);
      intervaloAmbiente = null;
    }
    // Suaviza o desligamento das notas que estiverem soando no momento
    if (contextoAudio) {
      const agora = contextoAudio.currentTime;
      osciladoresAmbiente.forEach(function (item) {
        try {
          item.ganho.gain.cancelScheduledValues(agora);
          item.ganho.gain.setValueAtTime(item.ganho.gain.value, agora);
          item.ganho.gain.exponentialRampToValueAtTime(0.0001, agora + 0.4);
          item.osc.stop(agora + 0.45);
        } catch (e) {
          // Ignora osciladores que já finalizaram
        }
      });
      osciladoresAmbiente = [];
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
