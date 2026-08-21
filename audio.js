/* =========================================================
   audio.js
   効果音（Web Audio API / 追加ファイル不要）とバイブレーション
   ========================================================= */

// ---------- ローカルストレージの共通ヘルパー ----------
// 他のファイル（game.js など）からも使う共通関数のため、読み込み順が最初のここに置く。
function safeGet(key) {
  try {
    return localStorage.getItem(key);
  } catch (err) {
    return null;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    // プライベートブラウズ等でlocalStorageが使えない場合は無視
  }
}

const MUTE_KEY = "karaokeTyping.muted";

let audioCtx = null;
let muted = safeGet(MUTE_KEY) === "1";

function ensureAudio() {
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) audioCtx = new AudioCtx();
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

function playTone(freq, duration, type = "sine", peak = 0.15, delay = 0) {
  if (muted || !audioCtx) return;
  const t0 = audioCtx.currentTime + delay;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(peak, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

function sfxCorrect() {
  playTone(880, 0.08, "sine", 0.12);
}

function sfxMiss() {
  playTone(140, 0.16, "sawtooth", 0.14);
}

function sfxWordComplete() {
  playTone(660, 0.1, "triangle", 0.14);
  playTone(880, 0.12, "triangle", 0.14, 0.06);
  playTone(1100, 0.16, "triangle", 0.14, 0.12);
}

function sfxHypeMax() {
  playTone(523, 0.18, "triangle", 0.15);
  playTone(659, 0.18, "triangle", 0.15, 0.05);
  playTone(784, 0.18, "triangle", 0.15, 0.1);
  playTone(1047, 0.3, "triangle", 0.16, 0.15);
}

function sfxMiracle() {
  playTone(523, 0.16, "triangle", 0.16);
  playTone(659, 0.16, "triangle", 0.16, 0.08);
  playTone(784, 0.16, "triangle", 0.16, 0.16);
  playTone(1047, 0.16, "triangle", 0.17, 0.24);
  playTone(1319, 0.4, "triangle", 0.18, 0.32);
}

function sfxTick() {
  playTone(400, 0.05, "square", 0.06);
}

// ---------- バイブレーション（対応端末のみ・ミュート設定と連動） ----------
function vibrate(pattern) {
  if (muted) return;
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

/* =========================================================
   BGMループ（追加ファイル不要 / シンプルなアルペジオを繰り返す）
   ========================================================= */

const BGM_KEY = "karaokeTyping.bgmEnabled";
let bgmEnabled = safeGet(BGM_KEY) === "1"; // デフォルトはOFF（意図せず音楽が鳴らないよう配慮）
let bgmTimer = null;
let bgmStep = 0;
let bgmSpeedFactor = 1; // ラストスパート時に一時的に速くする

// シンプルな8ステップのアルペジオ（C - E - G - E - D - F - A - F）
const BGM_PATTERN = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880.0, 698.46];
const BGM_STEP_MS = 220;

function playBgmStep() {
  if (!bgmEnabled) return;
  const freq = BGM_PATTERN[bgmStep % BGM_PATTERN.length];
  playTone(freq, 0.18, "sine", 0.05);
  if (bgmStep % 2 === 0) playTone(freq / 2, 0.3, "triangle", 0.04); // 2拍ごとに軽いベース音
  bgmStep += 1;
  bgmTimer = setTimeout(playBgmStep, BGM_STEP_MS * bgmSpeedFactor);
}

function startBgm() {
  if (bgmTimer || !bgmEnabled) return;
  ensureAudio();
  bgmStep = 0;
  playBgmStep();
}

function stopBgm() {
  if (bgmTimer) {
    clearTimeout(bgmTimer);
    bgmTimer = null;
  }
  bgmSpeedFactor = 1;
}

function setBgmEnabled(value) {
  bgmEnabled = value;
  safeSet(BGM_KEY, value ? "1" : "0");
  if (!value) stopBgm();
}

// ラストスパート演出用：BGMのテンポを一時的に上げる（元に戻すときはfalseを渡す）
function setBgmFast(on) {
  bgmSpeedFactor = on ? 0.62 : 1;
}