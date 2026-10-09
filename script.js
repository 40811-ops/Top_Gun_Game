/**
 * TOP GUN ARCADE - SISTEMA COMPLETO DE COMBATE AÉREO EXPERT
 * HTML5 Canvas 2D + Web Audio API Sintetizada (Trilha Sonora Synthwave & SFX em Tempo Real)
 * Modos: Campanha (5 Estágios Sequenciais com Chefes) e Sobrevivência (Infinito)
 * Controles de Toque, Sistema de Aquecimento, Barrel Roll e Super Bomba
 */

// --- CARREGAMENTO DE SPRITES DAS NAVES DO JOGADOR (PIXEL ART) ---
const playerSprites = {};

playerSprites.f14 = new Image();
playerSprites.f14.src = 'assets/f14.png';

playerSprites.f22 = new Image();
playerSprites.f22.src = 'assets/f22.png';

playerSprites.fa18 = new Image();
playerSprites.fa18.src = 'assets/fa18.png';

playerSprites.a10 = new Image();
playerSprites.a10.src = 'assets/a10.png';

// Alias de segurança para compatibilidade com referências a su57
playerSprites.su57 = playerSprites.fa18;

// --- CARREGAMENTO DE SPRITES DAS NAVES INIMIGAS (PIXEL ART) ---
const enemySprites = {};

enemySprites.mig21 = new Image();
enemySprites.mig21.src = 'assets/enemies/mig21.png';

enemySprites.mig29 = new Image();
enemySprites.mig29.src = 'assets/enemies/mig29.png';

enemySprites.su57 = new Image();
enemySprites.su57.src = 'assets/enemies/su57.png';

enemySprites.su35 = new Image();
enemySprites.su35.src = 'assets/enemies/su35.png';

enemySprites.b2 = new Image();
enemySprites.b2.src = 'assets/enemies/b2.png';

// --- 1. CONFIGURAÇÕES E DEFINIÇÕES DOS CAÇAS ---
const PLANE_DATA = {
  f14: {
    id: 'f14',
    name: 'F-14 Tomcat',
    role: 'Equilibrado',
    speed: 5.6,
    baseHp: 110,
    fireCooldown: 0.20, // 200ms limitador de cadência
    baseDamage: 24,
    specialName: 'Salvo Phoenix',
    specialCooldown: 12.0,
    statSpeed: 65,
    statArmor: 65,
    statDamage: 70,
    desc: 'Caça lendário da Marinha com asas de geometria variável. Especial [Q]: Dispara salvo devastador de 6 mísseis Phoenix guiados.'
  },
  f22: {
    id: 'f22',
    name: 'F-22 Raptor',
    role: 'Furtivo / Veloz',
    speed: 6.8,
    baseHp: 85,
    fireCooldown: 0.18, // 180ms limitador de cadência
    baseDamage: 28,
    specialName: 'Modo Furtivo',
    specialCooldown: 14.0,
    statSpeed: 95,
    statArmor: 45,
    statDamage: 85,
    desc: 'Dominador aéreo de 5ª geração com canhões de plasma. Especial [Q]: Camuflagem Furtiva (4s invulnerável + dobro de velocidade de tiro).'
  },
  fa18: {
    id: 'fa18',
    name: 'F/A-18 Super Hornet',
    role: 'Multifunção / Ataque',
    speed: 5.2,
    baseHp: 145,
    fireCooldown: 0.20, // 200ms limitador de cadência
    baseDamage: 30,
    specialName: 'Pulso EMP',
    specialCooldown: 13.0,
    statSpeed: 60,
    statArmor: 85,
    statDamage: 80,
    desc: 'Caça naval de alta manobrabilidade e blindagem reforçada. Especial [Q]: Pulso EMP (apaga projéteis e atordoa alvos na área).'
  },
  a10: {
    id: 'a10',
    name: 'A-10 Warthog',
    role: 'Super-Pesado GAU-8',
    speed: 4.3,
    baseHp: 180,
    fireCooldown: 0.19, // 190ms limitador de cadência
    baseDamage: 26,
    specialName: 'Rajada GAU-8',
    specialCooldown: 15.0,
    statSpeed: 40,
    statArmor: 100,
    statDamage: 95,
    desc: 'Tanque voador construído ao redor do canhão rotativo GAU-8 Avenger de 30mm. Especial [Q]: Hiper-rajada incendiária contínua.'
  }
};
// Alias para compatibilidade caso haja salvamentos antigos
PLANE_DATA.su57 = PLANE_DATA.fa18;

// --- DIFICULDADES ---
const DIFFICULTY_MODS = {
  easy: {
    name: 'Recruta',
    hpMult: 0.75,
    bulletSpeedMult: 0.8,
    shootFreqMult: 0.75,
    scoreMult: 1.0,
    playerDamageMult: 0.7
  },
  medium: {
    name: 'Piloto',
    hpMult: 1.0,
    bulletSpeedMult: 1.0,
    shootFreqMult: 1.0,
    scoreMult: 1.5,
    playerDamageMult: 1.0
  },
  hard: {
    name: 'Ás',
    hpMult: 1.3,
    bulletSpeedMult: 1.35,
    shootFreqMult: 1.35,
    scoreMult: 2.0,
    playerDamageMult: 1.3
  },
  nightmare: {
    name: 'Top Gun',
    hpMult: 1.6,
    bulletSpeedMult: 1.55,
    shootFreqMult: 1.65,
    scoreMult: 3.0,
    playerDamageMult: 1.6
  }
};

// --- 5 UPGRADES PERMANENTES DA LOJA ---
const UPGRADE_DATA = {
  armor: {
    id: 'armor',
    name: 'Blindagem Reforçada',
    baseCost: 100,
    mult: 1.55,
    maxLevel: 5,
    desc: '+15% de HP máximo por nível.'
  },
  radiator: {
    id: 'radiator',
    name: 'Radiador de Alta Performance',
    baseCost: 120,
    mult: 1.6,
    maxLevel: 5,
    desc: '-15% de acúmulo de calor da arma por disparo.'
  },
  ammoDepot: {
    id: 'ammoDepot',
    name: 'Depósito de Munições',
    baseCost: 140,
    mult: 1.65,
    maxLevel: 5,
    desc: '+2 Mísseis e +1 Super Bomba de capacidade.'
  },
  thrusters: {
    id: 'thrusters',
    name: 'Propulsores Auxiliares',
    baseCost: 150,
    mult: 1.65,
    maxLevel: 5,
    desc: '-0.4s no tempo de recarga do Barrel Roll.'
  },
  magnet: {
    id: 'magnet',
    name: 'Íman de Moedas',
    baseCost: 80,
    mult: 1.5,
    maxLevel: 5,
    desc: '+40px no raio de atração magnética de ouro e itens.'
  }
};

// --- DEFINIÇÃO DOS 5 ESTÁGIOS DA CAMPANHA E BIOMAS ---
const STAGES = [
  {
    stageNum: 1,
    id: 'ocean',
    name: 'Oceano Aberto',
    subtitle: 'SETOR 1: ÁGUAS PROFUNDAS',
    icon: '[S-01]',
    bossId: 'titan01',
    bossName: 'Titan-01',
    bossTitle: 'Fortaleza Aérea Estratégica',
    briefing: 'Radar detectou uma colossal Fortaleza Aérea "Titan-01" escoltada por caças sobre o Oceano. Elimine a ameaça!',
    nextBriefing: 'Titan-01 neutralizada! Inteligência detecta baterias antiaéreas pesadas fortificando a linha da praia.',
    hazard: 'Tempestades Tropicais e Raios',
    bossScoreTrigger: 1400,
    palette: { bg1: '#091c33', bg2: '#051021', terrain: '#0077b6', detail: '#023e8a' }
  },
  {
    stageNum: 2,
    id: 'coast',
    name: 'Litoral & Praia',
    subtitle: 'SETOR 2: COSTA FORTIFICADA',
    icon: '[S-02]',
    bossId: 'aegisBehemoth',
    bossName: 'Aegis-Behemoth',
    bossTitle: 'Cruzador Anfíbio Blindado',
    briefing: 'Baterias antiaéreas na areia dão cobertura ao Cruzador Anfíbio "Aegis-Behemoth". Destrua suas baterias pesadas!',
    nextBriefing: 'Aegis-Behemoth afundado! Os radares apontam movimentação hostil nas profundezas da densa selva equatorial.',
    hazard: 'Baterias Antiaéreas Costeiras',
    bossScoreTrigger: 1600,
    palette: { bg1: '#0d324d', bg2: '#071f30', terrain: '#d4a373', detail: '#c58b59' }
  },
  {
    stageNum: 3,
    id: 'jungle',
    name: 'Selva Fechada',
    subtitle: 'SETOR 3: FLORESTA TROPICAL',
    icon: '[S-03]',
    bossId: 'jungleHawk',
    bossName: 'Jungle-Hawk',
    bossTitle: 'Super Helicóptero de Ataque',
    briefing: 'Ventos violentos e neblina cobrem a copa das árvores. O Super Helicóptero "Jungle-Hawk" comanda a ofensiva aérea.',
    nextBriefing: 'Jungle-Hawk destruído! As forças inimigas recuaram para as gargantas rochosas do Grande Cânion do Deserto.',
    hazard: 'Névoa e Ventos Laterais',
    bossScoreTrigger: 1800,
    palette: { bg1: '#1b3b22', bg2: '#0f2415', terrain: '#2d6a4f', detail: '#1e4835' }
  },
  {
    stageNum: 4,
    id: 'canyon',
    name: 'Canyon do Deserto',
    subtitle: 'SETOR 4: DESFILADEIROS ÁRIDOS',
    icon: '[S-04]',
    bossId: 'crawlerX',
    bossName: 'Crawler-X',
    bossTitle: 'Tanque Gigante de Cerco',
    briefing: 'Tempestades de areia reduzem a visibilidade. O Tanque Gigante "Crawler-X" avança pelas fendas rochosas com artilharia pesada!',
    nextBriefing: 'Crawler-X em chamas! O comando inimigo ativou o bombardeiro estratégico no espaço aéreo da Megacidade Noturna. É a batalha final!',
    hazard: 'Tempestades de Areia e Rajadas',
    bossScoreTrigger: 2000,
    palette: { bg1: '#4a2c11', bg2: '#2d1808', terrain: '#8d5b28', detail: '#65401b' }
  },
  {
    stageNum: 5,
    id: 'megacity',
    name: 'Megacidade Noturna',
    subtitle: 'SETOR 5: METRÓPOLE NEON (FINAL)',
    icon: '[S-05]',
    bossId: 'b2Spirit',
    bossName: 'B-2 Spirit',
    bossTitle: 'Bombardeiro Estratégico Stealth (CHEFE FINAL)',
    briefing: 'Atenção esquadrão: O CHEFE FINAL Bombardeiro Stealth B-2 Spirit invadiu o espaço aéreo! Possui camuflagem ótica, lasers de fusão e poder de fogo avassalador!',
    nextBriefing: 'VITÓRIA TOTAL! O B-2 Spirit foi abatido e a soberania aérea foi restabelecida!',
    hazard: 'Bombardeio em Massa e Drones',
    bossScoreTrigger: 2200,
    palette: { bg1: '#0d0221', bg2: '#05010d', terrain: '#19053b', detail: '#240046' }
  }
];

// --- 2. GERENCIADOR DE DADOS E PERSISTÊNCIA (StorageManager) ---
class StorageManager {
  static load() {
    let leaderboard = [];
    try {
      leaderboard = JSON.parse(localStorage.getItem('topgun_survival_leaderboard') || '[]');
    } catch (e) {
      leaderboard = [];
    }

    if (!Array.isArray(leaderboard) || leaderboard.length === 0) {
      leaderboard = [
        { rank: 1, score: 18500, plane: 'F-22', kills: 74, date: '02/10/2026' },
        { rank: 2, score: 14200, plane: 'F-14', kills: 58, date: '01/10/2026' },
        { rank: 3, score: 9800, plane: 'A-10', kills: 42, date: '30/09/2026' },
        { rank: 4, score: 6500, plane: 'F/A-18', kills: 29, date: '29/09/2026' },
        { rank: 5, score: 3200, plane: 'F-14', kills: 16, date: '28/09/2026' }
      ];
      localStorage.setItem('topgun_survival_leaderboard', JSON.stringify(leaderboard));
    }

    let upgrades = { armor: 0, radiator: 0, ammoDepot: 0, thrusters: 0, magnet: 0 };
    try {
      const savedUpgrades = JSON.parse(localStorage.getItem('topgun_upgrades') || '{}');
      upgrades = { ...upgrades, ...savedUpgrades };
    } catch (e) {}

    let savedPlane = localStorage.getItem('topgun_plane') || 'f14';
    if (savedPlane === 'su57') savedPlane = 'fa18';

    return {
      gold: parseInt(localStorage.getItem('topgun_gold') || '0', 10),
      highScore: parseInt(localStorage.getItem('topgun_highscore') || '0', 10),
      plane: savedPlane,
      difficulty: localStorage.getItem('topgun_difficulty') || 'medium',
      mode: localStorage.getItem('topgun_mode') || 'campaign',
      upgrades: upgrades,
      leaderboard: leaderboard
    };
  }

  static save(data) {
    localStorage.setItem('topgun_gold', data.gold.toString());
    localStorage.setItem('topgun_highscore', data.highScore.toString());
    localStorage.setItem('topgun_plane', data.plane);
    localStorage.removeItem('topgun_skin'); // limpa a preferência antiga de pintura
    localStorage.setItem('topgun_difficulty', data.difficulty);
    localStorage.setItem('topgun_mode', data.mode);
    localStorage.setItem('topgun_upgrades', JSON.stringify(data.upgrades));
    localStorage.setItem('topgun_survival_leaderboard', JSON.stringify(data.leaderboard));
  }

  static recordSurvivalScore(score, planeName, kills) {
    const data = StorageManager.load();
    const today = new Date().toLocaleDateString('pt-BR');
    data.leaderboard.push({ score, plane: planeName, kills, date: today });
    data.leaderboard.sort((a, b) => b.score - a.score);
    data.leaderboard = data.leaderboard.slice(0, 5);
    data.leaderboard.forEach((item, index) => item.rank = index + 1);
    StorageManager.save(data);
    return data.leaderboard;
  }
}

// --- 3. MOTOR DE ÁUDIO SINTETIZADO E MÚSICA (SoundManager) ---
class SoundManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.musicEnabled = true;
    this.sfxEnabled = true;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;

    this.isPlayingMusic = false;
    this.bpm = 126;
    this.step = 0;
    this.nextNoteTime = 0;
    this.timerId = null;

    this.bassNotes = [
      73.42, 73.42, 73.42, 73.42,
      65.41, 65.41, 65.41, 65.41,
      58.27, 58.27, 58.27, 58.27,
      65.41, 65.41, 73.42, 82.41
    ];
    this.leadNotes = [
      293.66, 329.63, 349.23, 440.0, 523.25, 440.0, 349.23, 329.63,
      293.66, 349.23, 440.0, 587.33, 523.25, 440.0, 349.23, 293.66
    ];
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.35, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.setValueAtTime(this.musicEnabled ? 0.22 : 0, this.ctx.currentTime);
        this.musicGain.connect(this.masterGain);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(this.sfxEnabled ? 0.38 : 0, this.ctx.currentTime);
        this.sfxGain.connect(this.masterGain);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.startMusic();
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.35, this.ctx.currentTime);
    }
    return this.muted;
  }

  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.musicEnabled ? 0.22 : 0, this.ctx.currentTime);
    }
    return this.musicEnabled;
  }

  toggleSfx() {
    this.sfxEnabled = !this.sfxEnabled;
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.sfxEnabled ? 0.38 : 0, this.ctx.currentTime);
    }
    return this.sfxEnabled;
  }

  startMusic() {
    if (this.isPlayingMusic || !this.ctx) return;
    this.isPlayingMusic = true;
    this.step = 0;
    this.nextNoteTime = this.ctx.currentTime + 0.1;
    this.scheduleMusic();
  }

  stopMusic() {
    this.isPlayingMusic = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  scheduleMusic() {
    if (!this.isPlayingMusic || !this.ctx) return;
    const secondsPerBeat = 60.0 / this.bpm;
    const secondsPer16th = secondsPerBeat / 4.0;

    while (this.nextNoteTime < this.ctx.currentTime + 0.15) {
      this.playMusicStep(this.step, this.nextNoteTime);
      this.nextNoteTime += secondsPer16th;
      this.step = (this.step + 1) % 16;
    }

    this.timerId = setTimeout(() => this.scheduleMusic(), 40);
  }

  playMusicStep(step, time) {
    if (!this.ctx || this.muted || !this.musicEnabled) return;

    // Kick
    if (step % 4 === 0) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(130, time);
      osc.frequency.exponentialRampToValueAtTime(32, time + 0.08);

      gain.gain.setValueAtTime(0.32, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(time);
      osc.stop(time + 0.12);
    }

    // Snare
    if (step === 4 || step === 12) {
      const noiseBuffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.1), this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseBuffer.length; i++) output[i] = Math.random() * 2 - 1;

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 1000;

      const snareGain = this.ctx.createGain();
      snareGain.gain.setValueAtTime(0.18, time);
      snareGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

      whiteNoise.connect(filter);
      filter.connect(snareGain);
      snareGain.connect(this.musicGain);

      whiteNoise.start(time);
    }

    // Hi-Hat
    if (step % 2 === 0) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(step % 4 === 2 ? 8000 : 6000, time);

      gain.gain.setValueAtTime(0.035, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(time);
      osc.stop(time + 0.03);
    }

    // Bassline
    const bassFreq = this.bassNotes[step];
    const bassOsc = this.ctx.createOscillator();
    const bassFilter = this.ctx.createBiquadFilter();
    const bassGain = this.ctx.createGain();

    bassOsc.type = 'sawtooth';
    bassOsc.frequency.setValueAtTime(bassFreq, time);

    bassFilter.type = 'lowpass';
    bassFilter.frequency.setValueAtTime(700, time);
    bassFilter.frequency.exponentialRampToValueAtTime(140, time + 0.09);
    bassFilter.Q.value = 4.0;

    bassGain.gain.setValueAtTime(0.2, time);
    bassGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

    bassOsc.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(this.musicGain);

    bassOsc.start(time);
    bassOsc.stop(time + 0.1);

    // Lead Arpeggio
    if (step % 2 === 1) {
      const leadFreq = this.leadNotes[step];
      const leadOsc = this.ctx.createOscillator();
      const leadGain = this.ctx.createGain();

      leadOsc.type = 'triangle';
      leadOsc.frequency.setValueAtTime(leadFreq, time);

      leadGain.gain.setValueAtTime(0.055, time);
      leadGain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

      leadOsc.connect(leadGain);
      leadGain.connect(this.musicGain);

      leadOsc.start(time);
      leadOsc.stop(time + 0.14);
    }
  }

  // --- EFEITOS SONOROS (SFX) ---
  playVulcan() {
    if (!this.ctx || this.muted || !this.sfxEnabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.06);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  playPlasma() {
    if (!this.ctx || this.muted || !this.sfxEnabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(350, now + 0.07);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.07);
  }

  playHeavyCannon() {
    if (!this.ctx || this.muted || !this.sfxEnabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.1);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  playGau8() {
    if (!this.ctx || this.muted || !this.sfxEnabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.linearRampToValueAtTime(80, now + 0.04);

    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  // SFX Barrel Roll (Giro de Esquiva)
  playBarrelRoll() {
    if (!this.ctx || this.muted || !this.sfxEnabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);
    osc.frequency.exponentialRampToValueAtTime(330, now + 0.5);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.5);
  }

  // SFX Super Bomba de Emergência (Estrondo Sísmico Massivo)
  playSuperBomb() {
    if (!this.ctx || this.muted || !this.sfxEnabled) return;
    const now = this.ctx.currentTime;

    // Sub-grave profundo
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 1.2);

    gain.gain.setValueAtTime(0.55, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 1.2);

    // Ruído de choque expansivo
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.9);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(50, now + 0.9);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);
    noise.start(now);
  }

  // Alarme de Emergência Rítmico de Cockpit (HP < 30%)
  playEmergencyBeep() {
    if (!this.ctx || this.muted || !this.sfxEnabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(660, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  // Alarme de Superaquecimento da Arma
  playOverheat() {
    if (!this.ctx || this.muted || !this.sfxEnabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.setValueAtTime(240, now + 0.1);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  playBulletTime() {
    if (!this.ctx || this.muted || !this.sfxEnabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.5);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.5);
  }

  playOverdrive() {
    if (!this.ctx || this.muted || !this.sfxEnabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.4);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.45);
  }

  playRadioChirp() {
    if (!this.ctx || this.muted || !this.sfxEnabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1800, now);
    osc.frequency.setValueAtTime(2200, now + 0.06);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  playMissileLaunch() {
    if (!this.ctx || this.muted || !this.sfxEnabled) return;
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.linearRampToValueAtTime(1600, now + 0.25);
    filter.Q.value = 3;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(now);
  }

  playStealth() {
    if (!this.ctx || this.muted || !this.sfxEnabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.linearRampToValueAtTime(900, now + 0.35);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  playEMP() {
    if (!this.ctx || this.muted || !this.sfxEnabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.6);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.6);
  }

  playCoin() {
    if (!this.ctx || this.muted || !this.sfxEnabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.setValueAtTime(1900, now + 0.05);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  playExplosion(isLarge = false) {
    if (!this.ctx || this.muted || !this.sfxEnabled) return;
    const now = this.ctx.currentTime;
    const duration = isLarge ? 0.7 : 0.35;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isLarge ? 450 : 700, now);
    filter.frequency.exponentialRampToValueAtTime(40, now + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(isLarge ? 0.45 : 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(isLarge ? 120 : 160, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + duration);

    oscGain.gain.setValueAtTime(isLarge ? 0.4 : 0.2, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);

    noise.start(now);
    osc.start(now);
    osc.stop(now + duration);
  }

  playPowerup() {
    if (!this.ctx || this.muted || !this.sfxEnabled) return;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, i) => {
      const now = this.ctx.currentTime + i * 0.055;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.12);
    });
  }

  playWarning() {
    if (!this.ctx || this.muted || !this.sfxEnabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(950, now);
    osc.frequency.setValueAtTime(750, now + 0.08);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  playLaserCharge() {
    if (!this.ctx || this.muted || !this.sfxEnabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 1.2);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 1.1);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 1.2);
  }
}

const sound = new SoundManager();

// --- 4. ALVOS DE SUPERFÍCIE (BATERIAS ANTIAÉREAS NA AREIA, NAVIOS & CONVOIS) ---
class SurfaceTarget {
  constructor(type, x, y) {
    this.type = type; // 'turret', 'warship', 'bunker'
    this.x = x;
    this.y = y;
    this.alive = true;
    this.radius = type === 'warship' ? 36 : 18;
    this.hp = type === 'warship' ? 140 : 45;
    this.maxHp = this.hp;
    this.shootTimer = Math.random() * 2.0 + 1.0;
    this.turretAngle = -Math.PI / 2;
  }

  update(dt, enemyBullets, playerX, playerY, scrollSpeed, bulletSpeedMult) {
    this.y += scrollSpeed * dt * 60;
    const dx = playerX - this.x;
    const dy = playerY - this.y;
    this.turretAngle = Math.atan2(dy, dx);

    this.shootTimer -= dt;
    if (this.shootTimer <= 0 && this.y > 50 && this.y < 900) {
      this.shootTimer = this.type === 'warship' ? 2.2 : 2.8;
      const spd = (this.type === 'warship' ? 4.5 : 4.0) * bulletSpeedMult;
      enemyBullets.push(new EnemyBullet(
        this.x + Math.cos(this.turretAngle) * 16,
        this.y + Math.sin(this.turretAngle) * 16,
        Math.cos(this.turretAngle) * spd,
        Math.sin(this.turretAngle) * spd
      ));
    }
    return this.y <= 1020 && this.alive;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.type === 'warship') {
      ctx.fillStyle = '#263238';
      ctx.beginPath();
      ctx.moveTo(0, -42);
      ctx.lineTo(14, -20);
      ctx.lineTo(14, 38);
      ctx.lineTo(-14, 38);
      ctx.lineTo(-14, -20);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#455a64';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#37474f';
      ctx.fillRect(-8, -12, 16, 32);

      ctx.save();
      ctx.translate(0, -18);
      ctx.rotate(this.turretAngle);
      ctx.fillStyle = '#1c2833';
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#90a4ae';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, -3); ctx.lineTo(16, -3);
      ctx.moveTo(0, 3); ctx.lineTo(16, 3);
      ctx.stroke();
      ctx.restore();
    } else {
      ctx.fillStyle = '#3e2723';
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#4e342e';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#546e7a';
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.rotate(this.turretAngle);
      ctx.fillStyle = '#212121';
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ff9100';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, -2); ctx.lineTo(15, -2);
      ctx.moveTo(0, 2); ctx.lineTo(15, 2);
      ctx.stroke();
      ctx.restore();
    }

    if (this.hp < this.maxHp) {
      const w = this.radius * 1.5;
      const pct = Math.max(0, this.hp / this.maxHp);
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(-w / 2, -this.radius - 8, w, 4);
      ctx.fillStyle = '#ff9100';
      ctx.fillRect(-w / 2, -this.radius - 8, w * pct, 4);
    }
    ctx.restore();
  }
}

// --- 5. CENÁRIO PARALAXE COM SUPORTE AOS 5 ESTÁGIOS ---
class ParallaxBackground {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.stageId = 'ocean';

    this.scrollOffset = 0;
    this.scrollSpeed = 1.0;
    this.islands = [];
    this.surfaceTargets = [];
    this.clouds = [];
    this.foregroundClouds = [];
    this.cityBuildings = [];

    // Suporte a transição suave entre cenários (Dissolução cruzada / Crossfade)
    this.prevStageId = null;
    this.prevIslands = [];
    this.prevCityBuildings = [];
    this.isTransitioning = false;
    this.transitionProgress = 1.0;
    this.transitionDuration = 3.0;

    this.initClouds();
    this.initForegroundClouds();
    this.initCityBuildings();
    this.generateTerrain();
  }

  setStage(stageId, smooth = false, duration = 3.0) {
    if (smooth) {
      this.transitionToStage(stageId, duration);
      return;
    }
    this.stageId = stageId;
    this.isTransitioning = false;
    this.transitionProgress = 1.0;
    this.prevStageId = null;
    this.prevIslands = [];
    this.prevCityBuildings = [];
    this.islands = [];
    this.surfaceTargets = [];
    this.generateTerrain();
    if (stageId === 'megacity') {
      this.initCityBuildings();
    }
  }

  transitionToStage(newStageId, duration = 3.0) {
    if (this.stageId === newStageId && !this.isTransitioning) return;

    // Preserva elementos do cenário anterior para dissolução cruzada fluida
    this.prevStageId = this.stageId;
    this.prevIslands = this.islands.map(is => ({
      x: is.x,
      y: is.y,
      radius: is.radius,
      points: is.points
    }));
    this.prevCityBuildings = this.cityBuildings.map(b => ({ ...b }));

    this.stageId = newStageId;
    this.isTransitioning = true;
    this.transitionProgress = 0;
    this.transitionDuration = duration;

    // Gera o novo terreno preservando alvos terrestres ativos no combate
    this.generateTerrain(true);
    if (newStageId === 'megacity') {
      this.initCityBuildings();
    }
  }

  initClouds() {
    this.clouds = [];
    for (let i = 0; i < 7; i++) {
      this.clouds.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        scale: Math.random() * 0.7 + 0.6,
        alpha: Math.random() * 0.22 + 0.12,
        speed: Math.random() * 0.5 + 1.2
      });
    }
  }

  initForegroundClouds() {
    this.foregroundClouds = [];
    for (let i = 0; i < 4; i++) {
      this.foregroundClouds.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        scale: Math.random() * 0.8 + 1.0,
        alpha: Math.random() * 0.06 + 0.04,
        speed: Math.random() * 0.6 + 2.2
      });
    }
  }

  initCityBuildings() {
    this.cityBuildings = [];
    for (let i = 0; i < 20; i++) {
      this.cityBuildings.push({
        x: Math.random() * (this.width - 60),
        y: (this.height / 10) * i + Math.random() * 40,
        w: Math.random() * 45 + 35,
        h: Math.random() * 90 + 60,
        color: Math.random() > 0.5 ? '#1a0033' : '#0d1b2a',
        neon: Math.random() > 0.5 ? '#00e5ff' : '#d500f9'
      });
    }
  }

  generateTerrain(preserveTargets = false) {
    this.islands = [];
    if (!preserveTargets) {
      this.surfaceTargets = [];
    }

    for (let i = 0; i < 5; i++) {
      const radius = Math.random() * 38 + 32;
      const island = {
        x: Math.random() * (this.width - 140) + 70,
        y: (this.height / 4) * i + Math.random() * 60,
        radius: radius,
        points: this.createBlobPoints(radius)
      };
      this.islands.push(island);

      // Baterias antiaéreas e alvos no terreno
      if (Math.random() > 0.35) {
        const type = (this.stageId === 'ocean' || this.stageId === 'coast') && Math.random() > 0.6 ? 'warship' : 'turret';
        this.surfaceTargets.push(new SurfaceTarget(type, island.x, island.y));
      }
    }
  }

  createBlobPoints(baseRadius) {
    const pts = [];
    const count = 10;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const dist = baseRadius * (0.75 + Math.random() * 0.5);
      pts.push({ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist });
    }
    return pts;
  }

  update(dt, enemyBullets, playerX, playerY, bulletSpeedMult) {
    this.scrollOffset = (this.scrollOffset + this.scrollSpeed * dt * 60) % 60;

    // Atualiza transição suave com dissolução cruzada entre cenários
    if (this.isTransitioning) {
      this.transitionProgress += dt / this.transitionDuration;

      // Mantém os elementos do cenário anterior rolando continuamente sem congelar
      if (this.prevIslands && this.prevIslands.length > 0) {
        for (let is of this.prevIslands) {
          is.y += this.scrollSpeed * dt * 60;
        }
      }
      if (this.prevCityBuildings && this.prevCityBuildings.length > 0) {
        for (let b of this.prevCityBuildings) {
          b.y += 1.4 * dt * 60;
        }
      }

      if (this.transitionProgress >= 1) {
        this.isTransitioning = false;
        this.transitionProgress = 1.0;
        this.prevStageId = null;
        this.prevIslands = [];
        this.prevCityBuildings = [];
      }
    }

    // Nuvens de Fundo
    for (let c of this.clouds) {
      c.y += c.speed * dt * 60;
      if (c.y > this.height + 80) {
        c.y = -80;
        c.x = Math.random() * this.width;
      }
    }

    // Nuvens Frontais Suaves (movimento fluido independente sem solavancos)
    for (let fc of this.foregroundClouds) {
      fc.y += fc.speed * dt * 60;
      if (fc.y > this.height + 120) {
        fc.y = -120;
        fc.x = Math.random() * this.width;
      }
    }

    // Arranha-céus (Megacidade)
    if (this.stageId === 'megacity') {
      for (let b of this.cityBuildings) {
        b.y += 1.4 * dt * 60;
        if (b.y > this.height + 100) {
          b.y = -100;
          b.x = Math.random() * (this.width - 60);
        }
      }
    }

    // Ilhas e Terrenos
    for (let is of this.islands) {
      is.y += this.scrollSpeed * dt * 60;
      if (is.y > this.height + 120) {
        is.y = -100;
        is.x = Math.random() * (this.width - 140) + 70;
        if (Math.random() > 0.4) {
          const type = (this.stageId === 'ocean' || this.stageId === 'coast') && Math.random() > 0.6 ? 'warship' : 'turret';
          this.surfaceTargets.push(new SurfaceTarget(type, is.x, is.y));
        }
      }
    }

    // Alvos terrestres
    for (let i = this.surfaceTargets.length - 1; i >= 0; i--) {
      const st = this.surfaceTargets[i];
      const keep = st.update(dt, enemyBullets, playerX, playerY, this.scrollSpeed, bulletSpeedMult);
      if (!keep) this.surfaceTargets.splice(i, 1);
    }
  }

  drawBiomeBackground(ctx, stageId, islands, buildings, alpha = 1.0) {
    if (alpha <= 0.001) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

    // 1. Fundo do Bioma
    const grad = ctx.createLinearGradient(0, 0, 0, this.height);
    if (stageId === 'ocean') {
      grad.addColorStop(0, '#091c33'); grad.addColorStop(1, '#051021');
    } else if (stageId === 'coast') {
      grad.addColorStop(0, '#0a2540'); grad.addColorStop(1, '#051329');
    } else if (stageId === 'jungle') {
      grad.addColorStop(0, '#102e17'); grad.addColorStop(1, '#07170b');
    } else if (stageId === 'canyon') {
      grad.addColorStop(0, '#4a2c11'); grad.addColorStop(1, '#2d1808');
    } else if (stageId === 'megacity') {
      grad.addColorStop(0, '#0d0221'); grad.addColorStop(1, '#05010d');
    } else {
      grad.addColorStop(0, '#091c33'); grad.addColorStop(1, '#051021');
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Efeito de Linhas de Grade de Terreno / Água
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let y = this.scrollOffset; y < this.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }

    // Arranha-céus (Megacidade)
    if (stageId === 'megacity' && buildings && buildings.length > 0) {
      for (let b of buildings) {
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.strokeStyle = b.neon;
        ctx.lineWidth = 1;
        ctx.strokeRect(b.x, b.y, b.w, b.h);

        // Janelas Neon
        ctx.fillStyle = b.neon;
        for (let wy = b.y + 8; wy < b.y + b.h - 8; wy += 14) {
          ctx.fillRect(b.x + 6, wy, 4, 4);
          ctx.fillRect(b.x + b.w - 10, wy, 4, 4);
        }
      }
    }

    // Ilhas, Dunas de Areia e Terrenos
    if (islands && islands.length > 0) {
      for (let is of islands) {
        ctx.save();
        ctx.translate(is.x, is.y);

        // Borda Costeira / Areia
        ctx.beginPath();
        for (let i = 0; i < is.points.length; i++) {
          const pt = is.points[i];
          if (i === 0) ctx.moveTo(pt.x * 1.15, pt.y * 1.15);
          else ctx.lineTo(pt.x * 1.15, pt.y * 1.15);
        }
        ctx.closePath();

        if (stageId === 'coast') {
          ctx.fillStyle = '#d4a373'; // Areia de praia
        } else if (stageId === 'jungle') {
          ctx.fillStyle = '#1b4332'; // Selva
        } else if (stageId === 'canyon') {
          ctx.fillStyle = '#8d5b28'; // Canyon rochoso
        } else {
          ctx.fillStyle = 'rgba(0, 180, 216, 0.25)'; // Ilha oceânica
        }
        ctx.fill();

        // Centro do Terreno
        ctx.beginPath();
        for (let i = 0; i < is.points.length; i++) {
          const pt = is.points[i];
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.closePath();

        if (stageId === 'coast') {
          ctx.fillStyle = '#c58b59';
        } else if (stageId === 'jungle') {
          ctx.fillStyle = '#2d6a4f';
        } else if (stageId === 'canyon') {
          ctx.fillStyle = '#5d3714';
        } else {
          ctx.fillStyle = '#225a40';
        }
        ctx.fill();

        ctx.restore();
      }
    }

    ctx.restore();
  }

  draw(ctx) {
    if (this.isTransitioning && this.prevStageId) {
      const progress = Math.min(1, Math.max(0, this.transitionProgress));
      // Interpolação suave cúbica (smoothstep) para evitar trocas abruptas
      const smoothT = progress * progress * (3 - 2 * progress);

      // Cenário anterior (fade out progressivo)
      this.drawBiomeBackground(ctx, this.prevStageId, this.prevIslands, this.prevCityBuildings, 1.0 - smoothT);

      // Novo cenário (fade in progressivo em dissolução cruzada)
      this.drawBiomeBackground(ctx, this.stageId, this.islands, this.cityBuildings, smoothT);

      // Brilho atmosférico sutil na transição entre setores
      const glowAlpha = Math.sin(smoothT * Math.PI) * 0.08;
      if (glowAlpha > 0.002) {
        ctx.save();
        ctx.fillStyle = `rgba(255, 255, 255, ${glowAlpha})`;
        ctx.fillRect(0, 0, this.width, this.height);
        ctx.restore();
      }
    } else {
      this.drawBiomeBackground(ctx, this.stageId, this.islands, this.cityBuildings, 1.0);
    }

    // Desenho de Alvos de Superfície
    for (let st of this.surfaceTargets) {
      st.draw(ctx);
    }

    // Nuvens Semi-Transparentes em Paralaxe (círculos orgânicos e suaves)
    for (let c of this.clouds) {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.scale(c.scale, c.scale);
      ctx.fillStyle = `rgba(255, 255, 255, ${c.alpha})`;

      ctx.beginPath();
      ctx.arc(0, 0, 36, 0, Math.PI * 2);
      ctx.arc(28, -8, 28, 0, Math.PI * 2);
      ctx.arc(-26, 6, 24, 0, Math.PI * 2);
      ctx.arc(16, 12, 30, 0, Math.PI * 2);
      ctx.arc(-14, -8, 22, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  drawForegroundClouds(ctx) {
    // Camada frontal de nuvens suaves feitas com círculos semi-transparentes (rgba)
    // Elimina totalmente retângulos cinzas rígidos ou oscilações
    for (let fc of this.foregroundClouds) {
      ctx.save();
      ctx.translate(fc.x, fc.y);
      ctx.scale(fc.scale, fc.scale);
      ctx.fillStyle = `rgba(255, 255, 255, ${fc.alpha})`;

      ctx.beginPath();
      ctx.arc(0, 0, 48, 0, Math.PI * 2);
      ctx.arc(38, -12, 36, 0, Math.PI * 2);
      ctx.arc(-36, 10, 32, 0, Math.PI * 2);
      ctx.arc(22, 16, 38, 0, Math.PI * 2);
      ctx.arc(-20, -14, 28, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }
}

// --- 6. SISTEMA CLIMÁTICO (WeatherSystem) ---
class WeatherSystem {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.stageId = 'ocean';
    this.timer = 12.0;
    this.activeEvent = null;
    this.eventDuration = 0;

    this.particles = [];
    this.windForce = 0;
    this.lightningWarning = false;
    this.lightningX = 0;
    this.lightningWidth = 36;
    this.lightningActive = false;
    this.lightningTimer = 0;
  }

  setStage(stageId, smooth = false) {
    this.stageId = stageId;
    this.activeEvent = null;
    this.lightningWarning = false;
    this.lightningActive = false;
    this.windForce = 0;
    if (!smooth) {
      this.particles = [];
      this.timer = 12.0;
    } else {
      // Em transição suave, deixa as partículas ativas dissiparem naturalmente fora da tela
      this.timer = 6.0;
    }
  }

  triggerEvent() {
    if (this.stageId === 'ocean') {
      this.activeEvent = 'storm';
    } else if (this.stageId === 'jungle') {
      this.activeEvent = 'fog_wind';
    } else if (this.stageId === 'canyon') {
      this.activeEvent = 'sandstorm';
    } else if (this.stageId === 'megacity') {
      this.activeEvent = 'neon_rain';
    } else {
      this.activeEvent = 'wind';
    }

    this.eventDuration = 9.0;
    this.windForce = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 1.6 + 1.0);
    this.lightningTimer = 1.0;
  }

  update(dt, player, particles, enemyBullets) {
    if (!this.activeEvent) {
      this.timer -= dt;
      if (this.timer <= 0) {
        this.triggerEvent();
        this.timer = Math.random() * 18.0 + 12.0;
      }
      return;
    }

    this.eventDuration -= dt;
    if (this.eventDuration <= 0) {
      this.activeEvent = null;
      this.lightningWarning = false;
      this.lightningActive = false;
      this.windForce = 0;
      return;
    }

    // Raios e Tempestade
    if (this.activeEvent === 'storm') {
      this.lightningTimer -= dt;
      if (this.lightningTimer <= 0) {
        if (!this.lightningWarning && !this.lightningActive) {
          this.lightningWarning = true;
          this.lightningX = Math.max(50, Math.min(this.width - 50, player.x + (Math.random() - 0.5) * 60));
          this.lightningTimer = 1.2;
          sound.playWarning();
        } else if (this.lightningWarning) {
          this.lightningWarning = false;
          this.lightningActive = true;
          this.lightningTimer = 0.35;
          sound.playExplosion(true);
          particles.shake(14, 0.35);

          if (Math.abs(player.x - this.lightningX) < this.lightningWidth / 2 + 15) {
            player.takeDamage(30, particles);
          }
        } else if (this.lightningActive) {
          this.lightningActive = false;
          this.lightningTimer = Math.random() * 2.5 + 2.0;
        }
      }
    }

    // Vento / Tempestade de Areia / Névoa Tropical
    if (['sandstorm', 'fog_wind', 'neon_rain', 'wind'].includes(this.activeEvent)) {
      player.x += this.windForce * dt * 50;

      if (Math.random() > 0.2) {
        this.particles.push({
          x: this.windForce > 0 ? -20 : this.width + 20,
          y: Math.random() * this.height,
          vx: this.windForce * 6.0,
          vy: Math.random() * 2 + 1,
          len: Math.random() * 25 + 15,
          color: this.activeEvent === 'sandstorm' ? '#d4a373' : (this.activeEvent === 'neon_rain' ? '#00e5ff' : '#a7c957')
        });
      }

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx * dt * 60;
        p.y += p.vy * dt * 60;
        if (p.x < -40 || p.x > this.width + 40) this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    if (this.lightningWarning) {
      ctx.fillStyle = 'rgba(255, 23, 68, 0.18)';
      ctx.fillRect(this.lightningX - this.lightningWidth / 2, 0, this.lightningWidth, this.height);
      ctx.strokeStyle = '#ff1744';
      ctx.strokeRect(this.lightningX - this.lightningWidth / 2, 0, this.lightningWidth, this.height);
    }

    if (this.lightningActive) {
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 25;
      ctx.fillRect(this.lightningX - this.lightningWidth / 3, 0, this.lightningWidth * 0.66, this.height);
      ctx.shadowBlur = 0;
    }

    for (let p of this.particles) {
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + p.vx * 1.5, p.y + p.vy * 1.5);
      ctx.stroke();
    }
  }
}

// --- 7. SISTEMA DE PARTÍCULAS E SHAKE DE TELA ---
class ParticleSystem {
  constructor() {
    this.particles = [];
    this.shockwaves = [];
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
  }

  shake(intensity, duration) {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
  }

  applyScreenShake(ctx) {
    if (this.shakeDuration > 0) {
      const offsetX = (Math.random() - 0.5) * this.shakeIntensity;
      const offsetY = (Math.random() - 0.5) * this.shakeIntensity;
      ctx.translate(offsetX, offsetY);
    }
  }

  addExplosion(x, y, count = 20, isLarge = false) {
    sound.playExplosion(isLarge);
    if (isLarge) this.shake(12, 0.45);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * (isLarge ? 7 : 4.5) + 1.5;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * (isLarge ? 5.5 : 3.5) + 1.5,
        color: Math.random() > 0.4 ? '#ff9100' : (Math.random() > 0.5 ? '#ff1744' : '#ffea00'),
        alpha: 1.0,
        decay: Math.random() * 0.03 + 0.02
      });
    }
  }

  addShockwave(x, y, maxRadius = 450, color = '#00e5ff') {
    this.shockwaves.push({
      x, y,
      radius: 10,
      maxRadius,
      color,
      alpha: 1.0,
      growth: 650
    });
  }

  addSmoke(x, y) {
    this.particles.push({
      x: x + (Math.random() - 0.5) * 6,
      y: y,
      vx: (Math.random() - 0.5) * 1.2,
      vy: Math.random() * 1.5 + 2.0,
      radius: Math.random() * 3 + 2,
      color: '#424242',
      alpha: 0.65,
      decay: 0.035
    });
  }

  addAfterburner(x, y, vx, vy, color = null) {
    this.particles.push({
      x: x + (Math.random() - 0.5) * 3,
      y: y,
      vx: vx * 0.2 + (Math.random() - 0.5) * 0.8,
      vy: Math.random() * 3.5 + 4.5,
      radius: Math.random() * 2.5 + 1.5,
      color: color || (Math.random() > 0.5 ? '#00e5ff' : '#00b0ff'),
      alpha: 0.85,
      decay: 0.08
    });
  }

  addEmpWave(x, y) {
    this.addShockwave(x, y, 400, '#00e5ff');
  }

  update(dt) {
    if (this.shakeDuration > 0) {
      this.shakeDuration -= dt;
      if (this.shakeDuration <= 0) this.shakeIntensity = 0;
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;
      p.alpha -= p.decay * dt * 60;
      if (p.alpha <= 0) this.particles.splice(i, 1);
    }

    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += sw.growth * dt;
      sw.alpha = Math.max(0, 1 - (sw.radius / sw.maxRadius));
      if (sw.radius >= sw.maxRadius || sw.alpha <= 0) {
        this.shockwaves.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    // Shockwaves
    for (let sw of this.shockwaves) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.strokeStyle = sw.color;
      ctx.globalAlpha = sw.alpha;
      ctx.lineWidth = 4;
      ctx.shadowColor = sw.color;
      ctx.shadowBlur = 15;
      ctx.stroke();
      ctx.restore();
    }

    // Partículas
    for (let p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

// --- 8. MOEDAS DE OURO E POWER-UPS COLETÁVEIS ---
class Coin {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 2.5;
    this.vy = -1.5;
    this.radius = 7;
    this.value = 10;
  }

  update(dt, px, py, magnetRadius) {
    const dx = px - this.x;
    const dy = py - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist < magnetRadius) {
      const spd = 7.5;
      this.x += (dx / dist) * spd * dt * 60;
      this.y += (dy / dist) * spd * dt * 60;
    } else {
      this.x += this.vx * dt * 60;
      this.y += this.vy * dt * 60;
      this.vy += 0.08 * dt * 60;
    }
    return this.y < 980;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.fillStyle = '#ffca28';
    ctx.strokeStyle = '#ffa000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fffd54';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', 0, 0);
    ctx.restore();
  }
}

class PowerUp {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type; // 'W': Arma, 'M': Mísseis, 'B': Super Bomba, 'S': Escudo
    this.radius = 13;
    this.vy = 1.6;
    this.pulse = 0;
  }

  update(dt) {
    this.y += this.vy * dt * 60;
    this.pulse += dt * 4;
    return this.y < 980;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    const scale = 1 + Math.sin(this.pulse) * 0.1;
    ctx.scale(scale, scale);

    let color = '#00e5ff';
    let text = 'W';
    if (this.type === 'M') { color = '#ffd54f'; text = 'M'; }
    else if (this.type === 'B') { color = '#ff3d00'; text = 'B'; }
    else if (this.type === 'S') { color = '#00e676'; text = 'S'; }

    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }
}

// --- 9. PROJÉTEIS DO JOGADOR E INIMIGOS ---
class Projectile {
  constructor(opts) {
    this.x = opts.x;
    this.y = opts.y;
    this.vx = opts.vx || 0;
    this.vy = opts.vy || -16;
    this.damage = opts.damage || 22;
    this.radius = opts.radius || 3.5;
    this.color = opts.color || '#00e5ff';
    this.isMissile = !!opts.isMissile;
    this.isOverdrive = !!opts.isOverdrive;
    this.target = null;
  }

  update(dt, enemies) {
    if (this.isMissile) {
      if (!this.target || this.target.hp <= 0) {
        let minDist = 400;
        for (let e of enemies) {
          if (e.hp > 0) {
            const d = Math.hypot(e.x - this.x, e.y - this.y);
            if (d < minDist) { minDist = d; this.target = e; }
          }
        }
      }

      if (this.target && this.target.hp > 0) {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const angle = Math.atan2(dy, dx);
        this.vx += Math.cos(angle) * 1.5;
        this.vy += Math.sin(angle) * 1.5;
        const spd = Math.hypot(this.vx, this.vy);
        if (spd > 15) {
          this.vx = (this.vx / spd) * 15;
          this.vy = (this.vy / spd) * 15;
        }
      }
    }

    this.x += this.vx * dt * 60;
    this.y += this.vy * dt * 60;
    return this.y > -30 && this.y < 990 && this.x > -30 && this.x < 570;
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8;

    if (this.isMissile) {
      ctx.translate(this.x, this.y);
      ctx.rotate(Math.atan2(this.vy, this.vx) + Math.PI / 2);
      ctx.fillRect(-2.5, -9, 5, 18);
      ctx.fillStyle = '#ff1744';
      ctx.beginPath();
      ctx.moveTo(0, -11); ctx.lineTo(3, -7); ctx.lineTo(-3, -7);
      ctx.fill();
    } else if (this.isOverdrive) {
      ctx.fillStyle = '#ff3d00';
      ctx.fillRect(this.x - 3, this.y - 12, 6, 24);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(this.x - 1.5, this.y - 10, 3, 20);
    } else {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

class EnemyBullet {
  constructor(x, y, vx, vy, isHoming = false) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = 4;
    this.isHoming = isHoming;
    this.color = isHoming ? '#ff1744' : '#ff9100';
  }

  update(dt, playerX, playerY) {
    if (this.isHoming) {
      const dx = playerX - this.x;
      const dy = playerY - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 10) {
        this.vx += (dx / dist) * 0.15;
        this.vy += (dy / dist) * 0.15;
      }
    }
    this.x += this.vx * dt * 60;
    this.y += this.vy * dt * 60;
    return this.y > -20 && this.y < 980 && this.x > -20 && this.x < 560;
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// --- 10. JOGADOR (Player) COM SISTEMA DE AQUECIMENTO E BARREL ROLL ---
class Player {
  constructor(x, y, planeType, upgrades) {
    this.x = x;
    this.y = y;
    this.targetX = x;
    this.targetY = y;
    this.vx = 0;
    this.vy = 0;

    // Chave da nave ativa (garante uso de 'f14', 'f22', 'fa18', 'a10', mapeando su57 para fa18)
    this.currentShip = (planeType === 'su57' || planeType === 'fa18') ? 'fa18' : (planeType || 'f14');
    this.planeType = this.currentShip;
    this.data = PLANE_DATA[this.currentShip] || PLANE_DATA.fa18;
    const engineColors = { f14: '#00e5ff', f22: '#00e5ff', fa18: '#ff9100', a10: '#ff1744' };
    this.engineColor = engineColors[this.currentShip] || '#00e5ff'; // cor fixa por aeronave

    // Upgrades da Loja
    const armorBonus = 1 + (upgrades.armor || 0) * 0.15;
    this.maxHp = Math.round(this.data.baseHp * armorBonus);
    this.hp = this.maxHp;

    this.speed = this.data.speed;
    this.damageMult = 1.0;

    // Tamanho exato em pixels do sprite Pixel Art (64x64) para colisões e renderização corretas
    this.width = 64;
    this.height = 64;
    this.radius = 20;
    this.rollAngle = 0;

    this.weaponLevel = 1;

    // Munições (Mísseis e Bombas)
    const ammoLvl = upgrades.ammoDepot || 0;
    this.maxMissiles = 10 + ammoLvl * 2;
    this.missiles = this.maxMissiles;
    this.maxBombs = 2 + ammoLvl * 1;
    this.bombs = this.maxBombs;

    // 1. LIMITADOR DE CADÊNCIA (COOLDOWN ENTRE DISPAROS: 180ms - 220ms)
    this.fireCooldown = 0;
    this.baseFireCooldown = this.data.fireCooldown; // 180ms a 210ms

    // 2. SISTEMA DE AQUECIMENTO (OVERHEAT)
    this.heat = 0; // 0% a 100%
    const radiatorLvl = upgrades.radiator || 0;
    this.heatPerShot = Math.max(2.4, 7.5 - radiatorLvl * 1.0); // Reduz acúmulo de calor
    this.overheated = false;
    this.overheatTimer = 0; // 2.5s quando atinge 100%

    // 3. BARREL ROLL / GIRO DE ESQUIVA (Tecla 'Shift')
    this.barrelRollTimer = 0; // 0.5s de invulnerabilidade total
    const thrusterLvl = upgrades.thrusters || 0;
    this.rollMaxCooldown = Math.max(3.0, 5.0 - thrusterLvl * 0.4);
    this.rollCooldown = 0;

    // Especial (Tecla 'Q')
    this.specialMaxCooldown = this.data.specialCooldown;
    this.specialCooldown = 0;

    // Foco Tático (Bullet Time - Tecla 'E')
    this.focusMax = 100;
    this.focus = 100;
    this.focusActive = false;
    this.focusTimer = 0;

    // Overdrive (15 Abates consecutivos)
    this.killsWithoutDamage = 0;
    this.overdriveActive = false;
    this.overdriveTimer = 0;

    // Alerta de Emergência sonoro (HP < 30%)
    this.emergencyBeepTimer = 0;

    this.stealthTimer = 0;
    this.invulnerableTimer = 0;
    this.magnetRadius = 75 + (upgrades.magnet || 0) * 40;
  }

  // DISPARO PRINCIPAL (LIMITADO POR CADÊNCIA E AQUECIMENTO)
  fireMain(projectiles) {
    if (this.fireCooldown > 0 || this.overheated) return;

    this.fireCooldown = this.baseFireCooldown;

    // Acúmulo de Calor
    this.heat = Math.min(100, this.heat + this.heatPerShot);
    if (this.heat >= 100) {
      this.overheated = true;
      this.overheatTimer = 2.5; // Trava por 2.5 segundos
      sound.playOverheat();
    }

    // Se estiver em Overdrive, dispara super laser
    if (this.overdriveActive) {
      sound.playOverdrive();
      projectiles.push(new Projectile({ x: this.x - 12, y: this.y - 18, vx: 0, vy: -20, damage: 50 * this.damageMult, isOverdrive: true }));
      projectiles.push(new Projectile({ x: this.x + 12, y: this.y - 18, vx: 0, vy: -20, damage: 50 * this.damageMult, isOverdrive: true }));
      return;
    }

    if (this.currentShip === 'f14' || this.planeType === 'f14') {
      sound.playVulcan();
      const dmg = 24 * this.damageMult;
      if (this.weaponLevel === 1) {
        projectiles.push(new Projectile({ x: this.x - 10, y: this.y - 16, vx: 0, vy: -16, damage: dmg }));
        projectiles.push(new Projectile({ x: this.x + 10, y: this.y - 16, vx: 0, vy: -16, damage: dmg }));
      } else if (this.weaponLevel === 2) {
        projectiles.push(new Projectile({ x: this.x, y: this.y - 18, vx: 0, vy: -17, damage: dmg * 1.1 }));
        projectiles.push(new Projectile({ x: this.x - 14, y: this.y - 12, vx: -1.5, vy: -16, damage: dmg }));
        projectiles.push(new Projectile({ x: this.x + 14, y: this.y - 12, vx: 1.5, vy: -16, damage: dmg }));
      } else {
        projectiles.push(new Projectile({ x: this.x - 6, y: this.y - 18, vx: 0, vy: -17, damage: dmg * 1.25, color: '#ffea00' }));
        projectiles.push(new Projectile({ x: this.x + 6, y: this.y - 18, vx: 0, vy: -17, damage: dmg * 1.25, color: '#ffea00' }));
        projectiles.push(new Projectile({ x: this.x - 18, y: this.y - 10, vx: -3.0, vy: -15.5, damage: dmg }));
        projectiles.push(new Projectile({ x: this.x + 18, y: this.y - 10, vx: 3.0, vy: -15.5, damage: dmg }));
      }
    } else if (this.currentShip === 'f22' || this.planeType === 'f22') {
      sound.playPlasma();
      const dmg = (this.weaponLevel === 1 ? 28 : (this.weaponLevel === 2 ? 38 : 48)) * this.damageMult;
      projectiles.push(new Projectile({ x: this.x - 8, y: this.y - 18, vx: 0, vy: -18, damage: dmg, color: '#00e5ff' }));
      projectiles.push(new Projectile({ x: this.x + 8, y: this.y - 18, vx: 0, vy: -18, damage: dmg, color: '#00e5ff' }));
      if (this.weaponLevel >= 2) {
        projectiles.push(new Projectile({ x: this.x - 16, y: this.y - 12, vx: -1.2, vy: -17, damage: dmg * 0.8, color: '#00e5ff' }));
        projectiles.push(new Projectile({ x: this.x + 16, y: this.y - 12, vx: 1.2, vy: -17, damage: dmg * 0.8, color: '#00e5ff' }));
      }
    } else if (this.currentShip === 'fa18' || this.planeType === 'su57') {
      sound.playHeavyCannon();
      const dmg = (this.weaponLevel === 1 ? 28 : (this.weaponLevel === 2 ? 38 : 50)) * this.damageMult;
      projectiles.push(new Projectile({ x: this.x, y: this.y - 18, vx: 0, vy: -15, damage: dmg, radius: 4.5, color: '#ff9100' }));
      projectiles.push(new Projectile({ x: this.x - 14, y: this.y - 12, vx: -2.8, vy: -14.5, damage: dmg, radius: 4, color: '#ff9100' }));
      projectiles.push(new Projectile({ x: this.x + 14, y: this.y - 12, vx: 2.8, vy: -14.5, damage: dmg, radius: 4, color: '#ff9100' }));
    } else if (this.currentShip === 'a10' || this.planeType === 'a10') {
      sound.playGau8();
      const dmg = (this.weaponLevel === 1 ? 25 : (this.weaponLevel === 2 ? 34 : 46)) * this.damageMult;
      projectiles.push(new Projectile({ x: this.x - 4, y: this.y - 20, vx: (Math.random() - 0.5) * 0.5, vy: -19, damage: dmg, radius: 4, color: '#ffeb3b' }));
      projectiles.push(new Projectile({ x: this.x + 4, y: this.y - 20, vx: (Math.random() - 0.5) * 0.5, vy: -19, damage: dmg, radius: 4, color: '#ffeb3b' }));
      if (this.weaponLevel >= 2) {
        projectiles.push(new Projectile({ x: this.x, y: this.y - 24, vx: 0, vy: -20, damage: dmg * 1.2, radius: 4.5, color: '#ff9800' }));
      }
    }
  }

  // ATIVAÇÃO DO BARREL ROLL (GIRO DE ESQUIVA - TECLA SHIFT)
  triggerBarrelRoll(particles) {
    if (this.rollCooldown > 0 || this.barrelRollTimer > 0) return;
    this.barrelRollTimer = 0.5; // 0.5s de invulnerabilidade total
    this.rollCooldown = this.rollMaxCooldown;
    sound.playBarrelRoll();
    particles.addShockwave(this.x, this.y, 120, '#00e5ff');
  }

  // ATIVAÇÃO DA SUPER BOMBA DE EMERGÊNCIA (TECLA X)
  triggerSuperBomb(projectiles, enemies, enemyBullets, boss, particles) {
    if (this.bombs <= 0) return;
    this.bombs--;

    sound.playSuperBomb();
    particles.shake(22, 0.65);
    particles.addShockwave(this.x, this.y, 600, '#ff9100');

    // Limpa todos os projéteis inimigos da tela
    enemyBullets.length = 0;

    // Causa 300 de dano em área
    for (let e of enemies) {
      if (e.hp > 0) {
        e.hp -= 300 * this.damageMult;
        particles.addExplosion(e.x, e.y, 14, false);
      }
    }

    if (boss && boss.hp > 0) {
      boss.hp -= 300 * this.damageMult;
      particles.addExplosion(boss.x, boss.y, 28, true);
    }
  }

  // HABILIDADE ESPECIAL ÚNICA (TECLA Q)
  useSpecialAbility(projectiles, enemies, enemyBullets, particles) {
    if (this.specialCooldown > 0) return;
    this.specialCooldown = this.specialMaxCooldown;

    if (this.currentShip === 'f14' || this.planeType === 'f14') {
      sound.playMissileLaunch();
      const spreadAngles = [-5, -3, -1, 1, 3, 5];
      for (let a of spreadAngles) {
        projectiles.push(new Projectile({
          x: this.x + a * 4,
          y: this.y + 5,
          vx: a * 1.5,
          vy: -9,
          isMissile: true,
          damage: 100 * this.damageMult,
          color: '#ffffff'
        }));
      }
    } else if (this.currentShip === 'f22' || this.planeType === 'f22') {
      sound.playStealth();
      this.stealthTimer = 4.0;
    } else if (this.currentShip === 'fa18' || this.planeType === 'su57') {
      sound.playEMP();
      particles.addEmpWave(this.x, this.y);
      enemyBullets.length = 0;
      for (let e of enemies) {
        if (e.hp > 0) {
          const d = Math.hypot(e.x - this.x, e.y - this.y);
          if (d < 380) {
            e.hp -= 240 * this.damageMult;
            particles.addExplosion(e.x, e.y, 10, false);
          }
        }
      }
    } else if (this.planeType === 'a10') {
      sound.playGau8();
      sound.playExplosion(true);
      particles.shake(14, 0.4);
      for (let i = -3; i <= 3; i++) {
        projectiles.push(new Projectile({
          x: this.x + i * 8,
          y: this.y - 20,
          vx: i * 0.8,
          vy: -22,
          damage: 85 * this.damageMult,
          radius: 5,
          color: '#ff3d00'
        }));
      }
    }
  }

  fireMissile(projectiles, enemies) {
    if (this.missiles <= 0) return;
    this.missiles--;
    sound.playMissileLaunch();
    projectiles.push(new Projectile({ x: this.x - 18, y: this.y + 2, vx: -3, vy: -8, isMissile: true, damage: 90 * this.damageMult, color: '#ffffff' }));
    projectiles.push(new Projectile({ x: this.x + 18, y: this.y + 2, vx: 3, vy: -8, isMissile: true, damage: 90 * this.damageMult, color: '#ffffff' }));
  }

  triggerBulletTime() {
    if (this.focus < 25 || this.focusActive) return;
    this.focusActive = true;
    this.focusTimer = 4.0;
    sound.playBulletTime();
  }

  takeDamage(amount, particles, damageMult = 1.0, uiController = null) {
    // Invulnerável se estiver em Barrel Roll, Camuflagem ou pós-dano
    if (this.barrelRollTimer > 0 || this.invulnerableTimer > 0 || this.stealthTimer > 0) return false;

    const actualDamage = amount * damageMult;
    this.hp = Math.max(0, this.hp - actualDamage);
    this.invulnerableTimer = 1.0;
    this.killsWithoutDamage = 0;
    particles.addExplosion(this.x, this.y, 12, false);

    if (this.hp <= this.maxHp * 0.3 && this.hp > 0 && uiController) {
      uiController.triggerRadio('ALERTA: Dano estrutural crítico! Use Giro de Esquiva ou Super Bomba!');
    }
    return true;
  }

  update(dt, input, particles, projectiles, enemies, enemyBullets, boss, damageMult, uiController) {
    // Resfriamento e Cooldowns
    if (this.fireCooldown > 0) this.fireCooldown -= dt;
    if (this.rollCooldown > 0) this.rollCooldown -= dt;
    if (this.specialCooldown > 0) this.specialCooldown -= dt;
    if (this.invulnerableTimer > 0) this.invulnerableTimer -= dt;
    if (this.stealthTimer > 0) this.stealthTimer -= dt;

    // Barrel Roll Timer
    if (this.barrelRollTimer > 0) {
      this.barrelRollTimer -= dt;
      if (this.barrelRollTimer < 0) this.barrelRollTimer = 0;
    }

    // Resfriamento do canhão (Overheat)
    if (this.overheated) {
      this.overheatTimer -= dt;
      this.heat = Math.max(0, (this.overheatTimer / 2.5) * 100);
      if (this.overheatTimer <= 0) {
        this.overheated = false;
        this.heat = 0;
      }
    } else {
      if (!input.fire && !input.pointerActive) {
        this.heat = Math.max(0, this.heat - dt * 38);
      }
    }

    // Foco Tático
    if (this.focusActive) {
      this.focusTimer -= dt;
      this.focus = Math.max(0, this.focus - dt * 25);
      if (this.focusTimer <= 0 || this.focus <= 0) this.focusActive = false;
    }

    // Overdrive
    if (this.overdriveActive) {
      this.overdriveTimer -= dt;
      if (this.overdriveTimer <= 0) this.overdriveActive = false;
    }

    // 4. MOVIMENTO DO JOGADOR COM SUPORTE A GESTOS TOUCH (INTERPOLAÇÃO / LERP)
    if (input.pointerActive) {
      // Interpolação suave (lerp) em direção ao dedo do jogador
      const lerpFactor = 0.22;
      this.x += (input.pointerX - this.x) * lerpFactor;
      this.y += (input.pointerY - this.y) * lerpFactor;
      this.vx = (input.pointerX - this.x) * 0.1;
    } else {
      let moveX = input.moveX;
      let moveY = input.moveY;
      const len = Math.hypot(moveX, moveY);
      if (len > 0) {
        this.vx = (moveX / (len > 1 ? len : 1)) * this.speed;
        this.vy = (moveY / (len > 1 ? len : 1)) * this.speed;
      } else {
        this.vx *= 0.82;
        this.vy *= 0.82;
      }
      this.x += this.vx * dt * 60;
      this.y += this.vy * dt * 60;
    }

    // Limites da Tela
    this.x = Math.max(30, Math.min(510, this.x));
    this.y = Math.max(50, Math.min(910, this.y));

    // Inclinação (Roll Angle)
    const targetRoll = (this.vx / this.speed) * 0.35;
    this.rollAngle += (targetRoll - this.rollAngle) * 0.15;

    // Fumaça e fogo de alerta se HP < 30%
    const isCriticalHp = this.hp > 0 && (this.hp / this.maxHp) < 0.3;
    if (isCriticalHp) {
      particles.addSmoke(this.x, this.y + 16);
      if (Math.random() > 0.4) {
        particles.addAfterburner(this.x, this.y + 16, 0, 1.5, '#ff3d00');
      }
      this.emergencyBeepTimer -= dt;
      if (this.emergencyBeepTimer <= 0) {
        sound.playEmergencyBeep();
        this.emergencyBeepTimer = 0.85;
      }
    }

    // Turbinas
    if (this.stealthTimer <= 0) {
      const engineY = this.y + 24;
      const flameColor = this.overdriveActive ? '#ff3d00' : this.engineColor;
      particles.addAfterburner(this.x - 9, engineY, this.vx * 0.3, this.vy, flameColor);
      particles.addAfterburner(this.x + 9, engineY, this.vx * 0.3, this.vy, flameColor);
    }

    // Processamento de Ações do Jogador
    if (input.fire || input.pointerActive) {
      this.fireMain(projectiles);
    }
    if (input.consumeRoll()) {
      this.triggerBarrelRoll(particles);
    }
    if (input.consumeBomb()) {
      this.triggerSuperBomb(projectiles, enemies, enemyBullets, boss, particles);
    }
    if (input.consumeSpecial()) {
      this.useSpecialAbility(projectiles, enemies, enemyBullets, particles);
    }
    if (input.consumeMissile()) {
      this.fireMissile(projectiles, enemies);
    }
    if (input.consumeFocus()) {
      this.triggerBulletTime();
    }
  }

  draw(ctx) {
    if (this.invulnerableTimer > 0 && Math.floor(Date.now() / 70) % 2 === 0) return;

    ctx.save();
    ctx.translate(this.x, this.y);

    // Efeito de Camuflagem Furtiva
    if (this.stealthTimer > 0) {
      ctx.globalAlpha = 0.45;
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 15;
    }

    // Efeito de Overdrive
    if (this.overdriveActive) {
      ctx.shadowColor = '#ff3d00';
      ctx.shadowBlur = 18;
    }

    // Rotação do Barrel Roll (Giro de 360 Graus com compressão de perspectiva)
    let rollScaleX = Math.cos(this.rollAngle);
    if (this.barrelRollTimer > 0) {
      const progress = 1 - (this.barrelRollTimer / 0.5);
      const rollRot = progress * Math.PI * 2;
      rollScaleX = Math.cos(rollRot);
      ctx.rotate(progress * 0.1);
    }

    ctx.scale(rollScaleX, 1);

    // Renderização do Sprite em Pixel Art (centralizado na posição do jogador)
    const shipKey = this.currentShip || (this.planeType === 'su57' ? 'fa18' : this.planeType);
    if (playerSprites[shipKey] && playerSprites[shipKey].complete && playerSprites[shipKey].naturalWidth !== 0) {
      ctx.drawImage(playerSprites[shipKey], -this.width / 2, -this.height / 2, this.width, this.height);
    }

    ctx.restore();
  }
}

// --- 11. INIMIGOS PADRÃO (Enemy) COM ESCALA REALISTA E SPRITES PIXEL ART ---
class Enemy {
  constructor(type, x, y, hpMult = 1.0) {
    // Normalização de tipos para compatibilidade com chamadas string ('mig21', 'mig29', 'su57', 'su35', 'b2') ou numéricas
    if (typeof type === 'number') {
      const typeMap = { 1: 'mig21', 2: 'mig29', 3: 'b2', 4: 'su35', 5: 'su57', 6: 'mig21' };
      this.type = typeMap[type] || 'mig21';
    } else {
      this.type = type;
    }

    this.x = x;
    this.y = y;
    this.alive = true;
    this.timer = 0;

    // Escalas Corretas e Realistas (Renderização e Hitbox)
    if (this.type === 'mig21') {
      // Inimigo ligeiro ampliado para ficar legível durante o combate
      this.width = 64;
      this.height = 64;
      this.radius = 30;
      this.hp = Math.round(40 * hpMult);
      this.maxHp = this.hp;
      this.scoreVal = 100;
      this.speedY = 3.2;
      this.zigzag = Math.random() > 0.5;
      this.shootTimer = Math.random() * 0.8 + 0.8;
    } else if (this.type === 'mig29') {
      // Inimigo médio ampliado com hitbox proporcional
      this.width = 84;
      this.height = 84;
      this.radius = 39;
      this.hp = Math.round(110 * hpMult);
      this.maxHp = this.hp;
      this.scoreVal = 220;
      this.speedY = 2.4;
      this.state = 'descend';
      this.pauseTimer = 1.4;
      this.shotFired = false;
    } else if (this.type === 'su35') {
      // Caça pesado ampliado
      this.width = 104;
      this.height = 104;
      this.radius = 48;
      this.hp = Math.round(230 * hpMult);
      this.maxHp = this.hp;
      this.scoreVal = 420;
      this.speedY = 1.6;
      this.shootTimer = 1.2;
    } else if (this.type === 'su57') {
      // Caça furtivo de elite ampliado
      this.width = 104;
      this.height = 104;
      this.radius = 48;
      this.hp = Math.round(280 * hpMult);
      this.maxHp = this.hp;
      this.scoreVal = 520;
      this.speedY = 2.0;
      this.shootTimer = 1.0;
    } else if (this.type === 'b2') {
      // 'b2' (Bombardeiro Chefe): width: 200, height: 180 (Monstro gigante na tela)
      this.width = 200;
      this.height = 180;
      this.radius = 95;
      this.hp = Math.round(850 * hpMult);
      this.maxHp = this.hp;
      this.scoreVal = 1400;
      this.speedY = 0.75;
      this.salvoTimer = 1.8;
    } else {
      // Fallback de segurança com dimensões médias
      this.width = 64;
      this.height = 64;
      this.radius = 32;
      this.hp = Math.round(75 * hpMult);
      this.maxHp = this.hp;
      this.scoreVal = 150;
      this.speedY = 2.0;
      this.shootTimer = 1.4;
    }
  }

  update(dt, enemyBullets, playerX, playerY, mods) {
    this.timer += dt;

    if (this.type === 'mig21') {
      this.y += this.speedY * dt * 60;
      if (this.zigzag) this.x += Math.sin(this.timer * 2.5) * 2.5;

      this.shootTimer -= dt * mods.shootFreqMult;
      if (this.shootTimer <= 0) {
        this.shootTimer = 1.6;
        enemyBullets.push(new EnemyBullet(this.x, this.y + this.height / 2, 0, 5.0 * mods.bulletSpeedMult));
      }
    } else if (this.type === 'mig29') {
      if (this.state === 'descend') {
        this.y += this.speedY * dt * 60;
        if (this.y >= 240) this.state = 'pause';
      } else if (this.state === 'pause') {
        this.pauseTimer -= dt;
        if (!this.shotFired && this.pauseTimer <= 0.8) {
          this.shotFired = true;
          const spd = 4.8 * mods.bulletSpeedMult;
          enemyBullets.push(new EnemyBullet(this.x - 16, this.y + this.height / 2, -1.2, spd));
          enemyBullets.push(new EnemyBullet(this.x + 16, this.y + this.height / 2, 1.2, spd));
        }
        if (this.pauseTimer <= 0) this.state = 'ascend';
      } else if (this.state === 'ascend') {
        this.y -= this.speedY * 1.3 * dt * 60;
      }
    } else if (this.type === 'su35') {
      // Comportamento tático exclusivo do Su-35 Flanker-E: manobras amplas de superioridade aérea
      if (this.y < 220) this.y += this.speedY * dt * 60;
      this.x += Math.sin(this.timer * 2.0) * 2.2;

      this.shootTimer -= dt * mods.shootFreqMult;
      if (this.shootTimer <= 0) {
        this.shootTimer = 1.3;
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const dist = Math.hypot(dx, dy) || 1;
        const spd = 5.2 * mods.bulletSpeedMult;
        enemyBullets.push(new EnemyBullet(this.x - 20, this.y + this.height / 2, (dx / dist) * spd, (dy / dist) * spd));
        enemyBullets.push(new EnemyBullet(this.x + 20, this.y + this.height / 2, (dx / dist) * spd, (dy / dist) * spd));
      }
    } else if (this.type === 'su57') {
      // Comportamento tático exclusivo do Su-57 Felon: interceptação furtiva com mísseis guiados
      this.y += this.speedY * dt * 60;
      const dx = playerX - this.x;
      this.x += Math.sign(dx) * Math.min(Math.abs(dx), 1.6 * dt * 60);

      this.shootTimer -= dt * mods.shootFreqMult;
      if (this.shootTimer <= 0) {
        this.shootTimer = 1.1;
        const dy = playerY - this.y;
        const dist = Math.hypot(dx, dy) || 1;
        const spd = 5.8 * mods.bulletSpeedMult;
        enemyBullets.push(new EnemyBullet(this.x, this.y + this.height / 2, (dx / dist) * spd, (dy / dist) * spd, true));
      }
    } else if (this.type === 'b2') {
      // Bombardeiro Chefe B-2 Spirit: avanço lento, imponente e salvas devastadoras multi-ponto
      this.y += this.speedY * dt * 60;
      this.salvoTimer -= dt * mods.shootFreqMult;
      if (this.salvoTimer <= 0) {
        this.salvoTimer = 2.0;
        const spd = 4.5 * mods.bulletSpeedMult;
        // Canhões laterais esquerdo e direito (asas do B-2 de 200px)
        enemyBullets.push(new EnemyBullet(this.x - 60, this.y + this.height * 0.35, -0.8, spd));
        enemyBullets.push(new EnemyBullet(this.x + 60, this.y + this.height * 0.35, 0.8, spd));
        // Canhões internos com leve ângulo
        enemyBullets.push(new EnemyBullet(this.x - 20, this.y + this.height * 0.4, -0.3, spd));
        enemyBullets.push(new EnemyBullet(this.x + 20, this.y + this.height * 0.4, 0.3, spd));
        // Canhão central reto
        enemyBullets.push(new EnemyBullet(this.x, this.y + this.height * 0.45, 0, spd, true));
      }
    }

    // Permite que o gigante B-2 (200x180) entre suavemente pela tela
    return this.y > -220 && this.y < 1080 && this.x > -120 && this.x < 660 && this.hp > 0;
  }

  draw(ctx) {
    ctx.save();
    const sprite = enemySprites[this.type];
    // Renderização com sprite pixel art nas dimensões corretas (centralizado)
    if (sprite && sprite.complete && sprite.naturalWidth > 0) {
      ctx.drawImage(
        sprite,
        this.x - this.width / 2,
        this.y - this.height / 2,
        this.width,
        this.height
      );
    } else {
      // Fallback tático: silhueta geométrica visível nas dimensões corretas
      ctx.fillStyle = this.type === 'b2' ? '#330011' : '#1a2a3a';
      ctx.strokeStyle = this.type === 'b2' ? '#ff0033' : '#00e5ff';
      ctx.lineWidth = 1.5;
      const hw = this.width / 2;
      const hh = this.height / 2;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y - hh);
      ctx.lineTo(this.x + hw, this.y + hh * 0.6);
      ctx.lineTo(this.x + hw * 0.3, this.y + hh);
      ctx.lineTo(this.x - hw * 0.3, this.y + hh);
      ctx.lineTo(this.x - hw, this.y + hh * 0.6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Barra de HP para inimigos pesados (su35, su57, b2)
    if (this.maxHp > 100 && this.hp < this.maxHp) {
      const barW = this.width * 0.7;
      const barH = 3;
      const barX = this.x - barW / 2;
      const barY = this.y - this.height / 2 - 6;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(barX, barY, barW, barH);
      const pct = this.hp / this.maxHp;
      ctx.fillStyle = pct > 0.5 ? '#00ff41' : (pct > 0.25 ? '#ffab00' : '#ff1744');
      ctx.fillRect(barX, barY, barW * pct, barH);
    }
    ctx.restore();
  }
}

// --- 12. CHEFES DOS 5 ESTÁGIOS DA CAMPANHA (Boss) ---
class Boss {
  constructor(width, height, difficultyMods, stageInfo) {
    this.canvasWidth = width;
    this.stageInfo = stageInfo;
    this.stageId = stageInfo.id;
    this.type = 'b2'; // Tipo explicitamente definido como b2 para renderização de sprite
    this.name = (stageInfo.stageNum === 5 || stageInfo.id === 'megacity') ? 'B-2 Spirit' : stageInfo.bossName;
    this.title = (stageInfo.stageNum === 5 || stageInfo.id === 'megacity') ? 'Bombardeiro Estratégico Stealth (CHEFE FINAL)' : stageInfo.bossTitle;

    this.x = width / 2;
    this.y = -180;
    this.targetY = 160;

    // Escala Realista do B-2 Chefe: width: 200, height: 180, radius: 95
    this.width = 200;
    this.height = 180;
    this.radius = 95;

    const baseHp = 3200 + (stageInfo.stageNum - 1) * 700;
    this.maxHp = Math.round(baseHp * difficultyMods.hpMult);
    this.hp = this.maxHp;
    this.phase = 1;
    this.timer = 0;
    this.moveDir = 1;
    this.alive = true;

    // Temporizadores de Ataque
    this.shootTimer1 = 0;
    this.shootTimer2 = 0;
    this.droneSpawnTimer = 4.0;
    this.rotorAngle = 0;

    // Mecânica Furtiva do B-2 / Spectre-V
    this.isCloaked = false;
    this.cloakTimer = 0;
    this.laserWarning = false;
    this.laserActive = false;
    this.laserTimer = 0;
    this.laserWidth = 54;
    this.laserTargetX = width / 2;
    this.laserCooldown = 3.8;
  }

  update(dt, enemyBullets, player, particles, mods, enemies) {
    this.timer += dt;
    this.rotorAngle += 30 * dt;

    if (this.y < this.targetY) {
      this.y += 1.8 * dt * 60;
      return true;
    }

    // Movimentação Lateral
    this.x += this.moveDir * 1.3 * dt * 60;
    if (this.x > this.canvasWidth - 110) this.moveDir = -1;
    if (this.x < 110) this.moveDir = 1;

    const hpPct = this.hp / this.maxHp;
    if (hpPct > 0.66) this.phase = 1;
    else if (hpPct > 0.33) this.phase = 2;
    else this.phase = 3;

    // Feixe do B-2: mira uma faixa vertical, avisa antes e dispara por pouco tempo.
    this.laserCooldown -= dt;
    if (!this.laserWarning && !this.laserActive && this.laserCooldown <= 0) {
      this.laserWarning = true;
      this.laserTimer = 1.0;
      this.laserTargetX = Math.max(35, Math.min(this.canvasWidth - 35, player.x));
      this.laserCooldown = this.phase === 3 ? 3.0 : 4.2;
    }
    if (this.laserWarning) {
      this.laserTimer -= dt;
      if (this.laserTimer <= 0) { this.laserWarning = false; this.laserActive = true; this.laserTimer = 0.55; }
    } else if (this.laserActive) {
      this.laserTimer -= dt;
      const beamLeft = this.laserTargetX - this.laserWidth / 2;
      const beamRight = this.laserTargetX + this.laserWidth / 2;
      if (player.x + player.radius > beamLeft && player.x - player.radius < beamRight) {
        if (!player.invulnerable && !player.barrelRolling) player.takeDamage(28 * dt, particles, mods.playerDamageMult || 1, null);
      }
      if (this.laserTimer <= 0) this.laserActive = false;
    }

    // Fumaça de Danos
    if (this.phase >= 2 && Math.random() > 0.45) {
      particles.addSmoke(this.x - 50, this.y + 10);
      particles.addSmoke(this.x + 50, this.y + 10);
    }

    // Ataque do Chefe B-2 Spirit / Furtivo — Multi-Ponto (chuva de tiros)
    this.shootTimer1 -= dt * mods.shootFreqMult;
    if (this.shootTimer1 <= 0) {
      this.shootTimer1 = this.phase === 3 ? 0.35 : 0.48;
      const spd = 5.5 * mods.bulletSpeedMult;
      // Canhões exteriores (asas)
      enemyBullets.push(new EnemyBullet(this.x - 60, this.y + 35, -1.0, spd));
      enemyBullets.push(new EnemyBullet(this.x + 60, this.y + 35, 1.0, spd));
      // Canhões internos
      enemyBullets.push(new EnemyBullet(this.x - 20, this.y + 45, -0.3, spd));
      enemyBullets.push(new EnemyBullet(this.x + 20, this.y + 45, 0.3, spd));
    }

    if (this.phase >= 2) {
      this.shootTimer2 -= dt * mods.shootFreqMult;
      if (this.shootTimer2 <= 0) {
        this.shootTimer2 = 2.2;
        sound.playMissileLaunch();
        for (let a of [-0.4, -0.2, 0, 0.2, 0.4]) {
          enemyBullets.push(new EnemyBullet(this.x, this.y + 30, Math.sin(a) * 4.8, Math.cos(a) * 4.8 * mods.bulletSpeedMult, Math.abs(a) < 0.1));
        }
      }
    }

    return this.alive;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Feixe desenhado na faixa-alvo do cenário, não preso ao centro do sprite.
    const beamLocalX = this.laserTargetX - this.x;
    if (this.laserWarning) {
      ctx.fillStyle = 'rgba(255, 118, 92, 0.13)';
      ctx.fillRect(beamLocalX - this.laserWidth / 2, -this.y, this.laserWidth, 1000);
      ctx.strokeStyle = 'rgba(255, 150, 110, 0.95)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.strokeRect(beamLocalX - this.laserWidth / 2, -this.y, this.laserWidth, 1000);
      ctx.setLineDash([]);
    }
    if (this.laserActive) {
      ctx.save();
      ctx.shadowColor = '#ff3155';
      ctx.shadowBlur = 18;
      ctx.fillStyle = 'rgba(255, 25, 65, 0.65)';
      ctx.fillRect(beamLocalX - this.laserWidth / 2, -this.y, this.laserWidth, 1000);
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.fillRect(beamLocalX - 5, -this.y, 10, 1000);
      ctx.restore();
    }

    // Camuflagem Ótica
    if (this.isCloaked) {
      ctx.globalAlpha = 0.25;
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 18;
    }

    // RENDERIZAÇÃO REALISTA DO CHEFE B-2 SPIRIT (width: 200, height: 180)
    // Sem fallback de silhueta geométrica ou retângulos!
    const bossSprite = enemySprites['b2'] || enemySprites[this.type];
    if (bossSprite && bossSprite.complete && bossSprite.naturalWidth > 0) {
      ctx.drawImage(
        bossSprite,
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height
      );
    }

    ctx.restore();
  }
}

// --- 13. ENTRADA DE DADOS COM SUPORTE A TOQUE SUAVE E GAMEPAD (InputHandler) ---
class InputHandler {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = {};
    this.consumed = {};

    this.pointerActive = false;
    this.pointerX = 270;
    this.pointerY = 750;

    this.moveX = 0;
    this.moveY = 0;
    this.fire = false;
    this.rollPressed = false;
    this.bombPressed = false;
    this.specialPressed = false;
    this.missilePressed = false;
    this.focusPressed = false;

    this.bindKeyboard();
    this.bindTouch();
  }

  bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
      this.consumed[e.code] = false;
    });
  }

  bindTouch() {
    const updateCoords = (touch) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      this.pointerX = (touch.clientX - rect.left) * scaleX;
      this.pointerY = (touch.clientY - rect.top) * scaleY;
    };

    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.pointerActive = true;
      updateCoords(e.touches[0]);
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (this.pointerActive) updateCoords(e.touches[0]);
    }, { passive: false });

    window.addEventListener('touchend', () => {
      this.pointerActive = false;
    });
  }

  pollGamepad() {
    let gpMoveX = 0;
    let gpMoveY = 0;
    let gpFire = false;

    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (let gp of gamepads) {
      if (!gp) continue;
      const deadzone = 0.18;
      if (Math.abs(gp.axes[0]) > deadzone) gpMoveX = gp.axes[0];
      if (Math.abs(gp.axes[1]) > deadzone) gpMoveY = gp.axes[1];

      if (gp.buttons[14]?.pressed) gpMoveX = -1;
      if (gp.buttons[15]?.pressed) gpMoveX = 1;
      if (gp.buttons[12]?.pressed) gpMoveY = -1;
      if (gp.buttons[13]?.pressed) gpMoveY = 1;

      if (gp.buttons[0]?.pressed || gp.buttons[7]?.pressed) gpFire = true;
      if (gp.buttons[1]?.pressed || gp.buttons[5]?.pressed) this.specialPressed = true;
      if (gp.buttons[2]?.pressed) this.missilePressed = true;
      if (gp.buttons[3]?.pressed) this.bombPressed = true;
      if (gp.buttons[4]?.pressed) this.rollPressed = true;
    }
    return { gpMoveX, gpMoveY, gpFire };
  }

  update() {
    const { gpMoveX, gpMoveY, gpFire } = this.pollGamepad();

    let kbX = 0;
    let kbY = 0;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) kbX -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) kbX += 1;
    if (this.keys['KeyW'] || this.keys['ArrowUp']) kbY -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) kbY += 1;

    this.moveX = kbX || gpMoveX;
    this.moveY = kbY || gpMoveY;
    this.fire = !!this.keys['Space'] || gpFire;
  }

  consume(code) {
    if (this.keys[code] && !this.consumed[code]) {
      this.consumed[code] = true;
      return true;
    }
    return false;
  }

  consumeRoll() {
    if (this.rollPressed || this.consume('ShiftLeft') || this.consume('ShiftRight')) {
      this.rollPressed = false;
      return true;
    }
    return false;
  }

  consumeBomb() {
    if (this.bombPressed || this.consume('KeyX')) {
      this.bombPressed = false;
      return true;
    }
    return false;
  }

  consumeSpecial() {
    if (this.specialPressed || this.consume('KeyQ')) {
      this.specialPressed = false;
      return true;
    }
    return false;
  }

  consumeMissile() {
    if (this.missilePressed || this.consume('KeyK') || this.consume('KeyC')) {
      this.missilePressed = false;
      return true;
    }
    return false;
  }

  consumeFocus() {
    if (this.focusPressed || this.consume('KeyE')) {
      this.focusPressed = false;
      return true;
    }
    return false;
  }
}

// --- 14. GERENCIADOR DE INIMIGOS E ONDAS (EnemyManager) ---
class EnemyManager {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.enemies = [];
    this.enemyBullets = [];
    this.powerups = [];
    this.coins = [];
    this.boss = null;
    this.spawnTimer = 1.0;
    this.nextSurvivalBossScore = 2500;
  }

  reset() {
    this.enemies = [];
    this.enemyBullets = [];
    this.powerups = [];
    this.coins = [];
    this.boss = null;
    this.spawnTimer = 1.0;
    this.nextSurvivalBossScore = 2500;
  }

  spawnEnemy(type, x, y, hpMult = 1.0) {
    const enemy = new Enemy(type, x, y, hpMult);
    this.enemies.push(enemy);
    return enemy;
  }

  spawnWave(score, difficultyMods, stageNum = 1) {
    const r = Math.random();
    const x = Math.random() * (this.width - 160) + 80;
    const hpMult = difficultyMods.hpMult;

    // Escala Realista e distribuição dinâmica das 5 naves geradas:
    // mig21 (Ligeiro: 48x48), mig29 (Médio: 64x64), su35 / su57 (Pesados: 80x80), b2 (Chefe Gigante: 200x180)
    if ((stageNum >= 4 || score > 2200) && r < 0.14) {
      // B-2 Spirit: Bombardeiro Chefe Gigante (ocupa grande área da tela com 200x180)
      this.spawnEnemy('b2', Math.min(Math.max(x, 110), this.width - 110), -120, hpMult);
    } else if ((stageNum >= 3 || score > 1300) && r < 0.35) {
      // Su-57 Felon: Caça Furtivo/Elite de 5ª Geração (80x80)
      this.spawnEnemy('su57', x, -55, hpMult);
    } else if ((stageNum >= 2 || score > 600) && r < 0.58) {
      // Su-35 Flanker-E: Caça Pesado de Superioridade Aérea (80x80)
      this.spawnEnemy('su35', x, -55, hpMult);
    } else if (score > 200 && r < 0.80) {
      // MiG-29: Caça Médio Interceptador (64x64)
      this.spawnEnemy('mig29', x, -45, hpMult);
    } else {
      // MiG-21: Caça Ligeiro Ágil (48x48)
      this.spawnEnemy('mig21', x, -35, hpMult);
    }
  }

  dropPowerUp(x, y) {
    const r = Math.random();
    let type = 'W';
    if (r < 0.32) type = 'W';
    else if (r < 0.60) type = 'M';
    else if (r < 0.82) type = 'B';
    else type = 'S';
    this.powerups.push(new PowerUp(x, y, type));
  }

  dropCoins(x, y, count = 1) {
    for (let i = 0; i < count; i++) {
      this.coins.push(new Coin(x, y));
    }
  }

  update(dt, player, particles, score, difficultyMods, uiController, currentStageInfo, onBossDefeated, isSurvivalMode) {
    // Aparição do Chefe
    if (!this.boss) {
      const shouldSpawnBoss = isSurvivalMode
        ? score >= this.nextSurvivalBossScore
        : score >= currentStageInfo.bossScoreTrigger;
      if (shouldSpawnBoss) {
        this.boss = new Boss(this.width, this.height, difficultyMods, currentStageInfo);
        // Garante explicitamente que no Modo Infinito ou Fase 5 seja o B-2 Spirit
        if (isSurvivalMode || currentStageInfo.stageNum === 5) {
          this.boss.type = 'b2';
          this.boss.name = 'B-2 Spirit';
          this.boss.title = 'Bombardeiro Estratégico Stealth (CHEFE FINAL)';
          this.boss.width = 200;
          this.boss.height = 180;
          this.boss.radius = 95;
        }
        if (isSurvivalMode) {
          this.nextSurvivalBossScore = Math.max(score + 2500, Math.floor(score / 2500 + 1) * 2500);
        }
        sound.playWarning();
        uiController.triggerRadio(`ALERTA: Assinatura do Chefe ${this.boss.name.toUpperCase()} detectada no radar!`);
      }
    }

    if (!this.boss) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        this.spawnWave(score, difficultyMods, currentStageInfo.stageNum);
        this.spawnTimer = Math.max(0.65, (1.8 - (score / 6000)) / difficultyMods.shootFreqMult);
      }
    }

    if (this.boss) {
      this.boss.update(dt, this.enemyBullets, player, particles, difficultyMods, this.enemies);
      if (this.boss.hp <= 0) {
        particles.addExplosion(this.boss.x, this.boss.y, 75, true);
        this.dropPowerUp(this.boss.x, this.boss.y);
        this.dropCoins(this.boss.x, this.boss.y, 20);
        this.boss = null;
        if (onBossDefeated) onBossDefeated();
      }
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      const keep = e.update(dt, this.enemyBullets, player.x, player.y, difficultyMods);
      if (!keep || e.hp <= 0) {
        if (e.hp <= 0) {
          const isHeavy = e.type === 'b2';
          const isMediumHeavy = e.type === 'su57' || e.type === 'su35';
          particles.addExplosion(e.x, e.y, isHeavy ? 55 : (isMediumHeavy ? 30 : 18), isHeavy);
          const coinCount = isHeavy ? 8 : (isMediumHeavy ? 4 : (e.type === 'mig29' ? 3 : 1));
          this.dropCoins(e.x, e.y, coinCount);

          player.focus = Math.min(player.focusMax, player.focus + (isHeavy ? 25 : 12));
          player.killsWithoutDamage++;

          if (player.killsWithoutDamage >= 15 && !player.overdriveActive) {
            player.overdriveActive = true;
            player.overdriveTimer = 6.0;
            sound.playOverdrive();
            uiController.triggerRadio('PILOTO, OVERDRIVE OPERACIONAL! FOGO TOTAL À VONTADE!');
          }

          if (isHeavy || Math.random() < 0.28) {
            this.dropPowerUp(e.x, e.y);
          }
        }
        this.enemies.splice(i, 1);
      }
    }

    for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
      const b = this.enemyBullets[i];
      const keep = b.update(dt, player.x, player.y);
      if (!keep) this.enemyBullets.splice(i, 1);
    }

    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const p = this.powerups[i];
      if (!p.update(dt)) this.powerups.splice(i, 1);
    }

    for (let i = this.coins.length - 1; i >= 0; i--) {
      const c = this.coins[i];
      if (!c.update(dt, player.x, player.y, player.magnetRadius)) {
        this.coins.splice(i, 1);
      }
    }
  }

  drawEnemies(ctx) {
    for (let e of this.enemies) {
      e.draw(ctx);
    }
  }

  draw(ctx) {
    for (let c of this.coins) c.draw(ctx);
    for (let p of this.powerups) p.draw(ctx);
    this.drawEnemies(ctx);
    if (this.boss) this.boss.draw(ctx);
    for (let b of this.enemyBullets) b.draw(ctx);
  }
}

// --- 15. CONTROLADOR DE INTERFACE DO USUÁRIO (UIController) ---
class UIController {
  constructor(engine) {
    this.engine = engine;
    this.radioBox = document.getElementById('militaryRadioBox');
    this.radioText = document.getElementById('radioMessageText');
    this.radioTimer = null;
  }

  triggerRadio(text, duration = 4.2) {
    if (this.radioTimer) clearTimeout(this.radioTimer);
    sound.playRadioChirp();
    this.radioText.innerText = text;
    this.radioBox.classList.remove('hidden');

    this.radioTimer = setTimeout(() => {
      this.radioBox.classList.add('hidden');
      this.radioTimer = null;
    }, duration * 1000);
  }
}

// --- 16. MOTOR PRINCIPAL DO JOGO (GameEngine) ---
class GameEngine {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false; // Configuração obrigatória de Pixel Art para renderização nítida
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.saveData = StorageManager.load();
    if (this.saveData.plane === 'su57') {
      this.saveData.plane = 'fa18';
    }
    this.selectedPlane = ['f14', 'f22', 'fa18', 'a10'].includes(this.saveData.plane) ? this.saveData.plane : 'f14';
    this.selectedDifficulty = this.saveData.difficulty;
    this.gameMode = this.saveData.mode; // 'campaign' ou 'survival'
    this.totalGold = this.saveData.gold;
    this.highScore = this.saveData.highScore;
    this.upgrades = this.saveData.upgrades;
    this.leaderboard = this.saveData.leaderboard;

    this.currentStageIndex = 0; // 0 a 4 (Estágios 1 a 5)
    this.currentStageInfo = STAGES[0];
    this.lastSurvivalBiomeScore = 0;

    this.input = new InputHandler(this.canvas);
    this.background = new ParallaxBackground(this.width, this.height);
    this.particles = new ParticleSystem();
    this.weather = new WeatherSystem(this.width, this.height);
    this.enemyMgr = new EnemyManager(this.width, this.height);
    this.player = new Player(this.width / 2, 750, this.selectedPlane, this.upgrades);
    this.ui = new UIController(this);
    this.projectiles = [];

    this.state = 'START'; // Sempre iniciar no menu principal
    this.previousState = 'START';
    this.score = 0;
    this.stageScore = 0;
    this.stageKills = 0;
    this.stageGold = 0;
    this.sessionGold = 0;
    this.combo = 1;
    this.comboTimer = 0;
    this.comboMaxTimer = 2.5;
    this.totalKills = 0;

    // Elementos DOM
    this.startScreen = document.getElementById('startScreen');
    this.pauseScreen = document.getElementById('pauseScreen');
    this.stageClearScreen = document.getElementById('stageClearScreen');
    this.victoryScreen = document.getElementById('victoryScreen');
    this.gameOverScreen = document.getElementById('gameOverScreen');
    this.shopScreen = document.getElementById('shopScreen');
    this.leaderboardModal = document.getElementById('leaderboardModal');

    this.soundBtn = document.getElementById('soundToggleBtn');
    this.pauseHudBtn = document.getElementById('pauseHudBtn');
    this.leaderboardHudBtn = document.getElementById('leaderboardHudBtn');

    this.touchRollBtn = document.getElementById('touchRollBtn');
    this.touchSpecialBtn = document.getElementById('touchSpecialBtn');
    this.touchSpecialLabel = document.getElementById('touchSpecialLabel');
    this.touchBombBtn = document.getElementById('touchBombBtn');
    this.touchBombLabel = document.getElementById('touchBombLabel');
    this.touchMissileBtn = document.getElementById('touchMissileBtn');
    this.touchMissileLabel = document.getElementById('touchMissileLabel');
    this.touchFocusBtn = document.getElementById('touchFocusBtn');

    this.bindEvents();
    this.updateShopUI();
    this.updatePlaneSelectionUI();
    this.updateDifficultyUI();
    this.updateModeUI();
    this.renderLeaderboard();

    // Garantia de inicialização: abrir no menu, nunca diretamente na batalha.
    this.startScreen.classList.remove('hidden');
    this.pauseScreen.classList.add('hidden');
    this.stageClearScreen.classList.add('hidden');
    this.victoryScreen.classList.add('hidden');
    this.gameOverScreen.classList.add('hidden');
    this.shopScreen.classList.add('hidden');
    this.leaderboardModal.classList.add('hidden');

    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  bindEvents() {
    // Decolagem e Reinício
    document.getElementById('startBtn').addEventListener('click', () => this.startGame());
    document.getElementById('resumeBtn').addEventListener('click', () => this.togglePause());
    document.getElementById('restartPauseBtn').addEventListener('click', () => this.restartGame());
    document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
    document.getElementById('quitMenuBtn').addEventListener('click', () => this.returnToMenu());
    document.getElementById('gameOverMenuBtn').addEventListener('click', () => this.returnToMenu());

    // Transição de Estágio e Vitória
    document.getElementById('nextStageBtn').addEventListener('click', () => this.nextStage());
    document.getElementById('stageClearShopBtn').addEventListener('click', () => this.openShop());
    document.getElementById('victoryContinueInfiniteBtn').addEventListener('click', () => {
      this.victoryScreen.classList.add('hidden');
      this.setMode('survival');
      this.startGame();
    });
    document.getElementById('victoryHangarBtn').addEventListener('click', () => this.returnToMenu());

    // Top HUD Buttons
    this.pauseHudBtn.addEventListener('click', () => this.togglePause());
    this.leaderboardHudBtn.addEventListener('click', () => this.openLeaderboard());

    // Áudio
    this.soundBtn.addEventListener('click', () => {
      sound.init();
      const isMuted = sound.toggleMute();
      this.soundBtn.innerText = isMuted ? '[ AUDIO: OFF ]' : '[ AUDIO: ON ]';
    });

    document.getElementById('toggleMusicBtn').addEventListener('click', (e) => {
      sound.init();
      const on = sound.toggleMusic();
      e.target.innerText = on ? 'LIGADA' : 'DESLIGADA';
      e.target.classList.toggle('active', on);
    });

    document.getElementById('toggleSfxBtn').addEventListener('click', (e) => {
      sound.init();
      const on = sound.toggleSfx();
      e.target.innerText = on ? 'LIGADOS' : 'DESLIGADOS';
      e.target.classList.toggle('active', on);
    });

    // Seletor de Modo
    document.getElementById('modeCampaignBtn').addEventListener('click', () => this.setMode('campaign'));
    document.getElementById('modeSurvivalBtn').addEventListener('click', () => this.setMode('survival'));

    // Loja (Upgrades)
    document.getElementById('openShopBtn').addEventListener('click', () => this.openShop());
    document.getElementById('pauseShopBtn').addEventListener('click', () => this.openShop());
    document.getElementById('gameOverShopBtn').addEventListener('click', () => this.openShop());
    document.getElementById('closeShopBtn').addEventListener('click', () => this.closeShop());

    document.getElementById('buyArmorBtn').addEventListener('click', () => this.buyUpgrade('armor'));
    document.getElementById('buyRadiatorBtn').addEventListener('click', () => this.buyUpgrade('radiator'));
    document.getElementById('buyAmmoBtn').addEventListener('click', () => this.buyUpgrade('ammoDepot'));
    document.getElementById('buyThrustersBtn').addEventListener('click', () => this.buyUpgrade('thrusters'));
    document.getElementById('buyMagnetBtn').addEventListener('click', () => this.buyUpgrade('magnet'));

    // Recordes
    document.getElementById('openLeaderboardBtn').addEventListener('click', () => this.openLeaderboard());
    document.getElementById('closeLeaderboardBtn').addEventListener('click', () => this.closeLeaderboard());

    // Dificuldade
    document.querySelectorAll('.diff-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const diff = e.currentTarget.dataset.diff;
        if (diff) this.setDifficulty(diff);
      });
    });

    // Caças
    document.querySelectorAll('.plane-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const plane = e.currentTarget.dataset.plane;
        this.selectPlane(plane);
      });
    });

    // Botões Virtuais de Toque
    this.touchRollBtn.addEventListener('click', () => { this.input.rollPressed = true; });
    this.touchSpecialBtn.addEventListener('click', () => { this.input.specialPressed = true; });
    this.touchBombBtn.addEventListener('click', () => { this.input.bombPressed = true; });
    this.touchMissileBtn.addEventListener('click', () => { this.input.missilePressed = true; });
    this.touchFocusBtn.addEventListener('click', () => { this.input.focusPressed = true; });
  }

  setMode(mode) {
    this.gameMode = mode;
    this.saveData.mode = mode;
    StorageManager.save(this.saveData);
    this.updateModeUI();
  }

  updateModeUI() {
    document.getElementById('modeCampaignBtn').classList.toggle('active', this.gameMode === 'campaign');
    document.getElementById('modeSurvivalBtn').classList.toggle('active', this.gameMode === 'survival');
  }

  setDifficulty(diff) {
    this.selectedDifficulty = diff;
    this.saveData.difficulty = diff;
    StorageManager.save(this.saveData);
    this.updateDifficultyUI();
  }

  updateDifficultyUI() {
    document.querySelectorAll('.diff-btn[data-diff]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.diff === this.selectedDifficulty);
    });
  }

  selectPlane(planeId) {
    if (!['f14', 'f22', 'fa18', 'a10'].includes(planeId)) return;
    this.selectedPlane = planeId;
    this.saveData.plane = planeId;
    StorageManager.save(this.saveData);
    this.updatePlaneSelectionUI();
  }

  updatePlaneSelectionUI() {
    document.querySelectorAll('.plane-card').forEach(card => {
      card.classList.toggle('active', card.dataset.plane === this.selectedPlane);
    });

    const data = PLANE_DATA[this.selectedPlane] || PLANE_DATA.fa18;
    document.getElementById('fighterDetailTitle').innerText = data.name.toUpperCase();
    document.getElementById('fighterDetailSpecial').innerText = `Q: ${data.specialName.toUpperCase()}`;
    document.getElementById('fighterDetailDesc').innerText = data.desc;
    document.getElementById('statSpeedFill').style.width = `${data.statSpeed}%`;
    document.getElementById('statArmorFill').style.width = `${data.statArmor}%`;
    document.getElementById('statDamageFill').style.width = `${data.statDamage}%`;
    this.touchSpecialLabel.innerText = `[${data.specialName}]`;
  }

  getUpgradeCost(type) {
    const u = UPGRADE_DATA[type];
    const lvl = this.upgrades[type] || 0;
    if (lvl >= u.maxLevel) return null;
    return Math.round(u.baseCost * Math.pow(u.mult, lvl));
  }

  buyUpgrade(type) {
    const cost = this.getUpgradeCost(type);
    if (cost !== null && this.totalGold >= cost) {
      this.totalGold -= cost;
      this.upgrades[type] = (this.upgrades[type] || 0) + 1;
      this.saveData.gold = this.totalGold;
      this.saveData.upgrades = this.upgrades;
      StorageManager.save(this.saveData);

      sound.playPowerup();
      this.updateShopUI();
    }
  }

  updateShopUI() {
    document.getElementById('menuGoldDisplay').innerText = this.totalGold.toLocaleString();
    document.getElementById('shopGoldDisplay').innerText = this.totalGold.toLocaleString();
    document.getElementById('pauseGoldDisplay').innerText = this.sessionGold.toLocaleString();

    const renderPips = (elemId, lvl, maxLvl) => {
      const container = document.getElementById(elemId);
      container.innerHTML = '';
      for (let i = 0; i < maxLvl; i++) {
        const dot = document.createElement('div');
        dot.className = `level-dot ${i < lvl ? 'active' : ''}`;
        container.appendChild(dot);
      }
    };

    const updateBtn = (btnId, costId, type) => {
      const cost = this.getUpgradeCost(type);
      const btn = document.getElementById(btnId);
      const costText = document.getElementById(costId);
      if (cost === null) {
        costText.innerText = 'MAX';
        btn.disabled = true;
      } else {
        costText.innerText = `🪙 ${cost}`;
        btn.disabled = this.totalGold < cost;
      }
    };

    renderPips('armorLevelPips', this.upgrades.armor || 0, 5);
    renderPips('radiatorLevelPips', this.upgrades.radiator || 0, 5);
    renderPips('ammoLevelPips', this.upgrades.ammoDepot || 0, 5);
    renderPips('thrustersLevelPips', this.upgrades.thrusters || 0, 5);
    renderPips('magnetLevelPips', this.upgrades.magnet || 0, 5);

    updateBtn('buyArmorBtn', 'armorCostText', 'armor');
    updateBtn('buyRadiatorBtn', 'radiatorCostText', 'radiator');
    updateBtn('buyAmmoBtn', 'ammoCostText', 'ammoDepot');
    updateBtn('buyThrustersBtn', 'thrustersCostText', 'thrusters');
    updateBtn('buyMagnetBtn', 'magnetCostText', 'magnet');
  }

  openShop() {
    if (this.state !== 'SHOP') this.previousState = this.state;
    [this.startScreen, this.pauseScreen, this.stageClearScreen, this.gameOverScreen, this.leaderboardModal].forEach(el => el.classList.add('hidden'));
    this.state = 'SHOP';
    this.updateShopUI();
    this.shopScreen.classList.remove('hidden');
  }

  closeShop() {
    this.shopScreen.classList.add('hidden');
    this.state = this.previousState || 'START';
    this.restoreOverlayForState();
  }

  openLeaderboard() {
    if (this.state !== 'LEADERBOARD') this.previousState = this.state;
    [this.startScreen, this.pauseScreen, this.stageClearScreen, this.gameOverScreen, this.shopScreen].forEach(el => el.classList.add('hidden'));
    this.state = 'LEADERBOARD';
    this.renderLeaderboard();
    this.leaderboardModal.classList.remove('hidden');
  }

  closeLeaderboard() {
    this.leaderboardModal.classList.add('hidden');
    this.state = this.previousState || 'START';
    this.restoreOverlayForState();
  }

  restoreOverlayForState() {
    const screens = { START: this.startScreen, PAUSED: this.pauseScreen, STAGE_CLEAR: this.stageClearScreen, GAMEOVER: this.gameOverScreen, VICTORY: this.victoryScreen };
    Object.values(screens).forEach(el => el.classList.add('hidden'));
    const target = screens[this.state] || this.startScreen;
    target.classList.remove('hidden');
  }

  renderLeaderboard() {
    const tbody = document.getElementById('leaderboardBody');
    tbody.innerHTML = '';
    const medals = ['#01', '#02', '#03', '#04', '#05'];

    this.leaderboard.forEach((entry, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="rank-medal">${medals[i] || (i + 1)}</td>
        <td style="color:#00e5ff; font-weight:bold;">${entry.score.toLocaleString()}</td>
        <td>${entry.plane}</td>
        <td>${entry.kills}</td>
        <td style="color:#90a4ae; font-size:10px;">${entry.date}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  startGame() {
    sound.init();
    this.state = 'PLAYING';
    this.score = 0;
    this.stageScore = 0;
    this.stageKills = 0;
    this.stageGold = 0;
    this.sessionGold = 0;
    this.totalKills = 0;
    this.combo = 1;
    this.comboTimer = 0;
    this.lastSurvivalBiomeScore = 0;
    this.projectiles = [];
    this.enemyMgr.reset();

    this.currentStageIndex = 0;
    this.currentStageInfo = STAGES[0];
    this.background.setStage(this.currentStageInfo.id);
    this.weather.setStage(this.currentStageInfo.id);

    this.player = new Player(this.width / 2, 750, this.selectedPlane, this.upgrades);

    this.startScreen.classList.add('hidden');
    this.pauseScreen.classList.add('hidden');
    this.stageClearScreen.classList.add('hidden');
    this.victoryScreen.classList.add('hidden');
    this.gameOverScreen.classList.add('hidden');
    this.shopScreen.classList.add('hidden');
    this.leaderboardModal.classList.add('hidden');

    this.lastTime = performance.now();
    this.ui.triggerRadio(this.currentStageInfo.briefing);
  }

  nextStage() {
    this.currentStageIndex++;
    if (this.currentStageIndex >= STAGES.length) {
      this.currentStageIndex = 0;
    }
    this.currentStageInfo = STAGES[this.currentStageIndex];
    this.stageScore = 0;
    this.stageKills = 0;
    this.stageGold = 0;
    this.enemyMgr.reset();
    this.projectiles = [];

    this.background.setStage(this.currentStageInfo.id);
    this.weather.setStage(this.currentStageInfo.id);
    this.stageClearScreen.classList.add('hidden');
    this.state = 'PLAYING';
    this.lastTime = performance.now();
    this.ui.triggerRadio(this.currentStageInfo.briefing);
  }

  onBossDefeated() {
    if (this.gameMode === 'campaign') {
      if (this.currentStageIndex === STAGES.length - 1) {
        // Estágio 5 concluído: Vitória da Campanha!
        this.onCampaignVictory();
      } else {
        // Transição de Estágio (1 a 4)
        this.onStageComplete();
      }
    } else {
      // No Modo Sobrevivência
      this.addScore(5000);
      this.ui.triggerRadio('Ameaça neutralizada! Prepare-se para a próxima onda de sobrevivência.');
    }
  }

  onStageComplete() {
    this.state = 'STAGE_CLEAR';
    const bonus = 250;
    this.sessionGold += bonus;
    this.totalGold += bonus;
    this.saveData.gold = this.totalGold;
    StorageManager.save(this.saveData);

    document.getElementById('stageClearSubtitle').innerText = `${this.currentStageInfo.name.toUpperCase()} NEUTRALIZADO`;
    document.getElementById('stageKillsText').innerText = this.stageKills;
    document.getElementById('stageScoreText').innerText = this.stageScore.toLocaleString();
    document.getElementById('stageGoldText').innerText = `🪙 ${this.stageGold}`;
    document.getElementById('stageBonusText').innerText = `+${bonus} 🪙`;
    document.getElementById('nextStageBriefingText').innerText = this.currentStageInfo.nextBriefing;

    this.stageClearScreen.classList.remove('hidden');
    sound.playPowerup();
  }

  onCampaignVictory() {
    this.state = 'VICTORY';
    const victoryBonus = 1500;
    this.sessionGold += victoryBonus;
    this.totalGold += victoryBonus;

    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveData.highScore = this.highScore;
    }
    this.saveData.gold = this.totalGold;
    StorageManager.save(this.saveData);

    document.getElementById('victoryFinalScore').innerText = this.score.toLocaleString();
    document.getElementById('victoryTotalKills').innerText = this.totalKills;

    this.victoryScreen.classList.remove('hidden');
    sound.playOverdrive();
  }

  togglePause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      this.updateShopUI();
      this.pauseScreen.classList.remove('hidden');
    } else if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      this.pauseScreen.classList.add('hidden');
      this.lastTime = performance.now();
    }
  }

  restartGame() {
    this.startGame();
  }

  returnToMenu() {
    this.state = 'START';
    this.pauseScreen.classList.add('hidden');
    this.gameOverScreen.classList.add('hidden');
    this.stageClearScreen.classList.add('hidden');
    this.victoryScreen.classList.add('hidden');
    this.shopScreen.classList.add('hidden');
    this.leaderboardModal.classList.add('hidden');
    this.startScreen.classList.remove('hidden');
    this.updateShopUI();
  }

  gameOver() {
    this.state = 'GAMEOVER';
    this.totalGold += this.sessionGold;
    this.saveData.gold = this.totalGold;

    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveData.highScore = this.highScore;
    }

    if (this.gameMode === 'survival') {
      this.leaderboard = StorageManager.recordSurvivalScore(this.score, this.player.data.name.split(' ')[0], this.totalKills);
      this.saveData.leaderboard = this.leaderboard;
    }

    StorageManager.save(this.saveData);

    document.getElementById('finalScore').innerText = this.score.toLocaleString();
    document.getElementById('highScoreStat').innerText = this.highScore.toLocaleString();
    document.getElementById('killsStat').innerText = this.totalKills;
    document.getElementById('goldEarnedStat').innerText = this.sessionGold.toLocaleString();

    this.gameOverScreen.classList.remove('hidden');
    this.ui.triggerRadio('Sinal de emergência emitido... Aeronave abatida. Resgate tático enviado.');
  }

  addScore(amount) {
    const diffMods = DIFFICULTY_MODS[this.selectedDifficulty];
    const earned = Math.round(amount * this.combo * diffMods.scoreMult);
    this.score += earned;
    this.stageScore += earned;
    this.comboTimer = this.comboMaxTimer;
    this.combo = Math.min(5.0, Number((this.combo + 0.1).toFixed(1)));
  }

  checkCollisions() {
    const enemies = this.enemyMgr.enemies;
    const bullets = this.enemyMgr.enemyBullets;
    const powerups = this.enemyMgr.powerups;
    const coins = this.enemyMgr.coins;
    const boss = this.enemyMgr.boss;
    const surfaceTargets = this.background.surfaceTargets;
    const diffMods = DIFFICULTY_MODS[this.selectedDifficulty];

    // Projéteis do Jogador
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];

      // Contra o Chefe
      if (boss && boss.hp > 0 && !boss.isCloaked) {
        const dist = Math.hypot(boss.x - p.x, boss.y - p.y);
        if (dist < boss.radius + p.radius) {
          boss.hp -= p.damage;
          this.particles.addExplosion(p.x, p.y, 4, false);
          if (!p.isOverdrive) this.projectiles.splice(i, 1);
          if (boss.hp <= 0) {
            this.addScore(4000);
            this.stageKills++;
            this.totalKills++;
          }
          continue;
        }
      }

      // Contra Alvos Terrestres
      let hitSurface = false;
      for (let st of surfaceTargets) {
        if (st.alive && st.hp > 0) {
          const dist = Math.hypot(st.x - p.x, st.y - p.y);
          if (dist < st.radius + p.radius) {
            st.hp -= p.damage;
            this.particles.addExplosion(p.x, p.y, 4, false);
            hitSurface = true;
            if (st.hp <= 0) {
              st.alive = false;
              this.particles.addExplosion(st.x, st.y, st.type === 'warship' ? 45 : 25, st.type === 'warship');
              this.enemyMgr.dropCoins(st.x, st.y, st.type === 'warship' ? 6 : 2);
              this.addScore(st.type === 'warship' ? 500 : 200);
            }
            break;
          }
        }
      }
      if (hitSurface && !p.isOverdrive) {
        this.projectiles.splice(i, 1);
        continue;
      }

      // Contra Inimigos Normais
      for (let enemy of enemies) {
        if (enemy.hp > 0) {
          const dist = Math.hypot(enemy.x - p.x, enemy.y - p.y);
          if (dist < enemy.radius + p.radius) {
            enemy.hp -= p.damage;
            this.particles.addExplosion(p.x, p.y, 3, false);
            if (!p.isOverdrive) this.projectiles.splice(i, 1);
            if (enemy.hp <= 0) {
              this.addScore(enemy.scoreVal);
              this.stageKills++;
              this.totalKills++;
            }
            break;
          }
        }
      }
    }

    // Balas Inimigas contra o Jogador
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      const dist = Math.hypot(this.player.x - b.x, this.player.y - b.y);
      if (dist < this.player.radius + b.radius) {
        const hit = this.player.takeDamage(b.isHoming ? 28 : 18, this.particles, diffMods.playerDamageMult, this.ui);
        if (hit) {
          this.combo = 1;
          bullets.splice(i, 1);
          if (this.player.hp <= 0) {
            this.particles.addExplosion(this.player.x, this.player.y, 50, true);
            this.gameOver();
          }
        }
      }
    }

    // Colisão Física Inimigo vs Jogador
    for (let enemy of enemies) {
      if (enemy.hp > 0) {
        const dist = Math.hypot(this.player.x - enemy.x, this.player.y - enemy.y);
        if (dist < this.player.radius + enemy.radius) {
          const dmg = enemy.type === 'b2' ? 65 : (enemy.type === 'su57' || enemy.type === 'su35' ? 45 : 30);
          this.player.takeDamage(dmg, this.particles, diffMods.playerDamageMult, this.ui);
          if (enemy.type === 'b2') {
            enemy.hp -= 200;
          } else {
            enemy.hp = 0;
          }
          this.combo = 1;
          if (this.player.hp <= 0) {
            this.particles.addExplosion(this.player.x, this.player.y, 50, true);
            this.gameOver();
          }
        }
      }
    }

    // Power-ups
    for (let i = powerups.length - 1; i >= 0; i--) {
      const pu = powerups[i];
      const dist = Math.hypot(this.player.x - pu.x, this.player.y - pu.y);
      if (dist < this.player.radius + pu.radius) {
        sound.playPowerup();
        if (pu.type === 'W') {
          this.player.weaponLevel = Math.min(3, this.player.weaponLevel + 1);
        } else if (pu.type === 'M') {
          this.player.missiles = Math.min(this.player.maxMissiles, this.player.missiles + 4);
        } else if (pu.type === 'B') {
          this.player.bombs = Math.min(this.player.maxBombs, this.player.bombs + 1);
        } else if (pu.type === 'S') {
          this.player.hp = Math.min(this.player.maxHp, this.player.hp + Math.round(this.player.maxHp * 0.35));
        }
        powerups.splice(i, 1);
      }
    }

    // Moedas
    for (let i = coins.length - 1; i >= 0; i--) {
      const c = coins[i];
      const dist = Math.hypot(this.player.x - c.x, this.player.y - c.y);
      if (dist < this.player.radius + c.radius) {
        sound.playCoin();
        this.sessionGold += c.value;
        this.stageGold += c.value;
        coins.splice(i, 1);
      }
    }
  }

  update(dt) {
    if (this.input.consume('KeyP') || this.input.consume('Escape')) {
      this.togglePause();
    }

    if (this.state !== 'PLAYING') return;

    // Bullet Time desacelera o mundo em 60%
    const timeScale = this.player.focusActive ? 0.4 : 1.0;
    const gameDt = dt * timeScale;

    this.input.update();

    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.combo = 1;
    }

    const diffMods = { ...DIFFICULTY_MODS[this.selectedDifficulty] };

    // Dificuldade progressiva infinita no Modo Sobrevivência
    const isSurvival = this.gameMode === 'survival';
    if (isSurvival) {
      const survivalScale = this.score / 2000;
      diffMods.hpMult += survivalScale * 0.4;
      diffMods.shootFreqMult += survivalScale * 0.25;
      diffMods.bulletSpeedMult += survivalScale * 0.2;

      // Troca dinâmica e progressiva de cenário a cada 2.500 pontos no Modo Sobrevivência
      const currentSurvivalInterval = Math.floor(this.score / 2500);
      if (currentSurvivalInterval > this.lastSurvivalBiomeScore) {
        this.lastSurvivalBiomeScore = currentSurvivalInterval;
        const stageIdx = currentSurvivalInterval % STAGES.length;
        this.currentStageInfo = STAGES[stageIdx];
        // Aplica transição suave (dissolução cruzada de 3.0s) entre o bioma atual e o próximo
        this.background.transitionToStage(this.currentStageInfo.id, 3.0);
        this.weather.setStage(this.currentStageInfo.id, true);
        this.ui.triggerRadio(`Transição de setor: ${this.currentStageInfo.name.toUpperCase()}! Perigo: ${this.currentStageInfo.hazard}`);
      }
    }

    this.background.update(gameDt, this.enemyMgr.enemyBullets, this.player.x, this.player.y, diffMods.bulletSpeedMult);
    this.weather.update(gameDt, this.player, this.particles, this.enemyMgr.enemyBullets);
    this.particles.update(gameDt);

    this.player.update(
      dt, // Jogador sempre ágil em dt total
      this.input,
      this.particles,
      this.projectiles,
      this.enemyMgr.enemies,
      this.enemyMgr.enemyBullets,
      this.enemyMgr.boss,
      diffMods.playerDamageMult,
      this.ui
    );

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      const keep = p.update(dt, this.enemyMgr.enemies);
      if (p.isMissile) this.particles.addSmoke(p.x, p.y + 10);
      if (!keep) this.projectiles.splice(i, 1);
    }

    this.enemyMgr.update(
      gameDt,
      this.player,
      this.particles,
      isSurvival ? this.score : this.stageScore,
      diffMods,
      this.ui,
      this.currentStageInfo,
      () => this.onBossDefeated(),
      isSurvival
    );

    this.checkCollisions();

    // Atualização de Estados Visuais dos Botões Touch
    this.touchRollBtn.classList.toggle('cooldown', this.player.rollCooldown > 0);
    this.touchSpecialBtn.classList.toggle('ready', this.player.specialCooldown <= 0);
    this.touchSpecialBtn.classList.toggle('cooldown', this.player.specialCooldown > 0);
    this.touchBombBtn.classList.toggle('cooldown', this.player.bombs <= 0);
    this.touchBombLabel.innerText = `[${this.player.bombs}]`;
    this.touchMissileLabel.innerText = `[${this.player.missiles}]`;
    this.touchMissileBtn.classList.toggle('cooldown', this.player.missiles <= 0);
    this.touchFocusBtn.classList.toggle('cooldown', this.player.focus < 25 || this.player.focusActive);
  }

  drawHUD() {
    const ctx = this.ctx;
    ctx.save();

    // ==========================================
    // 1. MIRA TÁTICA CENTRAL (CROSSHAIR HUD DE CAÇA TOP GUN)
    // ==========================================
    const cx = this.width / 2;
    const cy = this.height / 2 - 30;

    // Círculo Central Fino
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.42)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(cx, cy, 24, 0, Math.PI * 2);
    ctx.stroke();

    // Ponto Central Pipper de Mira
    ctx.fillStyle = 'rgba(0, 255, 255, 0.75)';
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fill();

    // Linhas Tracejadas Laterais de Horizonte Artificial Tático
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.35)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.moveTo(cx - 95, cy);
    ctx.lineTo(cx - 32, cy);
    ctx.moveTo(cx + 32, cy);
    ctx.lineTo(cx + 95, cy);
    ctx.stroke();
    ctx.setLineDash([]);

    // Colchetes Angulares [ ] de Travamento Radar (Lock-on Brackets)
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.55)';
    ctx.lineWidth = 1.4;
    const bW = 54;
    const bH = 32;
    const bL = 10;
    // Colchete Esquerdo [
    ctx.beginPath();
    ctx.moveTo(cx - bW + bL, cy - bH);
    ctx.lineTo(cx - bW, cy - bH);
    ctx.lineTo(cx - bW, cy + bH);
    ctx.lineTo(cx - bW + bL, cy + bH);
    ctx.stroke();
    // Colchete Direito ]
    ctx.beginPath();
    ctx.moveTo(cx + bW - bL, cy - bH);
    ctx.lineTo(cx + bW, cy - bH);
    ctx.lineTo(cx + bW, cy + bH);
    ctx.lineTo(cx + bW - bL, cy + bH);
    ctx.stroke();

    // Marcador Tático Superior da Mira
    ctx.fillStyle = 'rgba(0, 255, 0, 0.45)';
    ctx.font = 'bold 8px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('RADAR LOCK', cx, cy - 36);

    // ==========================================
    // 2. FAIXAS E MOLDURAS MILITARES DO HUD
    // ==========================================
    // Moldura Superior Translúcida
    ctx.fillStyle = 'rgba(5, 12, 10, 0.88)';
    ctx.fillRect(0, 0, this.width, 82);
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, 0, this.width, 82);

    // Moldura Inferior Translúcida
    ctx.fillStyle = 'rgba(5, 12, 10, 0.88)';
    ctx.fillRect(0, this.height - 76, this.width, 76);
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, this.height - 76, this.width, 76);

    // ==========================================
    // 3. CANTO SUPERIOR ESQUERDO: PONTUAÇÃO & FASE
    // ==========================================
    ctx.textAlign = 'left';
    ctx.fillStyle = '#00FF00';
    ctx.font = 'bold 11px "Courier New", monospace';
    ctx.fillText('[ PONTUAÇÃO ]', 18, 22);

    ctx.fillStyle = '#00FFFF';
    ctx.font = 'bold 18px "Courier New", monospace';
    ctx.fillText(this.score.toString().padStart(6, '0'), 18, 42);

    ctx.fillStyle = '#00FF00';
    ctx.font = 'bold 10px "Courier New", monospace';
    ctx.fillText('[ FASE ]', 18, 59);

    ctx.fillStyle = '#00FFFF';
    ctx.font = 'bold 10px "Courier New", monospace';
    const rawStageName = this.currentStageInfo.name.toUpperCase();
    const phaseText = this.gameMode === 'campaign' ? `CAMPANHA: ${rawStageName}` : `INFINITO: ${rawStageName}`;
    ctx.fillText(phaseText, 18, 73);

    // ==========================================
    // 4. CANTO SUPERIOR DIREITO: MODO & STATUS
    // ==========================================
    ctx.textAlign = 'right';
    ctx.fillStyle = '#00FF00';
    ctx.font = 'bold 11px "Courier New", monospace';
    ctx.fillText('[ MODO ]', this.width - 18, 22);

    ctx.fillStyle = '#00FFFF';
    ctx.font = 'bold 15px "Courier New", monospace';
    const modeText = this.gameMode === 'campaign' ? 'CAMPANHA' : 'INFINITO';
    ctx.fillText(modeText, this.width - 18, 41);

    ctx.fillStyle = '#00FF00';
    ctx.font = 'bold 10px "Courier New", monospace';
    ctx.fillText('[ RECURSOS ]', this.width - 18, 59);

    ctx.fillStyle = '#00FFFF';
    ctx.font = 'bold 10px "Courier New", monospace';
    ctx.fillText(`${this.sessionGold} PTS | HI: ${this.highScore.toString().padStart(6, '0')}`, this.width - 18, 73);

    // Indicadores Centrais de Desempenho (Combo / Overdrive)
    if (this.combo > 1) {
      ctx.textAlign = 'center';
      ctx.fillStyle = '#00FF00';
      ctx.font = 'bold 12px "Courier New", monospace';
      ctx.fillText(`COMBO x${this.combo.toFixed(1)}`, this.width / 2, 28);
    }
    if (this.player.overdriveActive) {
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FF0033';
      ctx.font = 'bold 11px "Courier New", monospace';
      ctx.fillText('OVERDRIVE OPERACIONAL', this.width / 2, 48);
    }

    // ==========================================
    // 5. CANTO INFERIOR ESQUERDO: ARMA & SUPERAQUECIMENTO
    // ==========================================
    ctx.textAlign = 'left';
    ctx.fillStyle = '#00FF00';
    ctx.font = 'bold 11px "Courier New", monospace';
    ctx.fillText('[ ARMA ]', 18, this.height - 56);

    let gunName = 'CANHÃO GAU-8';
    if (this.player.data.id === 'f14') gunName = 'CANHÃO M61 VULCAN';
    else if (this.player.data.id === 'f22') gunName = 'CANHÃO M61A2 PLASMA';
    else if (this.player.data.id === 'fa18') gunName = 'CANHÃO M61 20MM';
    else if (this.player.data.id === 'a10') gunName = 'CANHÃO GAU-8';

    if (this.player.overheated) {
      // Texto 'SUPERAQUECIDO!' em Vermelho Neon se arma estiver em cooldown/superaquecida
      ctx.fillStyle = '#FF0033';
      ctx.font = 'bold 13px "Courier New", monospace';
      ctx.fillText('SUPERAQUECIDO!', 18, this.height - 38);

      ctx.fillStyle = '#FF0033';
      ctx.font = 'bold 10px "Courier New", monospace';
      ctx.fillText(`REINICIALIZANDO: ${this.player.overheatTimer.toFixed(1)}S`, 18, this.height - 20);
    } else {
      ctx.fillStyle = '#00FFFF';
      ctx.font = 'bold 12px "Courier New", monospace';
      ctx.fillText(gunName, 18, this.height - 38);

      ctx.fillStyle = this.player.heat > 75 ? '#FF0033' : '#00FF00';
      ctx.font = 'bold 10px "Courier New", monospace';
      ctx.fillText(`TEMPERATURA: ${Math.round(this.player.heat)}%`, 18, this.height - 20);
    }

    // ==========================================
    // 6. CANTO INFERIOR DIREITO: BLINDAGEM & MÍSSEIS
    // ==========================================
    ctx.textAlign = 'right';
    const hpPct = Math.max(0, this.player.hp / this.player.maxHp);
    const totalBlocks = 10;
    const filledBlocks = Math.min(totalBlocks, Math.max(0, Math.round(hpPct * totalBlocks)));
    const emptyBlocks = totalBlocks - filledBlocks;
    const blockStr = '■'.repeat(filledBlocks) + '□'.repeat(emptyBlocks);
    const pctStr = `${Math.round(hpPct * 100)}%`;

    ctx.fillStyle = '#00FF00';
    ctx.font = 'bold 11px "Courier New", monospace';
    ctx.fillText('[ BLINDAGEM ]', this.width - 18, this.height - 56);

    ctx.fillStyle = hpPct > 0.3 ? '#00FFFF' : '#FF0033';
    ctx.font = 'bold 12px "Courier New", monospace';
    ctx.fillText(`[${blockStr}] ${pctStr}`, this.width - 18, this.height - 38);

    ctx.fillStyle = '#00FF00';
    ctx.font = 'bold 11px "Courier New", monospace';
    let missilePips = '';
    if (this.player.missiles > 0) {
      missilePips = '> '.repeat(Math.min(6, this.player.missiles)).trim();
    } else {
      missilePips = 'ESGOTADO';
    }
    ctx.fillText(`MÍSSEIS: [ ${missilePips} ]`, this.width - 18, this.height - 20);

    // ==========================================
    // 7. BARRA SEGMENTADA TÁTICA DO CHEFE
    // ==========================================
    const boss = this.enemyMgr.boss;
    if (boss && boss.hp > 0) {
      const bossBarW = 340;
      const bx = (this.width - bossBarW) / 2;
      const by = 90;
      const bPct = Math.max(0, boss.hp / boss.maxHp);
      const bTotal = 20;
      const bFilled = Math.min(bTotal, Math.max(0, Math.round(bPct * bTotal)));
      const bEmpty = bTotal - bFilled;
      const bBlockStr = '■'.repeat(bFilled) + '□'.repeat(bEmpty);

      ctx.fillStyle = 'rgba(5, 12, 10, 0.92)';
      ctx.fillRect(bx - 12, by - 4, bossBarW + 24, 38);
      ctx.strokeStyle = '#FF0033';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bx - 12, by - 4, bossBarW + 24, 38);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#FF0033';
      ctx.font = 'bold 11px "Courier New", monospace';
      ctx.fillText(`[ ALVO PRIORITÁRIO: ${boss.name.toUpperCase()} ]`, this.width / 2, by + 12);

      ctx.fillStyle = '#00FFFF';
      ctx.font = 'bold 11px "Courier New", monospace';
      ctx.fillText(`[${bBlockStr}] ${Math.round(bPct * 100)}%`, this.width / 2, by + 27);
    }

    ctx.restore();
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    ctx.save();
    this.particles.applyScreenShake(ctx);

    // Efeito de Foco Tático (Bullet Time)
    if (this.player.focusActive) {
      ctx.fillStyle = 'rgba(0, 176, 255, 0.12)';
      ctx.fillRect(0, 0, this.width, this.height);
    }

    this.background.draw(ctx);
    this.weather.draw(ctx);
    this.enemyMgr.draw(ctx);

    for (let p of this.projectiles) p.draw(ctx);
    if (this.player.hp > 0) this.player.draw(ctx);
    this.particles.draw(ctx);
    this.background.drawForegroundClouds(ctx);

    // Vinheta Vermelha Pulsante de Alerta de Emergência (HP < 30%)
    if (this.player.hp > 0 && (this.player.hp / this.player.maxHp) < 0.3) {
      const pulseAlpha = 0.22 + 0.14 * Math.sin(Date.now() / 140);
      const radGrad = ctx.createRadialGradient(this.width / 2, this.height / 2, 120, this.width / 2, this.height / 2, 460);
      radGrad.addColorStop(0, 'rgba(255, 23, 68, 0)');
      radGrad.addColorStop(1, `rgba(255, 23, 68, ${pulseAlpha})`);
      ctx.fillStyle = radGrad;
      ctx.fillRect(0, 0, this.width, this.height);
    }

    ctx.restore();

    if (this.state === 'PLAYING' || this.state === 'PAUSED') {
      this.drawHUD();
    }
  }

  loop(timestamp) {
    const elapsed = (timestamp - this.lastTime) / 1000;
    const dt = Number.isFinite(elapsed) ? Math.max(0, Math.min(elapsed, 0.033)) : 0;
    this.lastTime = timestamp;

    // Um erro pontual de renderização não deve encerrar o loop e congelar o jogo.
    try {
      this.update(dt);
      this.render();
    } catch (error) {
      console.error('Erro durante o ciclo do jogo:', error);
      this.state = this.state === 'START' ? 'START' : 'PAUSED';
      if (this.state === 'START') this.startScreen.classList.remove('hidden');
    } finally {
      requestAnimationFrame((t) => this.loop(t));
    }
  }
}

// Inicialização ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
  // Limpa qualquer estado visual antigo e garante o menu antes de criar o jogo.
  const startScreen = document.getElementById('startScreen');
  if (startScreen) {
    startScreen.classList.remove('hidden');
    startScreen.style.display = 'flex';
    startScreen.style.position = 'absolute';
    startScreen.style.inset = '0';
    startScreen.style.zIndex = '100';
  }
  ['pauseScreen', 'stageClearScreen', 'victoryScreen', 'gameOverScreen', 'shopScreen', 'leaderboardModal'].forEach(id => {
    const screen = document.getElementById(id);
    if (screen) screen.classList.add('hidden');
  });
  new GameEngine();
});
