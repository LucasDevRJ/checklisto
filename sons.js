// ============================================================================
// MÓDULO DE ÁUDIO: TEMA "CRISTAL & ZEN" (Web Audio API)
// ============================================================================
// Como criamos o som de sinos de cristal sem precisar de arquivos .mp3:
// 1. Usamos ondas senoidais puras ('sine'), que são as mais limpas e suaves.
// 2. Combinamos a nota principal com um "harmônico" (uma nota mais aguda bem
//    baixinha ao fundo), o que imita o brilho acústico do vidro/cristal.
// 3. Aplicamos um decaimento longo (reverberação natural) no volume.
// ============================================================================

let contextoAudio = null;
let somAtivo = carregarPreferenciaSom();

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
 * @param {number} frequencia - Frequência da nota em Hz
 * @param {number} duracao    - Tempo de ressonância em segundos
 * @param {number} atraso     - Espera antes de tocar (para dedilhar acordes)
 * @param {number} volume     - Intensidade do som (0.0 a 1.0)
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

  // Ataque suave de vidro e cauda longa de ressonância Zen
  ganhoPrincipal.gain.setValueAtTime(0.0001, inicio);
  ganhoPrincipal.gain.linearRampToValueAtTime(volume, inicio + 0.015);
  ganhoPrincipal.gain.exponentialRampToValueAtTime(0.0001, inicio + duracao);

  oscPrincipal.connect(ganhoPrincipal);
  ganhoPrincipal.connect(ctx.destination);

  oscPrincipal.start(inicio);
  oscPrincipal.stop(inicio + duracao);

  // 2. Oscilador harmônico (uma oitava e quinta acima, bem suave, dando o "brilho" do vidro)
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
// EFEITOS SONOROS DE CADA AÇÃO DA LISTA (Escala Pentatônica Zen)
// ============================================================================

/**
 * Som ao ADICIONAR uma tarefa: gota de cristal ascendente (Ré5 -> Lá5)
 */
function tocarSomAdicionar() {
  tocarSinoCristal(587.33, 0.35, 0, 0.12);    // Ré (D5)
  tocarSinoCristal(880.00, 0.50, 0.08, 0.14); // Lá (A5)
}

/**
 * Som ao CONCLUIR uma tarefa: carrilhão de vento / harpa de cristal
 */
function tocarSomConcluir() {
  tocarSinoCristal(523.25, 0.45, 0.00, 0.12); // Dó (C5)
  tocarSinoCristal(659.25, 0.50, 0.08, 0.13); // Mi (E5)
  tocarSinoCristal(783.99, 0.55, 0.16, 0.14); // Sol (G5)
  tocarSinoCristal(1046.50, 0.85, 0.24, 0.16); // Dó agudo (C6) com longa ressonância
}

/**
 * Som ao DESMARCAR uma tarefa concluída: brisa suave descendente
 */
function tocarSomDesmarcar() {
  tocarSinoCristal(659.25, 0.28, 0, 0.09);    // Mi (E5)
  tocarSinoCristal(523.25, 0.35, 0.07, 0.09); // Dó (C5)
}

/**
 * Som ao REMOVER uma tarefa: tigela tibetana mais grave e serena (Lá4 -> Ré4)
 */
function tocarSomRemover() {
  tocarSinoCristal(440.00, 0.32, 0, 0.12);    // Lá (A4)
  tocarSinoCristal(293.66, 0.48, 0.08, 0.12); // Ré grave (D4)
}

// ============================================================================
// CONTROLE DE LIGAR / DESLIGAR O SOM
// ============================================================================

function alternarSom() {
  somAtivo = !somAtivo;
  localStorage.setItem('checklisto_som_ativo', JSON.stringify(somAtivo));

  // Se acabou de ativar o som, toca um sino suave de confirmação
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
  return true; // Começa com o som ligado por padrão
}
