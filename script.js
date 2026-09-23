/**
 * TOP GUN ARCADE - SISTEMA COMPLETO DE COMBATE AÉREO EXPANDIDO
 * Canvas 2D + Web Audio API Sintetizada (Música Synthwave & SFX em Tempo Real)
 * Múltiplos Biomas com Escolha de Rota Pós-Chefe, Bullet Time, Overdrive e Rádio Militar
 */

// --- 1. CONFIGURAÇÕES E DEFINIÇÕES DOS CAÇAS ---
const PLANE_DATA = {
  f14: {
    id: 'f14',
    name: 'F-14 Tomcat',
    role: 'Equilibrado',
    speed: 5.6,
    baseHp: 100,
    fireCooldown: 0.14,
    baseDamage: 22,
    specialName: 'Salvo Phoenix',
    specialCooldown: 12.0,
    color: '#4a5d6e',
    statSpeed: 65,
    statArmor: 60,
    statDamage: 65,
    desc: 'Caça equilibrado com asas móveis dinâmicas. Especial [Q]: Dispara salvo de 6 mísseis Phoenix guiados.'
  },
  f22: {
    id: 'f22',
    name: 'F-22 Raptor',
    role: 'Furtivo / Veloz',
    speed: 7.0,
    baseHp: 75,
    fireCooldown: 0.10,
    baseDamage: 28,
    specialName: 'Modo Furtivo',
    specialCooldown: 15.0,
    color: '#37474f',
    statSpeed: 95,
    statArmor: 45,
    statDamage: 85,
    desc: 'Alta velocidade e dano de plasma. Especial [Q]: Camuflagem (4s invulnerável + dobro de cadência).'
  },
  su57: {
    id: 'su57',
    name: 'Su-57 Felon',
    role: 'Blindado / Área',
    speed: 4.8,
    baseHp: 140,
    fireCooldown: 0.18,
    baseDamage: 26,
    specialName: 'Pulso EMP',
    specialCooldown: 14.0,
    color: '#2e3b4e',
    statSpeed: 50,
    statArmor: 85,
    statDamage: 80,
    desc: 'Blindagem muito alta e disparos em leque. Especial [Q]: Pulso EMP (apaga tiros e causa dano em área).'
  },
  a10: {
    id: 'a10',
    name: 'A-10 Warthog',
    role: 'Super-Pesado GAU-8',
    speed: 4.4,
    baseHp: 170,
    fireCooldown: 0.08,
    baseDamage: 22,
    specialName: 'Bombardeio Napalm',
    specialCooldown: 16.0,
    color: '#3e4a3d',
    statSpeed: 40,
    statArmor: 100,
    statDamage: 95,
    desc: 'Canhão rotativo GAU-8 contínuo devastador. Especial [Q]: Esteira de chamas Napalm no centro.'
  }
};

const DIFFICULTY_MODS = {
  easy: {
    name: 'Recruta',
    hpMult: 0.7,
    bulletSpeedMult: 0.8,
    shootFreqMult: 0.75,
    dropRateBonus: 0.5,
    scoreMult: 1.0,
    homingEnemyMissiles: false,
    playerDamageMult: 0.75
  },
  medium: {
    name: 'Piloto',
    hpMult: 1.0,
    bulletSpeedMult: 1.0,
    shootFreqMult: 1.0,
    dropRateBonus: 0.0,
    scoreMult: 1.5,
    homingEnemyMissiles: false,
    playerDamageMult: 1.0
  },
  hard: {
    name: 'Ás',
    hpMult: 1.25,
    bulletSpeedMult: 1.4,
    shootFreqMult: 1.4,
    dropRateBonus: -0.1,
    scoreMult: 2.0,
    homingEnemyMissiles: true,
    playerDamageMult: 1.3
  },
  nightmare: {
    name: 'Top Gun',
    hpMult: 1.5,
    bulletSpeedMult: 1.5,
    shootFreqMult: 1.7,
    dropRateBonus: -0.2,
    scoreMult: 3.0,
    homingEnemyMissiles: true,
    playerDamageMult: 1.6
  }
};

const UPGRADE_DATA = {
  armor: { baseCost: 100, mult: 1.6, maxLevel: 5 },
  damage: { baseCost: 120, mult: 1.6, maxLevel: 5 },
  specialCooldown: { baseCost: 150, mult: 1.7, maxLevel: 5 },
  magnet: { baseCost: 80, mult: 1.5, maxLevel: 5 }
};

// --- DEFINIÇÕES DOS BIOMAS E CHEFES ---
const BIOMES = {
  clouds: {
    id: 'clouds',
    name: 'Céu Oceânico',
    icon: '☁️',
    bossName: 'Titan-01',
    bossTitle: 'Super-Fortaleza Aérea',
    hazard: 'Tempestades de Raios e Ventos',
    desc: 'Oceano azul com ilhas tropicais e densas camadas de nuvens. Perigos climáticos com raios.',
    palette: { ocean1: '#091c33', ocean2: '#051021', islandCoast: 'rgba(0, 180, 216, 0.25)', islandGrass: '#225a40' }
  },
  naval: {
    id: 'naval',
    name: 'Frota Naval',
    icon: '🌊',
    bossName: 'Leviathan',
    bossTitle: 'Porta-Aviões Couraçado',
    hazard: 'Mísseis Submersos e Fogo de Navios',
    desc: 'Águas profundas patrulhadas por destróieres armados e torpedos verticais teleguiados.',
    palette: { ocean1: '#071526', ocean2: '#020b14', islandCoast: 'rgba(38, 166, 154, 0.2)', islandGrass: '#1b4d3e' }
  },
  canyon: {
    id: 'canyon',
    name: 'Canyon do Deserto',
    icon: '🏜️',
    bossName: 'Sandstorm-IX',
    bossTitle: 'Fortaleza Flutuante dos Desfiladeiros',
    hazard: 'Tempestades de Areia e Vento Lateral',
    desc: 'Desfiladeiros de pedra arenítica e rajadas violentas de vento que empurram os caças.',
    palette: { ocean1: '#4a2c11', ocean2: '#2d1808', islandCoast: 'rgba(230, 126, 34, 0.25)', islandGrass: '#8d5b28' }
  },
  megacity: {
    id: 'megacity',
    name: 'Megacidade Neon',
    icon: '🌃',
    bossName: 'Cyber-Valkyrie',
    bossTitle: 'Dreadnought Furtivo de Choque',
    hazard: 'Drones de Alta Velocidade e Refletores',
    desc: 'Metrópole noturna com arranha-céus iluminados em néon, tráfego aéreo e visibilidade desafiadora.',
    palette: { ocean1: '#0d0221', ocean2: '#05010d', islandCoast: 'rgba(213, 0, 249, 0.25)', islandGrass: '#1a0033' }
  },
  arctic: {
    id: 'arctic',
    name: 'Base Ártica',
    icon: '❄️',
    bossName: 'Blizzard-Goliath',
    bossTitle: 'Canhoneira Blindada Quebra-Gelo',
    hazard: 'Nevasca e Obstáculos de Gelo',
    desc: 'Geleiras escarpadas, fortes tempestades de neve e estilhaços pontiagudos de gelo caindo.',
    palette: { ocean1: '#102a43', ocean2: '#0b1d30', islandCoast: 'rgba(128, 222, 234, 0.3)', islandGrass: '#486581' }
  }
};

// --- 2. GERENCIADOR DE DADOS E PERSISTÊNCIA (StorageManager) ---
class StorageManager {
  static load() {
    return {
      gold: parseInt(localStorage.getItem('topgun_gold') || '0', 10),
      highScore: parseInt(localStorage.getItem('topgun_highscore') || '0', 10),
      plane: localStorage.getItem('topgun_plane') || 'f14',
      difficulty: localStorage.getItem('topgun_difficulty') || 'medium',
      upgrades: JSON.parse(localStorage.getItem('topgun_upgrades') || '{"armor":0,"damage":0,"specialCooldown":0,"magnet":0}')
    };
  }

  static save(data) {
    localStorage.setItem('topgun_gold', data.gold.toString());
    localStorage.setItem('topgun_highscore', data.highScore.toString());
    localStorage.setItem('topgun_plane', data.plane);
    localStorage.setItem('topgun_difficulty', data.difficulty);
    localStorage.setItem('topgun_upgrades', JSON.stringify(data.upgrades));
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
    this.bpm = 124;
    this.step = 0;
    this.nextNoteTime = 0;
    this.timerId = null;

    // Progressão harmônica synthwave (Dó menor / Ré menor estilo anos 80)
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
        this.sfxGain.gain.setValueAtTime(this.sfxEnabled ? 0.4 : 0, this.ctx.currentTime);
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
      this.sfxGain.gain.setValueAtTime(this.sfxEnabled ? 0.4 : 0, this.ctx.currentTime);
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

    // 1. Kick (0, 4, 8, 12)
    if (step % 4 === 0) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(130, time);
      osc.frequency.exponentialRampToValueAtTime(32, time + 0.08);

      gain.gain.setValueAtTime(0.35, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(time);
      osc.stop(time + 0.12);
    }

    // 2. Snare (4, 12)
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
      snareGain.gain.setValueAtTime(0.2, time);
      snareGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

      whiteNoise.connect(filter);
      filter.connect(snareGain);
      snareGain.connect(this.musicGain);

      whiteNoise.start(time);
    }

    // 3. Hi-Hat metálico
    if (step % 2 === 0) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(step % 4 === 2 ? 8000 : 6000, time);

      gain.gain.setValueAtTime(0.04, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(time);
      osc.stop(time + 0.03);
    }

    // 4. Bassline
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

    bassGain.gain.setValueAtTime(0.22, time);
    bassGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

    bassOsc.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(this.musicGain);

    bassOsc.start(time);
    bassOsc.stop(time + 0.1);

    // 5. Arpeggio Retro Lead
    if (step % 2 === 1) {
      const leadFreq = this.leadNotes[step];
      const leadOsc = this.ctx.createOscillator();
      const leadGain = this.ctx.createGain();

      leadOsc.type = 'triangle';
      leadOsc.frequency.setValueAtTime(leadFreq, time);

      leadGain.gain.setValueAtTime(0.06, time);
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

  playThunder() {
    if (!this.ctx || this.muted || !this.sfxEnabled) return;
    const now = this.ctx.currentTime;
    const duration = 1.0;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(50, now + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(now);
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

  playFlare() {
    if (!this.ctx || this.muted || !this.sfxEnabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.2);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.2);
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

// --- 4. ALVOS DE SUPERFÍCIE (BATERIAS ANTIAÉREAS E NAVIOS) ---
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

// --- 5. CENÁRIO PARALAXE COM SUPORTE A 5 BIOMAS ---
class ParallaxBackground {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.biome = 'clouds';

    this.oceanOffset = 0;
    this.oceanSpeed = 1.0;
    this.islands = [];
    this.surfaceTargets = [];
    this.generateIslands();

    this.cloudShadows = [];
    this.shadowSpeed = 1.6;

    this.clouds = [];
    this.cloudSpeed = 2.4;
    this.initClouds();

    this.targetSpawnTimer = 3.0;

    // Megacidade e Ártico
    this.cityBuildings = [];
    this.initCityBuildings();
  }

  setBiome(biomeId) {
    this.biome = biomeId;
    this.islands = [];
    this.surfaceTargets = [];
    this.generateIslands();
  }

  initCityBuildings() {
    this.cityBuildings = [];
    for (let i = 0; i < 18; i++) {
      this.cityBuildings.push({
        x: Math.random() * (this.width - 60),
        y: (this.height / 12) * i + Math.random() * 40,
        w: Math.random() * 45 + 35,
        h: Math.random() * 90 + 60,
        color: Math.random() > 0.5 ? '#1a0033' : '#0d1b2a',
        neon: Math.random() > 0.5 ? '#00e5ff' : '#d500f9'
      });
    }
  }

  generateIslands() {
    for (let i = 0; i < 4; i++) {
      const radius = Math.random() * 40 + 35;
      const island = {
        x: Math.random() * (this.width - 140) + 70,
        y: (this.height / 4) * i + Math.random() * 60,
        radius: radius,
        points: this.createBlobPoints(radius)
      };
      this.islands.push(island);

      if (Math.random() > 0.4) {
        this.surfaceTargets.push(new SurfaceTarget('turret', island.x, island.y));
      }
    }
  }

  createBlobPoints(baseRadius) {
    const pts = [];
    const count = 10;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const dist = baseRadius * (0.75 + Math.random() * 0.5);
      pts.push({ angle, dist });
    }
    return pts;
  }

  initClouds() {
    for (let i = 0; i < 6; i++) {
      const cloud = {
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        scale: Math.random() * 0.8 + 0.7,
        alpha: Math.random() * 0.3 + 0.25
      };
      this.clouds.push(cloud);
      this.cloudShadows.push({ ...cloud, alpha: 0.16 });
    }
  }

  update(dt, enemyBullets, playerX, playerY, bulletSpeedMult) {
    const factor = dt * 60;
    this.oceanOffset = (this.oceanOffset + this.oceanSpeed * factor) % 60;

    // Move Ilhas / Elementos de Fundo
    for (let island of this.islands) {
      island.y += this.oceanSpeed * factor;
      if (island.y > this.height + 120) {
        island.y = -100;
        island.x = Math.random() * (this.width - 140) + 70;
        island.points = this.createBlobPoints(island.radius);
        if (Math.random() > 0.5) {
          this.surfaceTargets.push(new SurfaceTarget('turret', island.x, island.y));
        }
      }
    }

    // Move Prédios na Megacidade
    if (this.biome === 'megacity') {
      for (let b of this.cityBuildings) {
        b.y += this.oceanSpeed * 1.4 * factor;
        if (b.y > this.height + 120) {
          b.y = -120;
          b.x = Math.random() * (this.width - 60);
        }
      }
    }

    // Spawn periódico de Navios no Mar (Naval ou Clouds)
    if (this.biome === 'naval' || this.biome === 'clouds') {
      this.targetSpawnTimer -= dt;
      if (this.targetSpawnTimer <= 0) {
        this.targetSpawnTimer = Math.random() * 5.0 + 4.0;
        const shipX = Math.random() * (this.width - 120) + 60;
        this.surfaceTargets.push(new SurfaceTarget('warship', shipX, -60));
      }
    }

    // Atualiza Alvos de Superfície
    for (let i = this.surfaceTargets.length - 1; i >= 0; i--) {
      const st = this.surfaceTargets[i];
      const keep = st.update(dt, enemyBullets, playerX, playerY, this.oceanSpeed, bulletSpeedMult);
      if (!keep) this.surfaceTargets.splice(i, 1);
    }

    // Move Nuvens
    for (let i = 0; i < this.clouds.length; i++) {
      this.clouds[i].y += this.cloudSpeed * factor;
      if (this.clouds[i].y > this.height + 150) {
        this.clouds[i].y = -150;
        this.clouds[i].x = Math.random() * this.width;
      }

      this.cloudShadows[i].y += this.shadowSpeed * factor;
      if (this.cloudShadows[i].y > this.height + 150) {
        this.cloudShadows[i].y = -150;
        this.cloudShadows[i].x = Math.random() * this.width;
      }
    }
  }

  draw(ctx) {
    const biomeConfig = BIOMES[this.biome] || BIOMES.clouds;
    const p = biomeConfig.palette;

    // Fundo Gradiente Dinâmico por Bioma
    const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    bgGrad.addColorStop(0, p.ocean1);
    bgGrad.addColorStop(1, p.ocean2);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Efeito Especial do Bioma Megacidade: Arranha-Céus com Janelas Iluminadas
    if (this.biome === 'megacity') {
      for (let b of this.cityBuildings) {
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.strokeStyle = b.neon;
        ctx.lineWidth = 1;
        ctx.strokeRect(b.x, b.y, b.w, b.h);

        // Janelas acesas
        ctx.fillStyle = 'rgba(255, 235, 59, 0.4)';
        for (let jx = b.x + 6; jx < b.x + b.w - 6; jx += 8) {
          for (let jy = b.y + 8; jy < b.y + b.h - 8; jy += 12) {
            if ((jx + jy) % 3 === 0) ctx.fillRect(jx, jy, 4, 6);
          }
        }
      }
    }

    // Ondulações / Linhas de relevo
    ctx.strokeStyle = this.biome === 'canyon' ? 'rgba(230, 126, 34, 0.08)' : (this.biome === 'arctic' ? 'rgba(200, 240, 255, 0.08)' : 'rgba(0, 229, 255, 0.04)');
    ctx.lineWidth = 2;
    for (let y = this.oceanOffset; y < this.height; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x < this.width; x += 40) {
        ctx.quadraticCurveTo(x + 20, y + 6, x + 40, y);
      }
      ctx.stroke();
    }

    // Ilhas ou Platôs de Pedra
    for (let island of this.islands) {
      ctx.save();
      ctx.translate(island.x, island.y);

      // Orla
      ctx.beginPath();
      for (let i = 0; i < island.points.length; i++) {
        const pt = island.points[i];
        const px = Math.cos(pt.angle) * (pt.dist + 16);
        const py = Math.sin(pt.angle) * (pt.dist + 16);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = p.islandCoast;
      ctx.fill();

      // Centro rochoso/vegetação
      ctx.beginPath();
      for (let i = 0; i < island.points.length; i++) {
        const pt = island.points[i];
        const px = Math.cos(pt.angle) * (pt.dist - 2);
        const py = Math.sin(pt.angle) * (pt.dist - 2);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = p.islandGrass;
      ctx.fill();
      ctx.restore();
    }

    // Desenha Alvos de Superfície
    for (let st of this.surfaceTargets) st.draw(ctx);

    // Sombras das nuvens
    for (let shadow of this.cloudShadows) {
      ctx.save();
      ctx.translate(shadow.x + 35, shadow.y + 40);
      ctx.scale(shadow.scale, shadow.scale * 0.75);
      ctx.fillStyle = `rgba(0, 5, 15, ${shadow.alpha})`;
      this.drawCloudPuff(ctx);
      ctx.restore();
    }
  }

  drawForegroundClouds(ctx) {
    for (let cloud of this.clouds) {
      ctx.save();
      ctx.translate(cloud.x, cloud.y);
      ctx.scale(cloud.scale, cloud.scale);
      ctx.fillStyle = this.biome === 'arctic' ? `rgba(235, 245, 255, ${cloud.alpha * 1.3})` : `rgba(225, 240, 255, ${cloud.alpha})`;
      this.drawCloudPuff(ctx);
      ctx.restore();
    }
  }

  drawCloudPuff(ctx) {
    ctx.beginPath();
    ctx.arc(0, 0, 45, 0, Math.PI * 2);
    ctx.arc(35, -15, 35, 0, Math.PI * 2);
    ctx.arc(65, 5, 38, 0, Math.PI * 2);
    ctx.arc(-30, 10, 32, 0, Math.PI * 2);
    ctx.arc(15, 20, 35, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }
}

// --- 6. HAZARDS CLIMÁTICOS ESPECÍFICOS POR BIOMA ---
class WeatherSystem {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.biome = 'clouds';
    this.timer = 16.0;
    this.activeEvent = null;
    this.eventDuration = 0;

    // Raios
    this.lightningWarning = false;
    this.lightningX = 0;
    this.lightningWidth = 38;
    this.lightningActive = false;
    this.lightningTimer = 0;

    // Vento / Tempestade de areia / Nevasca
    this.windForce = 0;
    this.particles = [];
  }

  setBiome(biomeId) {
    this.biome = biomeId;
    this.activeEvent = null;
    this.particles = [];
  }

  triggerEvent() {
    if (this.biome === 'clouds') {
      this.activeEvent = Math.random() > 0.5 ? 'storm' : 'wind';
    } else if (this.biome === 'canyon') {
      this.activeEvent = 'sandstorm';
    } else if (this.biome === 'arctic') {
      this.activeEvent = 'blizzard';
    } else if (this.biome === 'naval') {
      this.activeEvent = 'subMissiles';
    } else {
      this.activeEvent = 'wind';
    }

    this.eventDuration = 10.0;
    this.windForce = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 1.8 + 1.2);
    this.lightningTimer = 1.0;
  }

  update(dt, player, particles, enemyBullets) {
    if (!this.activeEvent) {
      this.timer -= dt;
      if (this.timer <= 0) {
        this.triggerEvent();
        this.timer = Math.random() * 20.0 + 15.0;
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

    // Tempestade com raios
    if (this.activeEvent === 'storm') {
      this.lightningTimer -= dt;
      if (this.lightningTimer <= 0) {
        if (!this.lightningWarning && !this.lightningActive) {
          this.lightningWarning = true;
          this.lightningX = Math.max(50, Math.min(this.width - 50, player.x + (Math.random() - 0.5) * 60));
          this.lightningTimer = 1.3;
          sound.playWarning();
        } else if (this.lightningWarning) {
          this.lightningWarning = false;
          this.lightningActive = true;
          this.lightningTimer = 0.35;
          sound.playThunder();
          particles.shake(14, 0.35);

          if (Math.abs(player.x - this.lightningX) < this.lightningWidth / 2 + 15) {
            player.takeDamage(35, particles);
          }
        } else if (this.lightningActive) {
          this.lightningActive = false;
          this.lightningTimer = Math.random() * 2.5 + 2.0;
        }
      }
    }

    // Vento / Tempestade de areia / Nevasca lateral
    if (['wind', 'sandstorm', 'blizzard'].includes(this.activeEvent)) {
      player.x += this.windForce * dt * 60;
      if (Math.random() > 0.25) {
        this.particles.push({
          x: this.windForce > 0 ? -20 : this.width + 20,
          y: Math.random() * this.height,
          vx: this.windForce * 6.5,
          vy: Math.random() * 2 + 1,
          len: Math.random() * 25 + 15,
          color: this.activeEvent === 'sandstorm' ? '#d4a373' : (this.activeEvent === 'blizzard' ? '#e0f7fa' : '#b2ebf2')
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
    if (!this.activeEvent) return;

    if (this.activeEvent === 'storm') {
      if (this.lightningWarning) {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 23, 68, 0.25)';
        ctx.fillRect(this.lightningX - this.lightningWidth / 2, 0, this.lightningWidth, this.height);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(this.lightningX - this.lightningWidth / 2, 0, this.lightningWidth, this.height);
        ctx.fillStyle = '#ff1744';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ PERIGO!', this.lightningX, 85);
        ctx.restore();
      }

      if (this.lightningActive) {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(0, 0, this.width, this.height);
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.moveTo(this.lightningX, 0);
        let curX = this.lightningX;
        for (let y = 60; y <= this.height; y += 50) {
          curX += (Math.random() - 0.5) * 30;
          ctx.lineTo(curX, y);
        }
        ctx.stroke();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.restore();
      }
    }

    if (['wind', 'sandstorm', 'blizzard'].includes(this.activeEvent)) {
      ctx.save();
      ctx.lineWidth = 1.8;
      for (let p of this.particles) {
        ctx.strokeStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + (this.windForce > 0 ? p.len : -p.len), p.y + 2);
        ctx.stroke();
      }
      ctx.restore();
    }
  }
}

// --- 7. SISTEMA DE PARTÍCULAS E SCREEN SHAKE ---
class ParticleSystem {
  constructor() {
    this.particles = [];
    this.shakeTime = 0;
    this.shakeIntensity = 0;
  }

  shake(amount = 8, duration = 0.25) {
    this.shakeIntensity = Math.max(this.shakeIntensity, amount);
    this.shakeTime = Math.max(this.shakeTime, duration);
  }

  addAfterburner(x, y, vx, vy, color = null) {
    this.particles.push({
      x: x + (Math.random() - 0.5) * 4,
      y: y,
      vx: vx + (Math.random() - 0.5) * 0.8,
      vy: vy + Math.random() * 2 + 3,
      radius: Math.random() * 3 + 2,
      life: 0.18,
      maxLife: 0.18,
      color: color || (Math.random() > 0.4 ? '#00e5ff' : '#ff9100'),
      type: 'flame'
    });
  }

  addSmoke(x, y) {
    this.particles.push({
      x: x + (Math.random() - 0.5) * 6,
      y: y,
      vx: (Math.random() - 0.5) * 1.2,
      vy: Math.random() * 1.5 + 1.2,
      radius: Math.random() * 4 + 4,
      life: 0.45,
      maxLife: 0.45,
      color: 'rgba(200, 215, 225, 0.4)',
      type: 'smoke'
    });
  }

  addExplosion(x, y, count = 25, isLarge = false) {
    this.shake(isLarge ? 14 : 7, isLarge ? 0.4 : 0.2);
    sound.playExplosion(isLarge);

    this.particles.push({
      x, y,
      radius: 10,
      maxRadius: isLarge ? 80 : 45,
      life: 0.3,
      maxLife: 0.3,
      type: 'shockwave',
      color: isLarge ? '#ff3d00' : '#00e5ff'
    });

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 5 + 2) * (isLarge ? 1.6 : 1);
      const isDebris = Math.random() > 0.5;

      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: isDebris ? Math.random() * 2 + 1.5 : Math.random() * 4 + 3,
        life: Math.random() * 0.4 + 0.3,
        maxLife: 0.7,
        color: isDebris ? '#b0bec5' : (Math.random() > 0.5 ? '#ffab00' : '#ff3d00'),
        type: isDebris ? 'debris' : 'fire'
      });
    }
  }

  addNapalmFlame(x, y) {
    for (let i = 0; i < 4; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 40,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -Math.random() * 2.5 - 1.0,
        radius: Math.random() * 12 + 8,
        life: 0.6,
        maxLife: 0.6,
        color: Math.random() > 0.4 ? '#ff3d00' : '#ffab00',
        type: 'napalm'
      });
    }
  }

  addFlares(x, y) {
    sound.playFlare();
    for (let i = 0; i < 20; i++) {
      const angle = Math.PI * 0.5 + (Math.random() - 0.5) * 1.8;
      const speed = Math.random() * 5 + 3;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 3 + 2.5,
        life: 0.8,
        maxLife: 0.8,
        color: '#fff9c4',
        type: 'flare'
      });
    }
  }

  addEmpWave(x, y) {
    this.particles.push({
      x, y,
      radius: 15,
      maxRadius: 400,
      life: 0.55,
      maxLife: 0.55,
      type: 'empWave',
      color: '#d500f9'
    });
  }

  update(dt) {
    if (this.shakeTime > 0) {
      this.shakeTime -= dt;
      if (this.shakeTime <= 0) this.shakeIntensity = 0;
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      if (p.type === 'shockwave' || p.type === 'empWave') {
        const progress = 1 - (p.life / p.maxLife);
        p.currentRadius = p.radius + (p.maxRadius - p.radius) * progress;
        continue;
      }

      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;

      if (p.type === 'smoke' || p.type === 'napalm') {
        p.radius += dt * 10;
      } else if (p.type === 'flare') {
        p.vy += 0.15;
        p.vx *= 0.98;
      }
    }
  }

  applyScreenShake(ctx) {
    if (this.shakeTime > 0 && this.shakeIntensity > 0) {
      const dx = (Math.random() - 0.5) * this.shakeIntensity * 2;
      const dy = (Math.random() - 0.5) * this.shakeIntensity * 2;
      ctx.translate(dx, dy);
    }
  }

  draw(ctx) {
    for (let p of this.particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.save();
      if (p.type === 'shockwave' || p.type === 'empWave') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.currentRadius, 0, Math.PI * 2);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = (p.type === 'empWave' ? 6 : 3) * alpha;
        ctx.globalAlpha = alpha;
        ctx.stroke();
      } else if (p.type === 'debris') {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.fillRect(p.x - p.radius, p.y - p.radius, p.radius * 2, p.radius * 2);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.fill();
      }
      ctx.restore();
    }
  }
}

// --- 8. MOEDAS COM ATRAÇÃO MAGNÉTICA ---
class Coin {
  constructor(x, y, value = 1) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 3.5;
    this.vy = -Math.random() * 4.0 - 1.5;
    this.value = value;
    this.radius = 8;
    this.timer = Math.random() * 5;
  }

  update(dt, playerX, playerY, magnetRadius) {
    this.timer += dt * 8;
    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist < magnetRadius) {
      const force = (1 - dist / magnetRadius) * 14.0 + 4.0;
      this.vx += (dx / dist) * force * dt * 60;
      this.vy += (dy / dist) * force * dt * 60;
    } else {
      this.vy += 0.12 * dt * 60;
      this.vx *= 0.96;
    }

    this.x += this.vx * dt * 60;
    this.y += this.vy * dt * 60;
    return this.y <= 980;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    const scaleX = Math.cos(this.timer);
    ctx.scale(scaleX, 1);

    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffb300';
    ctx.shadowColor = '#ffd54f';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.strokeStyle = '#fff8e1';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ff6f00';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★', 0, 1);
    ctx.restore();
  }
}

// --- 9. PROJÉTEIS, MÍSSEIS E BALAS INIMIGAS ---
class Projectile {
  constructor(options) {
    this.x = options.x;
    this.y = options.y;
    this.vx = options.vx || 0;
    this.vy = options.vy || -14;
    this.radius = options.radius || 3.5;
    this.damage = options.damage || 20;
    this.isMissile = options.isMissile ?? false;
    this.isPlasma = options.isPlasma ?? false;
    this.isOverdrive = options.isOverdrive ?? false;
    this.target = options.target || null;
    this.color = options.color || '#00e5ff';
    this.life = options.life || 4.0;
    this.maxSpeed = 11;
    this.turnRate = 0.095;
  }

  update(dt, enemies) {
    this.life -= dt;
    if (this.life <= 0) return false;

    if (this.isMissile) {
      if (!this.target || this.target.hp <= 0) {
        this.target = this.findNearestEnemy(enemies);
      }
      if (this.target) {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const targetAngle = Math.atan2(dy, dx);
        const currentAngle = Math.atan2(this.vy, this.vx);

        let diff = targetAngle - currentAngle;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;

        const newAngle = currentAngle + Math.sign(diff) * Math.min(Math.abs(diff), this.turnRate);
        this.vx = Math.cos(newAngle) * this.maxSpeed;
        this.vy = Math.sin(newAngle) * this.maxSpeed;
      }
    }

    this.x += this.vx * dt * 60;
    this.y += this.vy * dt * 60;
    return this.x >= -30 && this.x <= 570 && this.y >= -40 && this.y <= 990;
  }

  findNearestEnemy(enemies) {
    let nearest = null;
    let minDist = 999999;
    for (let enemy of enemies) {
      if (enemy.hp > 0 && enemy.y > 0) {
        const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
        if (dist < minDist) {
          minDist = dist;
          nearest = enemy;
        }
      }
    }
    return nearest;
  }

  draw(ctx) {
    ctx.save();
    if (this.isOverdrive) {
      // Feixe de Laser Hiperpotente Overdrive
      ctx.fillStyle = '#ff3d00';
      ctx.shadowColor = '#ff9100';
      ctx.shadowBlur = 16;
      ctx.fillRect(this.x - 5, this.y - 18, 10, 36);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(this.x - 2, this.y - 18, 4, 36);
    } else if (this.isMissile) {
      const angle = Math.atan2(this.vy, this.vx) + Math.PI / 2;
      ctx.translate(this.x, this.y);
      ctx.rotate(angle);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-2.5, -8, 5, 16);
      ctx.fillStyle = '#ff1744';
      ctx.beginPath();
      ctx.moveTo(-2.5, -8); ctx.lineTo(0, -14); ctx.lineTo(2.5, -8);
      ctx.fill();
      ctx.fillStyle = '#78909c';
      ctx.fillRect(-4.5, 4, 9, 3);
    } else if (this.isPlasma) {
      ctx.beginPath();
      ctx.ellipse(this.x, this.y, 3, 9, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#00e5ff';
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 12;
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 8;
      ctx.fill();
    }
    ctx.restore();
  }
}

class EnemyBullet {
  constructor(x, y, vx, vy, isMine = false, isHoming = false) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.isMine = isMine;
    this.isHoming = isHoming;
    this.radius = isMine ? 9 : (isHoming ? 6 : 4.5);
    this.color = isMine ? '#ff9100' : (isHoming ? '#d500f9' : '#ff1744');
    this.pulse = 0;
  }

  update(dt, playerX, playerY) {
    this.pulse += dt * 5;
    if (this.isHoming && playerX !== undefined) {
      const dx = playerX - this.x;
      const dy = playerY - this.y;
      const targetAngle = Math.atan2(dy, dx);
      const currentAngle = Math.atan2(this.vy, this.vx);

      let diff = targetAngle - currentAngle;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;

      const newAngle = currentAngle + Math.sign(diff) * Math.min(Math.abs(diff), 0.035);
      const speed = Math.hypot(this.vx, this.vy);
      this.vx = Math.cos(newAngle) * speed;
      this.vy = Math.sin(newAngle) * speed;
    }

    this.x += this.vx * dt * 60;
    this.y += this.vy * dt * 60;
    return this.x >= -30 && this.x <= 570 && this.y >= -30 && this.y <= 990;
  }

  draw(ctx) {
    ctx.save();
    if (this.isMine) {
      ctx.translate(this.x, this.y);
      ctx.rotate(this.pulse);
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#37474f';
      ctx.fill();
      ctx.strokeStyle = '#ff9100';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      for (let i = 0; i < 4; i++) {
        ctx.rotate(Math.PI / 2);
        ctx.fillStyle = '#ff1744';
        ctx.fillRect(-2, -this.radius - 4, 4, 4);
      }
    } else if (this.isHoming) {
      ctx.translate(this.x, this.y);
      ctx.rotate(Math.atan2(this.vy, this.vx) + Math.PI / 2);
      ctx.fillStyle = '#d500f9';
      ctx.fillRect(-2, -6, 4, 12);
      ctx.fillStyle = '#fff';
      ctx.fillRect(-1.5, -7, 3, 3);
    } else {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 6;
      ctx.fill();
    }
    ctx.restore();
  }
}

// --- 10. POWER-UPS ---
class PowerUp {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type; // 'W', 'M', 'S', 'B'
    this.radius = 16;
    this.vy = 1.3;
    this.timer = 0;

    switch (type) {
      case 'W': this.color = '#00e5ff'; this.label = 'W'; break;
      case 'M': this.color = '#ffb300'; this.label = 'M'; break;
      case 'S': this.color = '#00e676'; this.label = 'S'; break;
      case 'B': this.color = '#d500f9'; this.label = 'B'; break;
    }
  }

  update(dt) {
    this.timer += dt * 4;
    this.y += this.vy * dt * 60;
    this.x += Math.sin(this.timer) * 0.8;
    return this.y <= 980;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    const glow = Math.sin(this.timer * 2) * 4 + 8;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(10, 25, 47, 0.9)';
    ctx.fill();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = glow;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.label, 0, 1);
    ctx.restore();
  }
}

// --- 11. CLASSE DO JOGADOR COM FOCO TÁTICO E OVERDRIVE ---
class Player {
  constructor(x, y, planeType, upgrades) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.planeType = planeType;
    this.data = PLANE_DATA[planeType];

    const armorBonus = 1 + (upgrades.armor || 0) * 0.1;
    this.maxHp = Math.round(this.data.baseHp * armorBonus);
    this.hp = this.maxHp;

    const damageBonus = 1 + (upgrades.damage || 0) * 0.12;
    this.damageMult = damageBonus;

    this.speed = this.data.speed;
    this.radius = 16;
    this.wingSweep = 0.2;
    this.targetWingSweep = 0.2;
    this.rollAngle = 0;

    this.weaponLevel = 1;
    this.missiles = 8;
    this.maxMissiles = 16;

    this.fireCooldown = 0;
    this.baseFireCooldown = this.data.fireCooldown;
    this.missileCooldown = 0;
    this.flareCooldown = 0;
    this.flareMaxCooldown = 8.0;

    const specialCdMod = 1 - (upgrades.specialCooldown || 0) * 0.1;
    this.specialMaxCooldown = this.data.specialCooldown * specialCdMod;
    this.specialCooldown = 0;

    // Foco Tático (Bullet Time - Tecla E)
    this.focusMax = 100;
    this.focus = 100;
    this.focusActive = false;
    this.focusTimer = 0;

    // Modo Overdrive (15 Abates consecutivos sem dano)
    this.killsWithoutDamage = 0;
    this.overdriveActive = false;
    this.overdriveTimer = 0;

    this.stealthTimer = 0;
    this.napalmActive = 0;
    this.napalmX = 0;

    this.magnetRadius = 70 + (upgrades.magnet || 0) * 38;
    this.wingmanTimer = 0;
    this.invulnerableTimer = 0;
  }

  fireMain(projectiles) {
    if (this.fireCooldown > 0) return;

    const cdMultiplier = (this.stealthTimer > 0 || this.overdriveActive) ? 0.45 : 1.0;
    this.fireCooldown = this.baseFireCooldown * cdMultiplier;

    // Se estiver em Overdrive, dispara feixe contínuo hiperpotente
    if (this.overdriveActive) {
      sound.playOverdrive();
      projectiles.push(new Projectile({ x: this.x - 14, y: this.y - 20, vx: 0, vy: -20, damage: 55 * this.damageMult, isOverdrive: true }));
      projectiles.push(new Projectile({ x: this.x + 14, y: this.y - 20, vx: 0, vy: -20, damage: 55 * this.damageMult, isOverdrive: true }));
      return;
    }

    if (this.planeType === 'f14') {
      sound.playVulcan();
      const dmg = 22 * this.damageMult;
      if (this.weaponLevel === 1) {
        projectiles.push(new Projectile({ x: this.x - 12, y: this.y - 15, vx: 0, vy: -15, damage: dmg }));
        projectiles.push(new Projectile({ x: this.x + 12, y: this.y - 15, vx: 0, vy: -15, damage: dmg }));
      } else if (this.weaponLevel === 2) {
        projectiles.push(new Projectile({ x: this.x, y: this.y - 18, vx: 0, vy: -16, damage: dmg * 1.1 }));
        projectiles.push(new Projectile({ x: this.x - 14, y: this.y - 12, vx: -2.5, vy: -15, damage: dmg }));
        projectiles.push(new Projectile({ x: this.x + 14, y: this.y - 12, vx: 2.5, vy: -15, damage: dmg }));
      } else {
        projectiles.push(new Projectile({ x: this.x - 7, y: this.y - 20, vx: 0, vy: -17, damage: dmg * 1.25, radius: 4.5, color: '#ffea00' }));
        projectiles.push(new Projectile({ x: this.x + 7, y: this.y - 20, vx: 0, vy: -17, damage: dmg * 1.25, radius: 4.5, color: '#ffea00' }));
        projectiles.push(new Projectile({ x: this.x - 20, y: this.y - 10, vx: -3.8, vy: -15.5, damage: dmg, radius: 4, color: '#00e5ff' }));
        projectiles.push(new Projectile({ x: this.x + 20, y: this.y - 10, vx: 3.8, vy: -15.5, damage: dmg, radius: 4, color: '#00e5ff' }));
      }
    } else if (this.planeType === 'f22') {
      sound.playPlasma();
      const dmg = (this.weaponLevel === 1 ? 28 : (this.weaponLevel === 2 ? 38 : 48)) * this.damageMult;
      projectiles.push(new Projectile({ x: this.x - 9, y: this.y - 18, vx: 0, vy: -18, damage: dmg, isPlasma: true }));
      projectiles.push(new Projectile({ x: this.x + 9, y: this.y - 18, vx: 0, vy: -18, damage: dmg, isPlasma: true }));
      if (this.weaponLevel >= 2) {
        projectiles.push(new Projectile({ x: this.x - 18, y: this.y - 12, vx: -1.5, vy: -17, damage: dmg * 0.8, isPlasma: true }));
        projectiles.push(new Projectile({ x: this.x + 18, y: this.y - 12, vx: 1.5, vy: -17, damage: dmg * 0.8, isPlasma: true }));
      }
    } else if (this.planeType === 'su57') {
      sound.playHeavyCannon();
      const dmg = (this.weaponLevel === 1 ? 26 : (this.weaponLevel === 2 ? 36 : 46)) * this.damageMult;
      projectiles.push(new Projectile({ x: this.x, y: this.y - 18, vx: 0, vy: -14, damage: dmg, radius: 5, color: '#ff9100' }));
      projectiles.push(new Projectile({ x: this.x - 15, y: this.y - 10, vx: -3.2, vy: -13.5, damage: dmg, radius: 4.5, color: '#ff9100' }));
      projectiles.push(new Projectile({ x: this.x + 15, y: this.y - 10, vx: 3.2, vy: -13.5, damage: dmg, radius: 4.5, color: '#ff9100' }));
    } else if (this.planeType === 'a10') {
      sound.playGau8();
      const dmg = (this.weaponLevel === 1 ? 24 : (this.weaponLevel === 2 ? 32 : 44)) * this.damageMult;
      projectiles.push(new Projectile({ x: this.x - 3, y: this.y - 20, vx: (Math.random() - 0.5) * 0.8, vy: -19, damage: dmg, radius: 3.8, color: '#ffeb3b' }));
      projectiles.push(new Projectile({ x: this.x + 3, y: this.y - 20, vx: (Math.random() - 0.5) * 0.8, vy: -19, damage: dmg, radius: 3.8, color: '#ffeb3b' }));
      if (this.weaponLevel >= 2) {
        projectiles.push(new Projectile({ x: this.x, y: this.y - 24, vx: 0, vy: -20, damage: dmg * 1.2, radius: 4.5, color: '#ff9800' }));
      }
    }

    if (this.wingmanTimer > 0) {
      projectiles.push(new Projectile({ x: this.x - 42, y: this.y + 4, vx: -0.5, vy: -15, damage: 20 * this.damageMult, color: '#d500f9' }));
      projectiles.push(new Projectile({ x: this.x + 42, y: this.y + 4, vx: 0.5, vy: -15, damage: 20 * this.damageMult, color: '#d500f9' }));
    }
  }

  triggerBulletTime() {
    if (this.focus < 25 || this.focusActive) return;
    this.focusActive = true;
    this.focusTimer = 4.0;
    sound.playBulletTime();
  }

  triggerOverdrive(uiController) {
    this.overdriveActive = true;
    this.overdriveTimer = 6.0;
    sound.playOverdrive();
    uiController.triggerRadio('PILOTO, OVERDRIVE OPERACIONAL! FOGO TOTAL À VONTADE!');
  }

  fireMissile(projectiles, enemies) {
    if (this.missiles <= 0 || this.missileCooldown > 0) return;
    this.missiles--;
    this.missileCooldown = 0.45;
    sound.playMissileLaunch();

    projectiles.push(new Projectile({ x: this.x - 20, y: this.y + 2, vx: -3, vy: -8, isMissile: true, damage: 85 * this.damageMult, color: '#ffffff' }));
    projectiles.push(new Projectile({ x: this.x + 20, y: this.y + 2, vx: 3, vy: -8, isMissile: true, damage: 85 * this.damageMult, color: '#ffffff' }));
  }

  deployFlares(particles, enemyBullets) {
    if (this.flareCooldown > 0) return;
    this.flareCooldown = this.flareMaxCooldown;
    particles.addFlares(this.x, this.y + 20);
    enemyBullets.length = 0;
  }

  useSpecialAbility(projectiles, enemies, enemyBullets, particles) {
    if (this.specialCooldown > 0) return;
    this.specialCooldown = this.specialMaxCooldown;

    if (this.planeType === 'f14') {
      sound.playMissileLaunch();
      const spreadAngles = [-5, -3, -1, 1, 3, 5];
      for (let a of spreadAngles) {
        projectiles.push(new Projectile({
          x: this.x + a * 4,
          y: this.y + 5,
          vx: a * 1.5,
          vy: -9,
          isMissile: true,
          damage: 95 * this.damageMult,
          color: '#ffffff'
        }));
      }
    } else if (this.planeType === 'f22') {
      sound.playStealth();
      this.stealthTimer = 4.0;
    } else if (this.planeType === 'su57') {
      sound.playEMP();
      particles.addEmpWave(this.x, this.y);
      enemyBullets.length = 0;
      for (let e of enemies) {
        if (e.hp > 0) {
          const d = Math.hypot(e.x - this.x, e.y - this.y);
          if (d < 350) {
            e.hp -= 220 * this.damageMult;
            particles.addExplosion(e.x, e.y, 8, false);
          }
        }
      }
    } else if (this.planeType === 'a10') {
      sound.playExplosion(true);
      this.napalmActive = 4.0;
      this.napalmX = this.x;
      particles.shake(12, 0.4);
    }
  }

  takeDamage(amount, particles, damageMult = 1.0, uiController = null) {
    if (this.invulnerableTimer > 0 || this.stealthTimer > 0) return false;
    const actualDamage = amount * damageMult;
    this.hp = Math.max(0, this.hp - actualDamage);
    this.invulnerableTimer = 1.2;
    this.killsWithoutDamage = 0; // Reseta combo de Overdrive ao tomar dano
    particles.addExplosion(this.x, this.y, 14, false);

    if (this.hp <= 30 && this.hp > 0) {
      sound.playWarning();
      if (uiController) uiController.triggerRadio('ALERTA: Integridade crítica! Use flares ou Foco Tático imediatamente!');
    }
    return true;
  }

  update(dt, input, particles, projectiles, enemies, enemyBullets, damageMult, uiController) {
    if (this.fireCooldown > 0) this.fireCooldown -= dt;
    if (this.missileCooldown > 0) this.missileCooldown -= dt;
    if (this.flareCooldown > 0) this.flareCooldown -= dt;
    if (this.specialCooldown > 0) this.specialCooldown -= dt;
    if (this.invulnerableTimer > 0) this.invulnerableTimer -= dt;
    if (this.stealthTimer > 0) this.stealthTimer -= dt;
    if (this.wingmanTimer > 0) this.wingmanTimer -= dt;

    // Foco Tático
    if (this.focusActive) {
      this.focusTimer -= dt;
      this.focus = Math.max(0, this.focus - dt * 25);
      if (this.focusTimer <= 0 || this.focus <= 0) {
        this.focusActive = false;
      }
    }

    // Overdrive
    if (this.overdriveActive) {
      this.overdriveTimer -= dt;
      if (this.overdriveTimer <= 0) {
        this.overdriveActive = false;
      }
    }

    // Faixa Napalm do A-10
    if (this.napalmActive > 0) {
      this.napalmActive -= dt;
      particles.addNapalmFlame(this.napalmX, Math.random() * 800 + 50);
      for (let e of enemies) {
        if (e.hp > 0 && Math.abs(e.x - this.napalmX) < 55) {
          e.hp -= 160 * dt * this.damageMult;
        }
      }
    }

    let moveX = input.moveX;
    let moveY = input.moveY;

    if (input.pointerActive) {
      const dx = input.pointerX - this.x;
      const dy = input.pointerY - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 5) {
        moveX = dx / Math.max(dist, 20);
        moveY = dy / Math.max(dist, 20);
      }
    }

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
    this.x = Math.max(30, Math.min(510, this.x));
    this.y = Math.max(50, Math.min(910, this.y));

    if (this.vy < -1.5) this.targetWingSweep = 0.85;
    else if (this.vy > 1.5) this.targetWingSweep = 0.1;
    else this.targetWingSweep = 0.35;
    this.wingSweep += (this.targetWingSweep - this.wingSweep) * 0.12;

    const targetRoll = (this.vx / this.speed) * 0.35;
    this.rollAngle += (targetRoll - this.rollAngle) * 0.15;

    // Turbinas
    if (this.stealthTimer <= 0) {
      const engineY = this.y + 25;
      const flameColor = this.overdriveActive ? '#ff3d00' : null;
      particles.addAfterburner(this.x - 9 + this.rollAngle * 6, engineY, this.vx * 0.3, this.vy, flameColor);
      particles.addAfterburner(this.x + 9 + this.rollAngle * 6, engineY, this.vx * 0.3, this.vy, flameColor);
    }

    // Ações
    if (input.fire || input.pointerActive) {
      this.fireMain(projectiles);
    }
    if (input.consumeMissile()) {
      this.fireMissile(projectiles, enemies);
    }
    if (input.consumeFlare()) {
      this.deployFlares(particles, enemyBullets);
    }
    if (input.consumeSpecial()) {
      this.useSpecialAbility(projectiles, enemies, enemyBullets, particles);
    }
    if (input.consumeFocus()) {
      this.triggerBulletTime();
    }
  }

  draw(ctx) {
    if (this.invulnerableTimer > 0 && Math.floor(Date.now() / 70) % 2 === 0) return;

    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.stealthTimer > 0) {
      ctx.globalAlpha = 0.45;
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 15;
    }

    if (this.overdriveActive) {
      ctx.shadowColor = '#ff3d00';
      ctx.shadowBlur = 18;
    }

    const rollCompress = Math.cos(this.rollAngle);
    const rollShift = Math.sin(this.rollAngle) * 6;

    if (this.planeType === 'f14') this.drawF14(ctx, rollCompress, rollShift);
    else if (this.planeType === 'f22') this.drawF22(ctx, rollCompress, rollShift);
    else if (this.planeType === 'su57') this.drawSu57(ctx, rollCompress, rollShift);
    else if (this.planeType === 'a10') this.drawA10(ctx, rollCompress, rollShift);

    if (this.wingmanTimer > 0) {
      this.drawWingmanDrone(ctx, -42, 6);
      this.drawWingmanDrone(ctx, 42, 6);
    }
    ctx.restore();
  }

  drawF14(ctx, rollCompress, rollShift) {
    const sweepAngle = 0.25 + this.wingSweep * 0.65;
    const wingSpan = 38 * rollCompress;

    ctx.fillStyle = '#4a5d6e';
    ctx.strokeStyle = '#263238';
    ctx.lineWidth = 1.2;

    ctx.save();
    ctx.translate(-8 + rollShift, 5);
    ctx.rotate(-sweepAngle);
    ctx.beginPath();
    ctx.moveTo(0, -6); ctx.lineTo(-wingSpan, 18); ctx.lineTo(-wingSpan + 6, 26); ctx.lineTo(0, 10);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.translate(8 + rollShift, 5);
    ctx.rotate(sweepAngle);
    ctx.beginPath();
    ctx.moveTo(0, -6); ctx.lineTo(wingSpan, 18); ctx.lineTo(wingSpan - 6, 26); ctx.lineTo(0, 10);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#37474f';
    ctx.beginPath();
    ctx.moveTo(-16 + rollShift, 10); ctx.lineTo(-19 + rollShift, 28); ctx.lineTo(-13 + rollShift, 26);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(16 + rollShift, 10); ctx.lineTo(19 + rollShift, 28); ctx.lineTo(13 + rollShift, 26);
    ctx.closePath(); ctx.fill();

    const bodyGrad = ctx.createLinearGradient(-15, 0, 15, 0);
    bodyGrad.addColorStop(0, '#3b4d61');
    bodyGrad.addColorStop(0.5, '#627d98');
    bodyGrad.addColorStop(1, '#3b4d61');
    ctx.fillStyle = bodyGrad;

    ctx.beginPath();
    ctx.moveTo(0, -32);
    ctx.lineTo(8, -12); ctx.lineTo(14, 8); ctx.lineTo(12, 26); ctx.lineTo(6, 27); ctx.lineTo(4, 20);
    ctx.lineTo(-4, 20); ctx.lineTo(-6, 27); ctx.lineTo(-12, 26); ctx.lineTo(-14, 8); ctx.lineTo(-8, -12);
    ctx.closePath(); ctx.fill(); ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, -10, 4.5, 11, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#00e5ff';
    ctx.fill();
  }

  drawF22(ctx, rollCompress, rollShift) {
    ctx.fillStyle = '#263238';
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 1.2;

    ctx.beginPath();
    ctx.moveTo(0, -34);
    ctx.lineTo(10 + rollShift, -14);
    ctx.lineTo(36 * rollCompress + rollShift, 10);
    ctx.lineTo(26 * rollCompress + rollShift, 26);
    ctx.lineTo(14 + rollShift, 24);
    ctx.lineTo(12 + rollShift, 28);
    ctx.lineTo(-12 + rollShift, 28);
    ctx.lineTo(-14 + rollShift, 24);
    ctx.lineTo(-26 * rollCompress + rollShift, 26);
    ctx.lineTo(-36 * rollCompress + rollShift, 10);
    ctx.lineTo(-10 + rollShift, -14);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, -10, 4.5, 12, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd54f';
    ctx.fill();
  }

  drawSu57(ctx, rollCompress, rollShift) {
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#ff9100';
    ctx.lineWidth = 1.2;

    ctx.beginPath();
    ctx.moveTo(0, -36);
    ctx.lineTo(12 + rollShift, -12);
    ctx.lineTo(38 * rollCompress + rollShift, 12);
    ctx.lineTo(30 * rollCompress + rollShift, 26);
    ctx.lineTo(14 + rollShift, 26);
    ctx.lineTo(14 + rollShift, 30);
    ctx.lineTo(4 + rollShift, 22);
    ctx.lineTo(-4 + rollShift, 22);
    ctx.lineTo(-14 + rollShift, 30);
    ctx.lineTo(-14 + rollShift, 26);
    ctx.lineTo(-30 * rollCompress + rollShift, 26);
    ctx.lineTo(-38 * rollCompress + rollShift, 12);
    ctx.lineTo(-12 + rollShift, -12);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, -8, 5, 13, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#00e676';
    ctx.fill();
  }

  drawA10(ctx, rollCompress, rollShift) {
    ctx.fillStyle = '#37474f';
    ctx.strokeStyle = '#ff1744';
    ctx.lineWidth = 1.2;

    ctx.beginPath();
    ctx.moveTo(0, -32);
    ctx.lineTo(6, -14);
    ctx.lineTo(42 * rollCompress, -10);
    ctx.lineTo(42 * rollCompress, 8);
    ctx.lineTo(8, 8);
    ctx.lineTo(10, 24);
    ctx.lineTo(18, 24);
    ctx.lineTo(18, 32);
    ctx.lineTo(-18, 32);
    ctx.lineTo(-18, 24);
    ctx.lineTo(-10, 24);
    ctx.lineTo(-8, 8);
    ctx.lineTo(-42 * rollCompress, 8);
    ctx.lineTo(-42 * rollCompress, -10);
    ctx.lineTo(-6, -14);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#212121';
    ctx.beginPath();
    ctx.arc(-11, 15, 6, 0, Math.PI * 2);
    ctx.arc(11, 15, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ff1744';
    ctx.fillRect(-2, -34, 4, 6);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, -12, 4, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  drawWingmanDrone(ctx, ox, oy) {
    ctx.save();
    ctx.translate(ox, oy);
    ctx.fillStyle = '#7b1fa2';
    ctx.beginPath();
    ctx.moveTo(0, -12); ctx.lineTo(10, 6); ctx.lineTo(0, 3); ctx.lineTo(-10, 6);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#e1bee7';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 1, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#00e5ff';
    ctx.fill();
    ctx.restore();
  }
}

// --- 12. INIMIGOS CONVENCIONAIS E ESPECIAIS ---
class Enemy {
  constructor(type, x, y, hpMult = 1.0) {
    this.type = type; // 1: Leve, 2: Médio, 3: Bombardeiro, 4: Apache, 5: Kamikaze, 6: Drone Escolta
    this.x = x;
    this.y = y;
    this.alive = true;
    this.timer = 0;

    if (type === 1) {
      this.hp = Math.round(30 * hpMult);
      this.maxHp = this.hp;
      this.radius = 18;
      this.scoreVal = 100;
      this.speedY = 3.2;
      this.zigzag = Math.random() > 0.5;
      this.shootTimer = Math.random() * 0.8 + 0.8;
    } else if (type === 2) {
      this.hp = Math.round(90 * hpMult);
      this.maxHp = this.hp;
      this.radius = 26;
      this.scoreVal = 250;
      this.speedY = 2.4;
      this.state = 'descend';
      this.pauseTimer = 1.4;
      this.shotFired = false;
    } else if (type === 3) {
      this.hp = Math.round(320 * hpMult);
      this.maxHp = this.hp;
      this.radius = 42;
      this.scoreVal = 600;
      this.speedY = 1.0;
      this.salvoTimer = 1.6;
      this.mineTimer = 2.8;
    } else if (type === 4) {
      this.hp = Math.round(180 * hpMult);
      this.maxHp = this.hp;
      this.radius = 28;
      this.scoreVal = 450;
      this.speedY = 1.4;
      this.hoverY = 180 + Math.random() * 120;
      this.state = 'enter';
      this.laserAimTimer = 1.2;
      this.burstShots = 0;
      this.burstTimer = 0;
      this.rotorAngle = 0;
    } else if (type === 5) {
      this.hp = Math.round(45 * hpMult);
      this.maxHp = this.hp;
      this.radius = 16;
      this.scoreVal = 200;
      this.speed = 6.8;
      this.locked = false;
      sound.playWarning();
    } else if (type === 6) { // Drone de Escolta
      this.hp = Math.round(50 * hpMult);
      this.maxHp = this.hp;
      this.radius = 15;
      this.scoreVal = 150;
      this.speedY = 2.8;
      this.shootTimer = 1.2;
    }
  }

  update(dt, enemyBullets, playerX, playerY, mods) {
    this.timer += dt;

    if (this.type === 1) {
      this.y += (this.speedY * mods.bulletSpeedMult * 0.8) * dt * 60;
      if (this.zigzag) this.x += Math.sin(this.timer * 2.5) * 3.0;

      this.shootTimer -= dt * mods.shootFreqMult;
      if (this.shootTimer <= 0) {
        this.shootTimer = 1.5;
        enemyBullets.push(new EnemyBullet(this.x, this.y + 12, 0, 5.5 * mods.bulletSpeedMult));
      }
    } else if (this.type === 2) {
      if (this.state === 'descend') {
        this.y += this.speedY * dt * 60;
        if (this.y >= 260 + (this.x % 140)) this.state = 'pause';
      } else if (this.state === 'pause') {
        this.pauseTimer -= dt;
        if (!this.shotFired && this.pauseTimer <= 0.8) {
          this.shotFired = true;
          const angles = [-0.35, 0, 0.35];
          for (let a of angles) {
            const spd = 5.0 * mods.bulletSpeedMult;
            enemyBullets.push(new EnemyBullet(this.x, this.y + 16, Math.sin(a) * spd, Math.cos(a) * spd, false, mods.homingEnemyMissiles && a === 0));
          }
        }
        if (this.pauseTimer <= 0) this.state = 'ascend';
      } else if (this.state === 'ascend') {
        this.y -= (this.speedY * 1.4) * dt * 60;
      }
    } else if (this.type === 3) {
      this.y += this.speedY * dt * 60;
      this.salvoTimer -= dt * mods.shootFreqMult;
      if (this.salvoTimer <= 0) {
        this.salvoTimer = 2.0;
        const spd = 4.5 * mods.bulletSpeedMult;
        enemyBullets.push(new EnemyBullet(this.x - 24, this.y + 20, -1.2, spd));
        enemyBullets.push(new EnemyBullet(this.x, this.y + 25, 0, spd + 0.3, false, mods.homingEnemyMissiles));
        enemyBullets.push(new EnemyBullet(this.x + 24, this.y + 20, 1.2, spd));
      }

      this.mineTimer -= dt;
      if (this.mineTimer <= 0) {
        this.mineTimer = 3.5;
        enemyBullets.push(new EnemyBullet(this.x, this.y + 35, (Math.random() - 0.5) * 1.5, 1.8, true));
      }
    } else if (this.type === 4) {
      this.rotorAngle += dt * 30;
      if (this.state === 'enter') {
        this.y += this.speedY * dt * 60;
        if (this.y >= this.hoverY) this.state = 'aim';
      } else if (this.state === 'aim') {
        this.x += Math.sin(this.timer * 2.0) * 1.5;
        this.laserAimTimer -= dt;
        if (this.laserAimTimer <= 0) {
          this.state = 'burst';
          this.burstShots = 4;
          this.burstTimer = 0;
        }
      } else if (this.state === 'burst') {
        this.burstTimer -= dt;
        if (this.burstTimer <= 0 && this.burstShots > 0) {
          this.burstShots--;
          this.burstTimer = 0.14;
          sound.playMissileLaunch();
          const dx = playerX - this.x;
          const dy = playerY - this.y;
          const angle = Math.atan2(dy, dx);
          const spd = 6.2 * mods.bulletSpeedMult;
          enemyBullets.push(new EnemyBullet(this.x, this.y + 15, Math.cos(angle) * spd, Math.sin(angle) * spd, false, mods.homingEnemyMissiles));
        }
        if (this.burstShots <= 0) {
          this.state = 'aim';
          this.laserAimTimer = 2.2 / mods.shootFreqMult;
        }
      }
    } else if (this.type === 5) {
      if (!this.locked) {
        this.locked = true;
        const angle = Math.atan2(playerY - this.y, playerX - this.x);
        this.vx = Math.cos(angle) * this.speed * mods.bulletSpeedMult;
        this.vy = Math.sin(angle) * this.speed * mods.bulletSpeedMult;
      }
      this.x += this.vx * dt * 60;
      this.y += this.vy * dt * 60;
    } else if (this.type === 6) {
      this.y += this.speedY * dt * 60;
      this.x += Math.cos(this.timer * 3) * 2;
      this.shootTimer -= dt;
      if (this.shootTimer <= 0) {
        this.shootTimer = 1.8;
        enemyBullets.push(new EnemyBullet(this.x, this.y + 10, 0, 5.0 * mods.bulletSpeedMult));
      }
    }

    return this.y <= 990 && this.y >= -120;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.type === 1) {
      ctx.fillStyle = '#b71c1c';
      ctx.beginPath();
      ctx.moveTo(0, 18); ctx.lineTo(-16, -12); ctx.lineTo(0, -6); ctx.lineTo(16, -12);
      ctx.closePath(); ctx.fill();
    } else if (this.type === 2) {
      ctx.fillStyle = '#2c3e50';
      ctx.beginPath();
      ctx.moveTo(0, 24); ctx.lineTo(12, 4); ctx.lineTo(26, -10); ctx.lineTo(22, -18);
      ctx.lineTo(8, -12); ctx.lineTo(0, -22); ctx.lineTo(-8, -12); ctx.lineTo(-22, -18);
      ctx.lineTo(-26, -10); ctx.lineTo(-12, 4);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#00e5ff'; ctx.stroke();
    } else if (this.type === 3) {
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(0, 36); ctx.lineTo(16, 12); ctx.lineTo(48, -16); ctx.lineTo(44, -28);
      ctx.lineTo(10, -20); ctx.lineTo(0, -38); ctx.lineTo(-10, -20); ctx.lineTo(-44, -28);
      ctx.lineTo(-48, -16); ctx.lineTo(-16, 12);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#e53935'; ctx.stroke();

      const props = [-32, -16, 16, 32];
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      for (let px of props) {
        ctx.beginPath();
        ctx.ellipse(px, -18, 7, 2, this.timer * 15, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (this.type === 4) {
      ctx.fillStyle = '#2e402b';
      ctx.beginPath();
      ctx.moveTo(0, 26); ctx.lineTo(12, 10); ctx.lineTo(24, 0); ctx.lineTo(8, -10);
      ctx.lineTo(4, -30); ctx.lineTo(-4, -30); ctx.lineTo(-8, -10); ctx.lineTo(-24, 0); ctx.lineTo(-12, 10);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#1a2618'; ctx.stroke();

      ctx.save();
      ctx.rotate(this.rotorAngle);
      ctx.fillStyle = 'rgba(200, 200, 200, 0.4)';
      ctx.fillRect(-38, -2, 76, 4);
      ctx.fillRect(-2, -38, 4, 76);
      ctx.restore();

      if (this.state === 'aim') {
        ctx.strokeStyle = 'rgba(255, 23, 68, 0.7)';
        ctx.lineWidth = 1;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(0, 15); ctx.lineTo(0, 700);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    } else if (this.type === 5) {
      const angle = Math.atan2(this.vy, this.vx) - Math.PI / 2;
      ctx.rotate(angle);
      ctx.fillStyle = '#d50000';
      ctx.beginPath();
      ctx.moveTo(0, 20); ctx.lineTo(14, -14); ctx.lineTo(0, -6); ctx.lineTo(-14, -14);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#ffeb3b'; ctx.stroke();
    } else if (this.type === 6) {
      ctx.fillStyle = '#4a148c';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#e040fb'; ctx.stroke();
    }

    if (this.type >= 2 && this.hp < this.maxHp) {
      const w = this.radius * 1.5;
      const pct = Math.max(0, this.hp / this.maxHp);
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(-w / 2, -this.radius - 8, w, 4);
      ctx.fillStyle = '#ff1744';
      ctx.fillRect(-w / 2, -this.radius - 8, w * pct, 4);
    }
    ctx.restore();
  }
}

// --- 13. CHEFES ÚNICOS POR BIOMA COM DESTRUIÇÃO PROGRESSIVA ---
class Boss {
  constructor(width, height, difficultyMods, biomeId = 'clouds') {
    this.canvasWidth = width;
    this.biomeId = biomeId;
    this.biomeInfo = BIOMES[biomeId] || BIOMES.clouds;
    this.x = width / 2;
    this.y = -130;
    this.targetY = 160;
    this.radius = 82;

    const baseHp = 2600;
    this.maxHp = Math.round(baseHp * difficultyMods.hpMult);
    this.hp = this.maxHp;
    this.phase = 1;
    this.timer = 0;
    this.moveDir = 1;
    this.alive = true;

    this.vulcanTimer = 0;
    this.missileTimer = 0;
    this.droneSpawnTimer = 4.0;

    // Laser Central (Fase 3)
    this.laserWarning = false;
    this.laserActive = false;
    this.laserTimer = 0;
    this.laserWidth = 46;
  }

  update(dt, enemyBullets, player, particles, mods, enemies) {
    this.timer += dt;

    if (this.y < this.targetY) {
      this.y += 1.5 * dt * 60;
      return true;
    }

    this.x += this.moveDir * 1.2 * dt * 60;
    if (this.x > this.canvasWidth - 110) this.moveDir = -1;
    if (this.x < 110) this.moveDir = 1;

    const hpPct = this.hp / this.maxHp;
    if (hpPct > 0.66) {
      this.phase = 1;
    } else if (hpPct > 0.33) {
      this.phase = 2;
      if (Math.random() > 0.4) {
        particles.addSmoke(this.x - 55, this.y + 10);
        particles.addAfterburner(this.x - 55, this.y + 10, -0.5, 2, '#ff3d00');
      }
    } else {
      this.phase = 3;
      if (Math.random() > 0.3) {
        particles.addSmoke(this.x - 55, this.y + 10);
        particles.addSmoke(this.x + 55, this.y + 10);
        particles.addAfterburner(this.x - 55, this.y + 10, -0.5, 2, '#ff3d00');
        particles.addAfterburner(this.x + 55, this.y + 10, 0.5, 2, '#ff3d00');
      }
    }

    // Ataque 1: Metralhadoras / Canhões Laterais
    this.vulcanTimer -= dt * mods.shootFreqMult;
    if (this.vulcanTimer <= 0) {
      this.vulcanTimer = this.phase === 3 ? 0.30 : 0.22;
      const spd = 6.0 * mods.bulletSpeedMult;
      enemyBullets.push(new EnemyBullet(this.x - 45, this.y + 35, -0.6, spd));
      enemyBullets.push(new EnemyBullet(this.x + 45, this.y + 35, 0.6, spd));
    }

    // Ataque 2: Mísseis Guiados (Fase >= 2)
    if (this.phase >= 2) {
      this.missileTimer -= dt * mods.shootFreqMult;
      if (this.missileTimer <= 0) {
        this.missileTimer = 2.4;
        sound.playMissileLaunch();
        enemyBullets.push(new EnemyBullet(this.x - 70, this.y + 10, -2.5, 3.5 * mods.bulletSpeedMult, false, mods.homingEnemyMissiles));
        enemyBullets.push(new EnemyBullet(this.x + 70, this.y + 10, 2.5, 3.5 * mods.bulletSpeedMult, false, mods.homingEnemyMissiles));
      }
    }

    // Invocação de Drones de Apoio (Titan-01 e Cyber-Valkyrie)
    if (this.biomeId === 'clouds' || this.biomeId === 'megacity') {
      this.droneSpawnTimer -= dt;
      if (this.droneSpawnTimer <= 0 && enemies.length < 6) {
        this.droneSpawnTimer = 5.0;
        enemies.push(new Enemy(6, this.x - 40, this.y + 40));
        enemies.push(new Enemy(6, this.x + 40, this.y + 40));
      }
    }

    // Ataque 3: Super-Laser Devastador Central (Fase 3)
    if (this.phase === 3) {
      this.laserTimer += dt;
      if (this.laserTimer >= 5.0) {
        this.laserTimer = 0;
        this.laserWarning = false;
        this.laserActive = false;
      } else if (this.laserTimer >= 3.0 && !this.laserActive) {
        this.laserWarning = false;
        this.laserActive = true;
        particles.shake(12, 0.4);
      } else if (this.laserTimer >= 1.6 && !this.laserWarning && !this.laserActive) {
        this.laserWarning = true;
        sound.playLaserCharge();
      }

      if (this.laserActive) {
        particles.shake(5, 0.1);
        if (Math.abs(player.x - this.x) < this.laserWidth / 2 + 10 && player.y > this.y) {
          player.takeDamage(1.5, particles, mods.playerDamageMult);
        }
      }
    }

    return this.alive;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.laserWarning) {
      ctx.fillStyle = 'rgba(255, 23, 68, 0.22)';
      ctx.fillRect(-this.laserWidth / 2, 35, this.laserWidth, 900);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 1;
      ctx.strokeRect(-this.laserWidth / 2, 35, this.laserWidth, 900);
    }

    if (this.laserActive) {
      ctx.fillStyle = 'rgba(255, 23, 68, 0.75)';
      ctx.shadowColor = '#ff1744';
      ctx.shadowBlur = 20;
      ctx.fillRect(-this.laserWidth / 2, 35, this.laserWidth, 900);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-this.laserWidth / 4, 35, this.laserWidth / 2, 900);
    }

    // Desenho do Chefe com base no Bioma
    const bossGrad = ctx.createLinearGradient(-90, 0, 90, 0);
    if (this.biomeId === 'canyon') {
      bossGrad.addColorStop(0, '#5d4037'); bossGrad.addColorStop(0.5, '#8d6e63'); bossGrad.addColorStop(1, '#5d4037');
    } else if (this.biomeId === 'megacity') {
      bossGrad.addColorStop(0, '#120024'); bossGrad.addColorStop(0.5, '#311b92'); bossGrad.addColorStop(1, '#120024');
    } else if (this.biomeId === 'arctic') {
      bossGrad.addColorStop(0, '#1c3144'); bossGrad.addColorStop(0.5, '#486581'); bossGrad.addColorStop(1, '#1c3144');
    } else {
      bossGrad.addColorStop(0, '#102a43'); bossGrad.addColorStop(0.5, '#334e68'); bossGrad.addColorStop(1, '#102a43');
    }

    ctx.fillStyle = bossGrad;
    ctx.strokeStyle = this.biomeId === 'megacity' ? '#e040fb' : (this.biomeId === 'canyon' ? '#ff9100' : '#00e5ff');
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(0, 48);
    ctx.lineTo(25, 28);
    ctx.lineTo(95, 10);
    ctx.lineTo(85, -25);
    ctx.lineTo(30, -18);
    ctx.lineTo(0, -35);
    ctx.lineTo(-30, -18);
    if (this.phase >= 2) {
      ctx.lineTo(-70, -18);
      ctx.lineTo(-75, 4);
    } else {
      ctx.lineTo(-85, -25);
      ctx.lineTo(-95, 10);
    }
    ctx.lineTo(-25, 28);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Reator central
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    const reactorColor = this.phase === 3 ? '#ff1744' : (this.phase === 2 ? '#ffb300' : '#00e5ff');
    ctx.fillStyle = reactorColor;
    ctx.shadowColor = reactorColor;
    ctx.shadowBlur = 15;
    ctx.fill();

    ctx.restore();
  }
}

// --- 14. ENTRADA DE DADOS (TECLADO, TOUCH & GAMEPAD API) ---
class InputHandler {
  constructor(canvas) {
    this.keys = {};
    this.consumed = {};
    this.canvas = canvas;

    this.pointerActive = false;
    this.pointerX = 270;
    this.pointerY = 750;

    this.moveX = 0;
    this.moveY = 0;
    this.fire = false;
    this.specialPressed = false;
    this.focusPressed = false;
    this.missilePressed = false;
    this.flarePressed = false;

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
      if (gp.buttons[2]?.pressed) this.missilePressed = true;
      if (gp.buttons[3]?.pressed || gp.buttons[4]?.pressed) this.flarePressed = true;
      if (gp.buttons[1]?.pressed || gp.buttons[5]?.pressed) this.specialPressed = true;
      if (gp.buttons[8]?.pressed || gp.buttons[6]?.pressed) this.focusPressed = true; // Select / L2 -> Foco
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

  consumeSpecial() {
    if (this.specialPressed || this.consume('KeyQ')) {
      this.specialPressed = false;
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

  consumeMissile() {
    if (this.missilePressed || this.consume('KeyK') || this.consume('ShiftLeft') || this.consume('ShiftRight')) {
      this.missilePressed = false;
      return true;
    }
    return false;
  }

  consumeFlare() {
    if (this.flarePressed || this.consume('KeyL')) {
      this.flarePressed = false;
      return true;
    }
    return false;
  }
}

// --- 15. GERENCIADOR DE ONDAS E ENTIDADES ---
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
    this.lastBossScore = 0;
    this.biomeId = 'clouds';
  }

  setBiome(biomeId) {
    this.biomeId = biomeId;
    this.enemies = [];
    this.enemyBullets = [];
  }

  spawnWave(score, difficultyMods) {
    const r = Math.random();
    const x = Math.random() * (this.width - 120) + 60;
    const hpMult = difficultyMods.hpMult;

    if (score > 1200 && r < 0.16) {
      this.enemies.push(new Enemy(4, x, -50, hpMult));
    } else if (score > 600 && r < 0.32) {
      this.enemies.push(new Enemy(5, x, -30, hpMult));
    } else if (score > 800 && r < 0.50) {
      this.enemies.push(new Enemy(3, x, -50, hpMult));
    } else if (score > 300 && r < 0.75) {
      this.enemies.push(new Enemy(2, x, -40, hpMult));
    } else {
      this.enemies.push(new Enemy(1, x, -30, hpMult));
    }
  }

  dropPowerUp(x, y) {
    const r = Math.random();
    let type = 'W';
    if (r < 0.35) type = 'W';
    else if (r < 0.65) type = 'M';
    else if (r < 0.85) type = 'S';
    else type = 'B';
    this.powerups.push(new PowerUp(x, y, type));
  }

  dropCoins(x, y, count = 1) {
    for (let i = 0; i < count; i++) {
      this.coins.push(new Coin(x, y));
    }
  }

  update(dt, player, particles, score, difficultyMods, uiController, onBossDefeated) {
    // Chefe de Fase aparece a cada 2.500 pontos
    if (!this.boss && score - this.lastBossScore >= 2500) {
      this.boss = new Boss(this.width, this.height, difficultyMods, this.biomeId);
      this.lastBossScore = Math.floor(score / 2500) * 2500;
      sound.playWarning();
      uiController.triggerRadio(`ALERTA MÁXIMO! Assinatura do Chefe ${this.boss.biomeInfo.bossName} detectada no radar!`);
    }

    if (!this.boss) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        this.spawnWave(score, difficultyMods);
        this.spawnTimer = Math.max(0.6, (1.8 - (score / 6000)) / difficultyMods.shootFreqMult);
      }
    }

    if (this.boss) {
      this.boss.update(dt, this.enemyBullets, player, particles, difficultyMods, this.enemies);
      if (this.boss.hp <= 0) {
        particles.addExplosion(this.boss.x, this.boss.y, 75, true);
        this.dropPowerUp(this.boss.x, this.boss.y);
        this.dropCoins(this.boss.x, this.boss.y, 18);
        this.boss = null;
        if (onBossDefeated) onBossDefeated();
      }
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      const keep = e.update(dt, this.enemyBullets, player.x, player.y, difficultyMods);
      if (!keep || e.hp <= 0) {
        if (e.hp <= 0) {
          particles.addExplosion(e.x, e.y, e.type === 3 ? 35 : 18, e.type === 3);
          const coinCount = e.type === 3 ? 5 : (e.type === 4 ? 4 : (e.type === 2 ? 3 : 1));
          this.dropCoins(e.x, e.y, coinCount);

          // Recarrega Foco Tático ao matar inimigo
          player.focus = Math.min(player.focusMax, player.focus + 12);
          player.killsWithoutDamage++;

          if (player.killsWithoutDamage >= 15 && !player.overdriveActive) {
            player.triggerOverdrive(uiController);
          }

          const baseChance = e.type === 3 ? 0.8 : (e.type === 4 ? 0.6 : (e.type === 2 ? 0.45 : 0.22));
          const finalDropChance = Math.min(1.0, baseChance + difficultyMods.dropRateBonus);
          if (Math.random() < finalDropChance) {
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

  draw(ctx) {
    for (let c of this.coins) c.draw(ctx);
    for (let p of this.powerups) p.draw(ctx);
    for (let e of this.enemies) e.draw(ctx);
    if (this.boss) this.boss.draw(ctx);
    for (let b of this.enemyBullets) b.draw(ctx);
  }
}

// --- 16. CONTROLADOR DE INTERFACE DO USUÁRIO (UIController) ---
class UIController {
  constructor(engine) {
    this.engine = engine;
    this.radioBox = document.getElementById('militaryRadioBox');
    this.radioText = document.getElementById('radioMessageText');
    this.radioTimer = null;

    this.routeScreen = document.getElementById('routeSelectScreen');
    this.routeContainer = document.getElementById('routeCardsContainer');
  }

  triggerRadio(text, duration = 4.0) {
    if (this.radioTimer) clearTimeout(this.radioTimer);
    sound.playRadioChirp();
    this.radioText.innerText = text;
    this.radioBox.classList.remove('hidden');

    this.radioTimer = setTimeout(() => {
      this.radioBox.classList.add('hidden');
      this.radioTimer = null;
    }, duration * 1000);
  }

  showRouteSelection(currentBiomeId, onSelectRoute) {
    this.routeContainer.innerHTML = '';
    const otherBiomes = Object.keys(BIOMES).filter(b => b !== currentBiomeId);

    // Seleciona 2 opções distintas aleatórias
    const shuffled = otherBiomes.sort(() => 0.5 - Math.random());
    const choices = shuffled.slice(0, 2);

    choices.forEach(biomeId => {
      const b = BIOMES[biomeId];
      const card = document.createElement('div');
      card.className = 'route-card';
      card.innerHTML = `
        <div class="route-icon">${b.icon}</div>
        <div class="route-title">${b.name}</div>
        <div class="route-boss">CHEFE: ${b.bossName}</div>
        <div class="route-desc">${b.desc}</div>
        <div class="route-badge">⚠️ ${b.hazard}</div>
        <button class="arcade-btn" style="padding: 8px 18px; font-size: 11px;">INTERCEPTAR ✈️</button>
      `;
      card.addEventListener('click', () => {
        this.routeScreen.classList.add('hidden');
        onSelectRoute(biomeId);
      });
      this.routeContainer.appendChild(card);
    });

    this.routeScreen.classList.remove('hidden');
  }
}

// --- 17. MOTOR PRINCIPAL DO JOGO (GameEngine) ---
class GameEngine {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.saveData = StorageManager.load();
    this.selectedPlane = this.saveData.plane;
    this.selectedDifficulty = this.saveData.difficulty;
    this.totalGold = this.saveData.gold;
    this.highScore = this.saveData.highScore;
    this.upgrades = this.saveData.upgrades;

    this.currentBiome = 'clouds';
    this.timeScale = 1.0;

    this.input = new InputHandler(this.canvas);
    this.background = new ParallaxBackground(this.width, this.height);
    this.particles = new ParticleSystem();
    this.weather = new WeatherSystem(this.width, this.height);
    this.enemyMgr = new EnemyManager(this.width, this.height);
    this.player = new Player(this.width / 2, 750, this.selectedPlane, this.upgrades);
    this.ui = new UIController(this);
    this.projectiles = [];

    this.state = 'START'; // 'START', 'PLAYING', 'PAUSED', 'GAMEOVER', 'SHOP', 'ROUTE'
    this.previousState = 'START';
    this.score = 0;
    this.sessionGold = 0;
    this.combo = 1;
    this.comboTimer = 0;
    this.comboMaxTimer = 2.5;

    this.enemiesDestroyed = 0;
    this.shotsFired = 0;
    this.shotsHit = 0;

    // Elementos DOM
    this.startScreen = document.getElementById('startScreen');
    this.pauseScreen = document.getElementById('pauseScreen');
    this.gameOverScreen = document.getElementById('gameOverScreen');
    this.shopScreen = document.getElementById('shopScreen');
    this.soundBtn = document.getElementById('soundToggleBtn');
    this.pauseHudBtn = document.getElementById('pauseHudBtn');
    this.touchSpecialBtn = document.getElementById('touchSpecialBtn');
    this.touchSpecialLabel = document.getElementById('touchSpecialLabel');
    this.touchFocusBtn = document.getElementById('touchFocusBtn');
    this.touchFlaresBtn = document.getElementById('touchFlaresBtn');
    this.touchMissileBtn = document.getElementById('touchMissileBtn');

    this.bindEvents();
    this.updateShopUI();
    this.updatePlaneSelectionUI();
    this.updateDifficultyUI();

    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  bindEvents() {
    document.getElementById('startBtn').addEventListener('click', () => this.startGame());
    document.getElementById('resumeBtn').addEventListener('click', () => this.togglePause());
    document.getElementById('restartPauseBtn').addEventListener('click', () => this.restartGame());
    document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
    document.getElementById('quitMenuBtn').addEventListener('click', () => this.returnToMenu());
    document.getElementById('gameOverMenuBtn').addEventListener('click', () => this.returnToMenu());

    this.pauseHudBtn.addEventListener('click', () => this.togglePause());

    this.soundBtn.addEventListener('click', () => {
      sound.init();
      const isMuted = sound.toggleMute();
      this.soundBtn.innerText = isMuted ? '🔇' : '🔊';
    });

    // Configurações de Áudio
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

    // Loja
    document.getElementById('openShopBtn').addEventListener('click', () => this.openShop());
    document.getElementById('pauseShopBtn').addEventListener('click', () => this.openShop());
    document.getElementById('gameOverShopBtn').addEventListener('click', () => this.openShop());
    document.getElementById('closeShopBtn').addEventListener('click', () => this.closeShop());

    document.getElementById('buyArmorBtn').addEventListener('click', () => this.buyUpgrade('armor'));
    document.getElementById('buyDamageBtn').addEventListener('click', () => this.buyUpgrade('damage'));
    document.getElementById('buySpecialBtn').addEventListener('click', () => this.buyUpgrade('specialCooldown'));
    document.getElementById('buyMagnetBtn').addEventListener('click', () => this.buyUpgrade('magnet'));

    document.querySelectorAll('.diff-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const diff = e.currentTarget.dataset.diff;
        if (diff) this.setDifficulty(diff);
      });
    });

    document.querySelectorAll('.plane-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const plane = e.currentTarget.dataset.plane;
        this.selectPlane(plane);
      });
    });

    this.touchSpecialBtn.addEventListener('click', () => { this.input.specialPressed = true; });
    this.touchFocusBtn.addEventListener('click', () => { this.input.focusPressed = true; });
    this.touchFlaresBtn.addEventListener('click', () => { this.input.flarePressed = true; });
    this.touchMissileBtn.addEventListener('click', () => { this.input.missilePressed = true; });
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
    this.selectedPlane = planeId;
    this.saveData.plane = planeId;
    StorageManager.save(this.saveData);
    this.updatePlaneSelectionUI();
  }

  updatePlaneSelectionUI() {
    document.querySelectorAll('.plane-card').forEach(card => {
      card.classList.toggle('active', card.dataset.plane === this.selectedPlane);
    });

    const data = PLANE_DATA[this.selectedPlane];
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
    renderPips('damageLevelPips', this.upgrades.damage || 0, 5);
    renderPips('specialLevelPips', this.upgrades.specialCooldown || 0, 5);
    renderPips('magnetLevelPips', this.upgrades.magnet || 0, 5);

    updateBtn('buyArmorBtn', 'armorCostText', 'armor');
    updateBtn('buyDamageBtn', 'damageCostText', 'damage');
    updateBtn('buySpecialBtn', 'specialCostText', 'specialCooldown');
    updateBtn('buyMagnetBtn', 'magnetCostText', 'magnet');
  }

  openShop() {
    this.previousState = this.state;
    this.state = 'SHOP';
    this.updateShopUI();
    this.shopScreen.classList.remove('hidden');
  }

  closeShop() {
    this.shopScreen.classList.add('hidden');
    this.state = this.previousState;
    if (this.state === 'START') this.startScreen.classList.remove('hidden');
    else if (this.state === 'PAUSED') this.pauseScreen.classList.remove('hidden');
    else if (this.state === 'GAMEOVER') this.gameOverScreen.classList.remove('hidden');
  }

  changeBiome(newBiomeId) {
    this.currentBiome = newBiomeId;
    this.background.setBiome(newBiomeId);
    this.weather.setBiome(newBiomeId);
    this.enemyMgr.setBiome(newBiomeId);
    this.ui.triggerRadio(`Entrando no setor ${BIOMES[newBiomeId].name.toUpperCase()}! Prepare-se para ${BIOMES[newBiomeId].hazard}.`);
  }

  onBossDefeated() {
    this.state = 'ROUTE';
    this.addScore(5000);
    this.ui.showRouteSelection(this.currentBiome, (chosenBiome) => {
      this.changeBiome(chosenBiome);
      this.state = 'PLAYING';
      this.lastTime = performance.now();
    });
  }

  startGame() {
    sound.init();
    this.state = 'PLAYING';
    this.currentBiome = 'clouds';
    this.background.setBiome('clouds');
    this.weather.setBiome('clouds');
    this.enemyMgr.setBiome('clouds');
    this.player = new Player(this.width / 2, 750, this.selectedPlane, this.upgrades);
    this.startScreen.classList.add('hidden');
    this.pauseScreen.classList.add('hidden');
    this.gameOverScreen.classList.add('hidden');
    this.shopScreen.classList.add('hidden');
    this.lastTime = performance.now();
    this.ui.triggerRadio('Voo autorizado! Pressione [E] para Foco Tático e atinja combo 15 para Overdrive!');
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
    this.player = new Player(this.width / 2, 750, this.selectedPlane, this.upgrades);
    this.enemyMgr = new EnemyManager(this.width, this.height);
    this.projectiles = [];
    this.score = 0;
    this.sessionGold = 0;
    this.combo = 1;
    this.comboTimer = 0;
    this.enemiesDestroyed = 0;
    this.shotsFired = 0;
    this.shotsHit = 0;
    this.startGame();
  }

  returnToMenu() {
    this.state = 'START';
    this.pauseScreen.classList.add('hidden');
    this.gameOverScreen.classList.add('hidden');
    this.shopScreen.classList.add('hidden');
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
    StorageManager.save(this.saveData);

    document.getElementById('finalScore').innerText = this.score.toLocaleString();
    document.getElementById('highScoreStat').innerText = this.highScore.toLocaleString();
    document.getElementById('killsStat').innerText = this.enemiesDestroyed;
    document.getElementById('goldEarnedStat').innerText = this.sessionGold.toLocaleString();

    this.gameOverScreen.classList.remove('hidden');
    this.ui.triggerRadio('Sinal de emergência emitido... Esquadrão de resgate a caminho.');
  }

  addScore(amount) {
    const diffMods = DIFFICULTY_MODS[this.selectedDifficulty];
    const earned = Math.round(amount * this.combo * diffMods.scoreMult);
    this.score += earned;
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

      // Contra Chefe
      if (boss && boss.hp > 0) {
        const dist = Math.hypot(boss.x - p.x, boss.y - p.y);
        if (dist < boss.radius + p.radius) {
          boss.hp -= p.damage;
          this.shotsHit++;
          this.particles.addExplosion(p.x, p.y, 4, false);
          if (!p.isOverdrive) this.projectiles.splice(i, 1);
          if (boss.hp <= 0) {
            this.addScore(3500);
            this.enemiesDestroyed++;
          }
          continue;
        }
      }

      // Contra Alvos Terrestres/Navais
      let hitSurface = false;
      for (let st of surfaceTargets) {
        if (st.alive && st.hp > 0) {
          const dist = Math.hypot(st.x - p.x, st.y - p.y);
          if (dist < st.radius + p.radius) {
            st.hp -= p.damage;
            this.shotsHit++;
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
            this.shotsHit++;
            this.particles.addExplosion(p.x, p.y, 3, false);
            if (!p.isOverdrive) this.projectiles.splice(i, 1);
            if (enemy.hp <= 0) {
              this.addScore(enemy.scoreVal);
              this.enemiesDestroyed++;
            }
            break;
          }
        }
      }
    }

    // Balas Inimigas contra Jogador
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      const dist = Math.hypot(this.player.x - b.x, this.player.y - b.y);
      if (dist < this.player.radius + b.radius) {
        const hit = this.player.takeDamage(b.isMine ? 35 : (b.isHoming ? 28 : 18), this.particles, diffMods.playerDamageMult, this.ui);
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
          this.player.takeDamage(enemy.type === 5 ? 45 : 30, this.particles, diffMods.playerDamageMult, this.ui);
          enemy.hp = 0;
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
        } else if (pu.type === 'S') {
          this.player.hp = Math.min(this.player.maxHp, this.player.hp + Math.round(this.player.maxHp * 0.35));
        } else if (pu.type === 'B') {
          this.player.wingmanTimer = 15.0;
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
        coins.splice(i, 1);
      }
    }
  }

  update(dt) {
    if (this.input.consume('KeyP') || this.input.consume('Escape')) {
      this.togglePause();
    }

    if (this.state !== 'PLAYING') return;

    // Bullet Time escala o tempo de jogo (60% slowdown)
    this.timeScale = this.player.focusActive ? 0.4 : 1.0;
    const gameDt = dt * this.timeScale;

    this.input.update();

    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.combo = 1;
    }

    const diffMods = DIFFICULTY_MODS[this.selectedDifficulty];

    this.background.update(gameDt, this.enemyMgr.enemyBullets, this.player.x, this.player.y, diffMods.bulletSpeedMult);
    this.weather.update(gameDt, this.player, this.particles, this.enemyMgr.enemyBullets);
    this.particles.update(gameDt);

    // O jogador sempre responde em tempo real (dt total para esquivas ágeis)
    const oldProjCount = this.projectiles.length;
    this.player.update(dt, this.input, this.particles, this.projectiles, this.enemyMgr.enemies, this.enemyMgr.enemyBullets, diffMods.playerDamageMult, this.ui);
    if (this.projectiles.length > oldProjCount) {
      this.shotsFired += (this.projectiles.length - oldProjCount);
    }

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      const keep = p.update(dt, this.enemyMgr.enemies);
      if (p.isMissile) this.particles.addSmoke(p.x, p.y + 10);
      if (!keep) this.projectiles.splice(i, 1);
    }

    this.enemyMgr.update(gameDt, this.player, this.particles, this.score, diffMods, this.ui, () => this.onBossDefeated());

    this.checkCollisions();

    // Atualiza status visual dos botões touch
    this.touchSpecialBtn.classList.toggle('ready', this.player.specialCooldown <= 0);
    this.touchSpecialBtn.classList.toggle('cooldown', this.player.specialCooldown > 0);

    this.touchFocusBtn.classList.toggle('ready', this.player.focus >= 25 && !this.player.focusActive);
    this.touchFocusBtn.classList.toggle('cooldown', this.player.focus < 25 || this.player.focusActive);

    this.touchFlaresBtn.classList.toggle('cooldown', this.player.flareCooldown > 0);
  }

  drawHUD() {
    const ctx = this.ctx;

    // Fundo Superior do HUD
    ctx.fillStyle = 'rgba(5, 15, 28, 0.82)';
    ctx.fillRect(0, 0, this.width, 74);
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.35)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, this.width, 74);

    // 1. Barra de Vida (Top Left)
    ctx.fillStyle = '#78909c';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(`ESCUDO [${this.player.data.name.split(' ')[0]}]`, 16, 14);

    const hpBarW = 105;
    const hpPct = Math.max(0, this.player.hp / this.player.maxHp);
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(16, 18, hpBarW, 9);

    const hpGrad = ctx.createLinearGradient(16, 0, 16 + hpBarW, 0);
    if (hpPct > 0.5) { hpGrad.addColorStop(0, '#00e676'); hpGrad.addColorStop(1, '#00e5ff'); }
    else if (hpPct > 0.25) { hpGrad.addColorStop(0, '#ff9100'); hpGrad.addColorStop(1, '#ffeb3b'); }
    else { hpGrad.addColorStop(0, '#d50000'); hpGrad.addColorStop(1, '#ff1744'); }
    ctx.fillStyle = hpGrad;
    ctx.fillRect(16, 18, hpBarW * hpPct, 9);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.strokeRect(16, 18, hpBarW, 9);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(`${Math.ceil(this.player.hp)} HP`, 126, 26);

    // 2. Barra de Foco Tático (Bullet Time - E)
    ctx.fillStyle = '#81d4fa';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('FOCO [E]', 16, 38);

    const focusPct = Math.max(0, this.player.focus / this.player.focusMax);
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(16, 42, hpBarW, 7);

    ctx.fillStyle = this.player.focusActive ? '#00e5ff' : '#0091ea';
    ctx.fillRect(16, 42, hpBarW * focusPct, 7);
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.5)';
    ctx.strokeRect(16, 42, hpBarW, 7);

    // Moedas e Setor
    ctx.fillStyle = '#ffd54f';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(`🪙 ${this.sessionGold}`, 16, 62);

    ctx.fillStyle = '#80deea';
    ctx.font = '9px monospace';
    ctx.fillText(`SETOR: ${BIOMES[this.currentBiome].name.toUpperCase()}`, 70, 62);

    // 3. Pontuação e Recorde (Centro)
    ctx.textAlign = 'center';
    ctx.fillStyle = '#00e5ff';
    ctx.font = '900 19px monospace';
    ctx.fillText(this.score.toString().padStart(6, '0'), this.width / 2, 24);

    ctx.fillStyle = '#ffb300';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(`HI: ${this.highScore.toString().padStart(6, '0')}`, this.width / 2, 38);

    if (this.combo > 1) {
      ctx.fillStyle = '#ffea00';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`COMBO x${this.combo.toFixed(1)}`, this.width / 2, 53);
    }

    // Badge de Overdrive
    if (this.player.overdriveActive) {
      ctx.fillStyle = '#ff3d00';
      ctx.font = '900 11px monospace';
      ctx.fillText('🔥 OVERDRIVE ATIVO! 🔥', this.width / 2, 68);
    }

    // 4. Mísseis, Especial e Status (Top Right)
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`🚀 MÍSSEIS: ${this.player.missiles}`, this.width - 16, 18);

    if (this.player.specialCooldown <= 0) {
      ctx.fillStyle = '#00e676';
      ctx.fillText(`⚡ Q: PRONTO!`, this.width - 16, 32);
    } else {
      ctx.fillStyle = '#d500f9';
      ctx.fillText(`⚡ Q: ${this.player.specialCooldown.toFixed(1)}s`, this.width - 16, 32);
    }

    if (this.player.flareCooldown <= 0) {
      ctx.fillStyle = '#ffca28';
      ctx.fillText('✨ FLARES: PRONTO', this.width - 16, 46);
    } else {
      ctx.fillStyle = '#ff5252';
      ctx.fillText(`✨ FLARES: ${this.player.flareCooldown.toFixed(1)}s`, this.width - 16, 46);
    }

    ctx.fillStyle = '#00e5ff';
    ctx.font = '10px monospace';
    ctx.fillText(`ARMA LV.${this.player.weaponLevel}`, this.width - 16, 60);

    ctx.textAlign = 'left';

    // 5. Barra Segmentada do Chefe de Fase
    const boss = this.enemyMgr.boss;
    if (boss && boss.hp > 0) {
      const bossBarW = 340;
      const bx = (this.width - bossBarW) / 2;
      const by = 84;
      const bPct = Math.max(0, boss.hp / boss.maxHp);

      ctx.fillStyle = 'rgba(5, 15, 28, 0.9)';
      ctx.fillRect(bx - 10, by - 6, bossBarW + 20, 32);
      ctx.strokeStyle = '#ff1744';
      ctx.strokeRect(bx - 10, by - 6, bossBarW + 20, 32);

      ctx.fillStyle = '#ff1744';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`⚠️ ${boss.biomeInfo.bossName.toUpperCase()} [${boss.biomeInfo.bossTitle}]`, bx, by + 5);

      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(bx, by + 10, bossBarW, 10);

      ctx.fillStyle = boss.phase === 3 ? '#ff1744' : (boss.phase === 2 ? '#ff9100' : '#00e5ff');
      ctx.fillRect(bx, by + 10, bossBarW * bPct, 10);

      // 3 Segmentos Visíveis
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(bx + bossBarW * 0.33, by + 10); ctx.lineTo(bx + bossBarW * 0.33, by + 20);
      ctx.moveTo(bx + bossBarW * 0.66, by + 10); ctx.lineTo(bx + bossBarW * 0.66, by + 20);
      ctx.stroke();
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    ctx.save();
    this.particles.applyScreenShake(ctx);

    // Efeito de Vinheta Azul no Bullet Time
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

    ctx.restore();

    if (this.state === 'PLAYING' || this.state === 'PAUSED') {
      this.drawHUD();
    }
  }

  loop(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }
}

// Inicialização ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
  new GameEngine();
});
