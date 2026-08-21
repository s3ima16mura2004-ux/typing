/* =========================================================
   game.js
   ライブステージ・タイピング — ゲーム本体
   打鍵ごとに客席のペンライトが1本ずつ灯っていくタイピングゲーム
   ※ words.js / audio.js を先に読み込んでおくこと。
   ========================================================= */

const GAME_SECONDS = 60;
const CROWD_SIZE = 63; // 9列 x 7段
const BEST_SCORE_KEY = "karaokeTyping.bestScores";
const BEST_TRACE_KEY = "karaokeTyping.bestTraces";
const DIFF_KEY = "karaokeTyping.difficulty";
const RUN_HISTORY_KEY = "karaokeTyping.runHistory";
const MISS_STATS_KEY = "karaokeTyping.missStats";
const WEAK_POOL_SIZE = 12;
const FINAL_SPURT_THRESHOLD = 10;
const FINAL_SPURT_MULT = 1.5;
const BONUS_WORD_CHANCE = 0.12;
const BOSS_WORD_CHANCE = 0.03;
const BOSS_WORD_MULT = 3;
const PERFECT_BONUS_RATE = 0.2;
const MISSION_BONUS_RATE = 0.1;
const SKILL_COMBO_STEP = 10; // このコンボ数の倍数に達するたびにスキルが1回チャージされる
const FEVER_MULT = 2;
const FEVER_DURATION_MS = 5000;
const STAR_TIME_MULT = 2;
const STAR_TIME_DURATION_MS = 8000;
const SPEED_DEMON_MS = 1500;
const SABOTAGE_MAX_PER_MATCH = 2;
const ENCORE_TIME_BONUS = 10;
const ENCORE_DURATION_MS = 10000;
const BAND_LEVEL_STEP = 10; // このコンボ数ごとにバンドの演奏レベルが1つ上がる

const el = {
  crowd: document.getElementById("crowd"),
  stage: document.getElementById("stage"),
  spotlight: document.getElementById("spotlight"),
  mic: document.getElementById("mic"),
  muteBtn: document.getElementById("muteBtn"),
  bgmBtn: document.getElementById("bgmBtn"),
  pauseBtn: document.getElementById("pauseBtn"),
  scoreValue: document.getElementById("scoreValue"),
  comboValue: document.getElementById("comboValue"),
  timeValue: document.getElementById("timeValue"),
  hypeFill: document.getElementById("hypeFill"),
  hypeBanner: document.getElementById("hypeBanner"),
  ghostDiff: document.getElementById("ghostDiff"),
  duelPlayerBadge: document.getElementById("duelPlayerBadge"),
  prompter: document.getElementById("prompter"),
  bonusWordTag: document.getElementById("bonusWordTag"),
  bossWordTag: document.getElementById("bossWordTag"),
  skillBtn: document.getElementById("skillBtn"),
  reactionPopup: document.getElementById("reactionPopup"),
  bandRow: document.getElementById("bandRow"),
  countdownMissions: document.getElementById("countdownMissions"),
  countdownMissionsList: document.getElementById("countdownMissionsList"),
  promptKana: document.getElementById("promptKana"),
  promptWord: document.getElementById("promptWord"),
  promptRomaji: document.getElementById("promptRomaji"),
  miniPromptKana: document.getElementById("miniPromptKana"),
  miniPromptWord: document.getElementById("miniPromptWord"),
  miniPromptRomaji: document.getElementById("miniPromptRomaji"),
  startOverlay: document.getElementById("startOverlay"),
  startBtn: document.getElementById("startBtn"),
  startBest: document.getElementById("startBest"),
  diffSelect: document.getElementById("diffSelect"),
  dailyBtn: document.getElementById("dailyBtn"),
  dailyStatusInline: document.getElementById("dailyStatusInline"),
  weakBtn: document.getElementById("weakBtn"),
  weakStatusInline: document.getElementById("weakStatusInline"),
  titlesBtn: document.getElementById("titlesBtn"),
  titlesOverlay: document.getElementById("titlesOverlay"),
  titlesCount: document.getElementById("titlesCount"),
  collectionRow: document.getElementById("collectionRow"),
  titlesList: document.getElementById("titlesList"),
  titlesCloseBtn: document.getElementById("titlesCloseBtn"),
  rankingBtn: document.getElementById("rankingBtn"),
  rankingOverlay: document.getElementById("rankingOverlay"),
  dailyStatus: document.getElementById("dailyStatus"),
  rankingList: document.getElementById("rankingList"),
  rankingCloseBtn: document.getElementById("rankingCloseBtn"),
  resultOverlay: document.getElementById("resultOverlay"),
  resultRank: document.getElementById("resultRank"),
  resultBest: document.getElementById("resultBest"),
  resultScore: document.getElementById("resultScore"),
  resultChars: document.getElementById("resultChars"),
  resultAcc: document.getElementById("resultAcc"),
  resultSpeed: document.getElementById("resultSpeed"),
  trendWrap: document.getElementById("trendWrap"),
  trendCanvas: document.getElementById("trendCanvas"),
  setlistWrap: document.getElementById("setlistWrap"),
  setlistList: document.getElementById("setlistList"),
  missedWrap: document.getElementById("missedWrap"),
  missedList: document.getElementById("missedList"),
  growthWrap: document.getElementById("growthWrap"),
  growthList: document.getElementById("growthList"),
  missionResultWrap: document.getElementById("missionResultWrap"),
  missionResultList: document.getElementById("missionResultList"),
  missionBonusNote: document.getElementById("missionBonusNote"),
  perfectBonusNote: document.getElementById("perfectBonusNote"),
  newTitles: document.getElementById("newTitles"),
  diagnosisWrap: document.getElementById("diagnosisWrap"),
  diagnosisType: document.getElementById("diagnosisType"),
  diagnosisStats: document.getElementById("diagnosisStats"),
  retryBtn: document.getElementById("retryBtn"),
  shareBtn: document.getElementById("shareBtn"),
  backToMenuBtn: document.getElementById("backToMenuBtn"),
  pauseOverlay: document.getElementById("pauseOverlay"),
  resumeBtn: document.getElementById("resumeBtn"),
  retireBtn: document.getElementById("retireBtn"),
  quitBtn: document.getElementById("quitBtn"),
  countdownOverlay: document.getElementById("countdownOverlay"),
  countdownNum: document.getElementById("countdownNum"),
  practiceToggle: document.getElementById("practiceToggle"),
  kbdArea: document.getElementById("kbdArea"),
  local2pBtn: document.getElementById("local2pBtn"),
  duelIntroOverlay: document.getElementById("duelIntroOverlay"),
  duelIntroTitle: document.getElementById("duelIntroTitle"),
  duelIntroText: document.getElementById("duelIntroText"),
  duelIntroBtn: document.getElementById("duelIntroBtn"),
  duelResultOverlay: document.getElementById("duelResultOverlay"),
  duelWinnerTitle: document.getElementById("duelWinnerTitle"),
  duelP1Card: document.getElementById("duelP1Card"),
  duelP1Score: document.getElementById("duelP1Score"),
  duelP1Sub: document.getElementById("duelP1Sub"),
  duelP2Card: document.getElementById("duelP2Card"),
  duelP2Score: document.getElementById("duelP2Score"),
  duelP2Sub: document.getElementById("duelP2Sub"),
  duelRetryBtn: document.getElementById("duelRetryBtn"),
  duelBackBtn: document.getElementById("duelBackBtn"),
};

let state = null;
let selectedDifficulty = "normal";
let local2pMatch = null;
let duelPendingPlayer = null;

/* =========================================================
   自己ベストの記録
   ========================================================= */

function loadBestScores() {
  try {
    return JSON.parse(safeGet(BEST_SCORE_KEY)) || {};
  } catch (err) {
    return {};
  }
}

function getBestScore(diff) {
  const scores = loadBestScores();
  return scores[diff] || 0;
}

function saveBestScoreIfHigher(diff, score) {
  const scores = loadBestScores();
  const prevBest = scores[diff] || 0;
  const isNew = score > prevBest;
  if (isNew) {
    scores[diff] = score;
    safeSet(BEST_SCORE_KEY, JSON.stringify(scores));
  }
  return { isNew, best: isNew ? score : prevBest };
}

/* ---------- ライバル（自己ベスト）とのリアルタイム比較用の記録 ---------- */
function loadBestTraces() {
  try {
    return JSON.parse(safeGet(BEST_TRACE_KEY)) || {};
  } catch (err) {
    return {};
  }
}

function getBestTrace(diff) {
  const all = loadBestTraces();
  return all[diff] || null;
}

function saveBestTrace(diff, trace, score) {
  const all = loadBestTraces();
  all[diff] = { score, trace };
  safeSet(BEST_TRACE_KEY, JSON.stringify(all));
}

function refreshStartBest() {
  const best = getBestScore(selectedDifficulty);
  el.startBest.textContent = `自己ベスト（${DIFFICULTIES[selectedDifficulty].label}）：${best}`;
}

/* =========================================================
   デイリーチャレンジ用の疑似乱数（日付をシードにする）
   同じ日ならプレイヤーが違っても同じ単語順になる。
   ========================================================= */

function hashSeedFromString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h;
}

function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function todayDateString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* =========================================================
   プレイ履歴（ローカルランキング・デイリーの記録に使う）
   ========================================================= */

function loadRunHistory() {
  try {
    return JSON.parse(safeGet(RUN_HISTORY_KEY)) || [];
  } catch (err) {
    return [];
  }
}

function recordRun(entry) {
  let history = loadRunHistory();
  history.push(entry);
  if (history.length > 50) history = history.slice(history.length - 50);
  safeSet(RUN_HISTORY_KEY, JSON.stringify(history));
  return history;
}

function getLocalRanking(limit) {
  const history = loadRunHistory();
  return history
    .filter((h) => !h.practice)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit || 5);
}

function getTodayDaily() {
  const todayStr = todayDateString();
  const history = loadRunHistory();
  const todays = history.filter((h) => h.isDaily && h.date && h.date.slice(0, 10) === todayStr);
  if (todays.length === 0) return null;
  return todays.reduce((best, h) => (h.score > best.score ? h : best), todays[0]);
}

function refreshDailyButton() {
  const daily = getTodayDaily();
  const streak = getDailyStreak();
  const streakText = streak > 0 ? `🔥 ${streak}日連続　` : "";
  el.dailyStatusInline.textContent = streakText + (daily ? `本日のベスト：${daily.score}点` : "本日はまだ未挑戦");
}

/* =========================================================
   苦手単語の集中特訓モード
   ミスが多かった単語だけを集めた特別なお題プールで練習できる。
   ========================================================= */

function loadMissStats() {
  try {
    return JSON.parse(safeGet(MISS_STATS_KEY)) || {};
  } catch (err) {
    return {};
  }
}

function recordWordMiss(word) {
  const stats = loadMissStats();
  stats[word] = (stats[word] || 0) + 1;
  safeSet(MISS_STATS_KEY, JSON.stringify(stats));
}

function buildWeakWordPool(limit) {
  const stats = loadMissStats();
  const allWords = [...EASY_WORDS, ...NORMAL_WORDS, ...HARD_WORDS, ...EXPERT_WORDS];
  const withMiss = allWords.filter((w) => stats[w.word] > 0);
  withMiss.sort((a, b) => (stats[b.word] || 0) - (stats[a.word] || 0));

  const pool = withMiss.slice(0, limit || WEAK_POOL_SIZE);

  // 苦手記録がまだ少ない場合は、ランダムな単語で埋めて最低限の数を確保する
  const minPoolSize = Math.min(10, allWords.length);
  if (pool.length < minPoolSize) {
    const existing = new Set(pool.map((w) => w.word));
    const shuffled = [...allWords].sort(() => Math.random() - 0.5);
    for (const w of shuffled) {
      if (pool.length >= minPoolSize) break;
      if (!existing.has(w.word)) {
        pool.push(w);
        existing.add(w.word);
      }
    }
  }
  return pool;
}

function refreshWeakButton() {
  const stats = loadMissStats();
  const count = Object.keys(stats).filter((w) => stats[w] > 0).length;
  el.weakStatusInline.textContent =
    count > 0 ? `ミスが多い${Math.min(count, WEAK_POOL_SIZE)}語で特訓` : "まだミスの記録がありません";
}

/* =========================================================
   ミュートボタン（audio.js の muted 変数と連動）
   ========================================================= */

function updateMuteBtn() {
  el.muteBtn.textContent = muted ? "🔇" : "🔊";
  el.muteBtn.setAttribute("aria-pressed", String(muted));
}

el.muteBtn.addEventListener("click", () => {
  muted = !muted;
  safeSet(MUTE_KEY, muted ? "1" : "0");
  updateMuteBtn();
});
updateMuteBtn();

function updateBgmBtn() {
  el.bgmBtn.classList.toggle("off", !bgmEnabled);
  el.bgmBtn.setAttribute("aria-pressed", String(bgmEnabled));
}

el.bgmBtn.addEventListener("click", () => {
  const next = !bgmEnabled;
  setBgmEnabled(next);
  updateBgmBtn();
  if (next && state && state.running) startBgm();
});
updateBgmBtn();

/* =========================================================
   ゲーム本体
   ========================================================= */

function buildCrowd() {
  el.crowd.innerHTML = "";
  el.crowd.classList.remove("wave");
  for (let i = 0; i < CROWD_SIZE; i++) {
    const p = document.createElement("div");
    p.className = "penlight";
    el.crowd.appendChild(p);
  }
}

function pickWord(excludeWord) {
  const pool = state.isDaily
    ? NORMAL_WORDS
    : state.isWeak
    ? state.weakPool
    : DIFFICULTIES[state.difficulty].words;
  const rand = (state.isDaily || state.isDuel) && state.rng ? state.rng : Math.random;
  let candidate;
  do {
    candidate = pool[Math.floor(rand() * pool.length)];
  } while (pool.length > 1 && candidate === excludeWord);
  return candidate;
}

function initState(difficulty, practice, isDaily, isWeak, isDuel, duelSeed) {
  return {
    running: false,
    difficulty,
    practice: !!practice,
    isDaily: !!isDaily,
    isWeak: !!isWeak,
    isDuel: !!isDuel,
    weakPool: isWeak ? buildWeakWordPool() : null,
    rng: isDaily
      ? mulberry32(hashSeedFromString(todayDateString()))
      : isDuel
      ? mulberry32(duelSeed)
      : null,
    timeLeft: GAME_SECONDS,
    score: 0,
    correctChars: 0,
    missChars: 0,
    hype: 0,
    hypeCelebrated: false,
    combo: 0,
    maxCombo: 0,
    usedKana: false,
    usedRomaji: false,
    current: null,
    isBonusWord: false,
    isBossWord: false,
    bossWordClearedThisRound: false,
    finalSpurt: false,
    scoreTrace: [],
    setlist: [],
    missedWords: {}, // { 単語: ミス回数 } その回でミスした単語ごとの回数
    startedAt: Date.now(), // 練習モードなど、タイマーが動かない場合の実測用
    wordStartedAt: Date.now(), // 「爆速シンガー」称号の判定用
    fastestWordMs: null,
    // ---- スキルシステム ----
    lastSkillMilestone: 0, // 直前にスキルチャージが発生したコンボの節目
    skillCharge: false,    // スキル発動ボタンを押せる状態か
    skillActive: null,     // "fever" が発動中なら文字列で入る
    skillActiveUntil: 0,
    missGuardCharges: 0,   // 🛡️ ミスガードの残り回数
    nextBonusBoost: 1,     // 💎 ダブルスコアの倍率（通常1）
    feverUsesThisRound: 0,
    // ---- ランダムイベント ----
    eventActive: null,     // "star" または "encore" が発動中なら文字列で入る
    eventActiveUntil: 0,
    eventFireAt: null,     // イベントを発生させる残り時間のしきい値（秒）
    eventFired: false,
    encoreUsed: false,     // アンコールモードはラウンド中1回だけ発動する
    hypeMaxCount: 0,       // 「プレイスタイル診断」のライブ力の指標に使う
    clutchThousand: false, // 💀 ギリギリの天才：残り3秒以内にスコア1000到達
    // ---- ミッション ----
    missions: [],
    // ---- バンド演奏（コンボで曲が豪華になる演出） ----
    bandLevel: 0,
    noMissWordStreak: 0,   // 直前のミスから何単語ノーミスで打てているか
    maxNoMissStreak: 0,
    encoreWordStreak: 0,   // 同じお題を連続で成功させた回数（「アンコール！」称号用）
    // ---- 対戦の妨害（オンラインのみ） ----
    sabotagesSentThisMatch: 0,
    shakeUntil: 0,
    typed: "",       // ローマ字入力の進捗
    typedKana: "",   // かな入力の進捗
    litCount: 0,
    timerId: null,
  };
}

function renderPrompt() {
  const { current, typed, typedKana } = state;
  el.promptWord.textContent = current.word;
  el.miniPromptWord.textContent = current.word;

  el.prompter.classList.toggle("bonus-word", state.isBonusWord);
  el.bonusWordTag.hidden = !state.isBonusWord;
  el.prompter.classList.toggle("boss-word", state.isBossWord);
  el.bossWordTag.hidden = !state.isBossWord;

  const kanaAnswer = current.kana;
  const doneK = kanaAnswer.slice(0, typedKana.length);
  const nextK = kanaAnswer.slice(typedKana.length, typedKana.length + 1);
  const restK = kanaAnswer.slice(typedKana.length + 1);
  const kanaHtml =
    `<span class="romaji-done">${doneK}</span>` +
    `<span class="romaji-next">${nextK}</span>` +
    `<span class="romaji-rest">${restK}</span>`;
  el.promptKana.innerHTML = kanaHtml;
  el.miniPromptKana.innerHTML = kanaHtml;

  const answer = current.romaji[0];
  const done = answer.slice(0, typed.length);
  const next = answer.slice(typed.length, typed.length + 1);
  const rest = answer.slice(typed.length + 1);
  const romajiHtml =
    `<span class="romaji-done">${done}</span>` +
    `<span class="romaji-next">${next}</span>` +
    `<span class="romaji-rest">${rest}</span>`;
  el.promptRomaji.innerHTML = romajiHtml;
  el.miniPromptRomaji.innerHTML = romajiHtml;
}

function nextWord() {
  state.current = pickWord(state.current);
  state.typed = "";
  state.typedKana = "";
  state.wordStartedAt = Date.now();
  // デイリー・対戦モードは公平性のため、レアお題の抽選をしない
  const eligibleForRareWord = !state.isDaily && !state.isDuel;
  state.isBossWord = eligibleForRareWord && Math.random() < BOSS_WORD_CHANCE;
  state.isBonusWord = !state.isBossWord && eligibleForRareWord && Math.random() < BONUS_WORD_CHANCE;
  renderPrompt();
}

function comboMultiplier(combo) {
  const tier = COMBO_TIERS.find((t) => combo >= t.min);
  return tier ? tier.mult : 1.0;
}

function getScoreMultiplier() {
  const feverMult = state.skillActive === "fever" ? FEVER_MULT : 1;
  const eventMult = (state.eventActive === "star" || state.eventActive === "encore") ? STAR_TIME_MULT : 1;
  const bossMult = state.isBossWord ? BOSS_WORD_MULT : 1;
  return comboMultiplier(state.combo) * (state.finalSpurt ? FINAL_SPURT_MULT : 1) * feverMult * eventMult * bossMult;
}

function updateHud() {
  el.scoreValue.textContent = state.score;
  if (state.practice) {
    el.timeValue.textContent = "∞";
    el.timeValue.classList.remove("time-warn");
  } else {
    el.timeValue.textContent = state.timeLeft;
    el.timeValue.classList.toggle("time-warn", state.timeLeft <= 10);
  }
  el.hypeFill.style.width = `${state.hype}%`;
  el.hypeFill.classList.toggle("maxed", state.hype >= 100);
  updateAudienceStage();

  const mult = comboMultiplier(state.combo);
  if (state.combo >= 3) {
    el.comboValue.hidden = false;
    el.comboValue.textContent = `combo ${state.combo} (x${mult})`;
    el.comboValue.classList.toggle("boosted", mult > 1);
  } else {
    el.comboValue.hidden = true;
  }

  updateGhostDiff();
}

// 客席の盛り上がり具合をHYPEゲージ5段階で見た目に反映する
function updateAudienceStage() {
  const stage = state.hype >= 80 ? 5 : state.hype >= 60 ? 4 : state.hype >= 40 ? 3 : state.hype >= 20 ? 2 : 1;
  el.stage.dataset.audience = String(stage);
}

// コンボの節目ごとに客席の反応（絵文字）を一瞬表示する
function showCrowdReaction(combo) {
  let emoji = "👏";
  if (combo >= 20) emoji = "🌈";
  else if (combo >= 10) emoji = "🔥";
  else if (combo >= 5) emoji = "🙌";
  else return; // 4以下は演出なし（毎回出ると鬱陶しいため）

  el.reactionPopup.textContent = emoji;
  el.reactionPopup.classList.remove("show");
  void el.reactionPopup.offsetWidth;
  el.reactionPopup.classList.add("show");
}

let lastGhostSign = 0; // -1:負け越し中 / 0:互角 / 1:勝ち越し中（ラウンドごとにリセットする）

function showGhostToast(text) {
  el.reactionPopup.textContent = text;
  el.reactionPopup.classList.remove("show", "toast");
  void el.reactionPopup.offsetWidth;
  el.reactionPopup.classList.add("show", "toast");
}

function updateGhostDiff() {
  if (state.practice || state.isDaily || state.isWeak || state.isDuel) {
    el.ghostDiff.hidden = true;
    return;
  }
  const bestTrace = getBestTrace(state.difficulty);
  const idx = state.scoreTrace.length - 1;
  if (!bestTrace || idx < 0 || bestTrace.trace[idx] === undefined) {
    el.ghostDiff.hidden = true;
    return;
  }
  const diff = state.score - bestTrace.trace[idx];
  el.ghostDiff.hidden = false;
  el.ghostDiff.textContent = diff >= 0 ? `▲ ベストより+${diff}` : `▼ ベストより${diff}`;
  el.ghostDiff.classList.toggle("ahead", diff >= 0);
  el.ghostDiff.classList.toggle("behind", diff < 0);

  const sign = diff > 0 ? 1 : diff < 0 ? -1 : 0;
  if (sign !== lastGhostSign) {
    if (lastGhostSign === -1 && sign === 1) showGhostToast("👑 追い抜いた！");
    else if (lastGhostSign === -1 && sign === 0) showGhostToast("⚡ 追いついた！");
    else if (lastGhostSign === 1 && sign <= 0) showGhostToast("😱 抜かれた！");
    lastGhostSign = sign;
  }
}

function getUnlockedPenlightColors() {
  const unlocked = new Set(loadUnlockedTitles());
  const colors = ["--gold", "--pink", "--cyan"];
  if (unlocked.has("expert_clear")) colors.push("--purple");
  if (unlocked.has("daily_clear")) colors.push("--mint");
  if (unlocked.has("kana_master")) colors.push("--violet");
  return colors;
}

function lightNextPenlight() {
  const lights = el.crowd.children;
  if (lights.length === 0) return;
  state.litCount = (state.litCount + 1) % lights.length;
  const target = lights[state.litCount];
  target.classList.remove("rainbow");

  const unlocked = new Set(loadUnlockedTitles());
  if (unlocked.has("combo_king") && Math.random() < 0.12) {
    target.classList.add("rainbow");
  } else {
    const colors = getUnlockedPenlightColors();
    const color = colors[Math.floor(Math.random() * colors.length)];
    target.style.setProperty("--glow", `var(${color})`);
  }
  target.classList.add("lit");
}

function flashMiss() {
  el.mic.classList.remove("miss");
  void el.mic.offsetWidth; // reflow で再アニメーションさせる
  el.mic.classList.add("miss");
}

function burstSpotlight() {
  el.spotlight.classList.remove("burst");
  void el.spotlight.offsetWidth;
  el.spotlight.classList.add("burst");
}

function triggerEncoreMode() {
  state.encoreUsed = true;
  state.timeLeft += ENCORE_TIME_BONUS;
  state.eventActive = "encore";
  state.eventActiveUntil = Date.now() + ENCORE_DURATION_MS;
  el.stage.classList.add("encore");
  updateHud();
  setTimeout(() => {
    if (state && state.eventActive === "encore") {
      state.eventActive = null;
      el.stage.classList.remove("encore");
    }
  }, ENCORE_DURATION_MS);
}

function celebrateHypeMax() {
  const isMiracle = state.combo >= 8;
  state.hypeMaxCount += 1;

  // 初めてHYPEが満タンになった時だけ、アンコールモード（+10秒・2倍・観客総立ち）を発動する
  // 対戦モードでは公平性のため発動しない
  const canEncore = !state.encoreUsed && !state.isDuel;
  if (canEncore) triggerEncoreMode();

  el.crowd.classList.add("wave");
  if (isMiracle || canEncore) {
    Array.from(el.crowd.children).forEach((p) => p.classList.add("rainbow"));
  }

  el.hypeBanner.textContent = canEncore ? "🔥 ENCORE!! +10秒" : isMiracle ? "奇跡の瞬間！" : "熱狂の渦！";
  el.hypeBanner.classList.remove("show");
  void el.hypeBanner.offsetWidth;
  el.hypeBanner.classList.add("show");

  if (canEncore || isMiracle) {
    sfxMiracle();
    vibrate([40, 60, 40, 60, 40, 60, 200]);
  } else {
    sfxHypeMax();
    vibrate([40, 60, 40, 60, 120]);
  }

  setTimeout(() => {
    el.crowd.classList.remove("wave");
    if (isMiracle || canEncore) {
      Array.from(el.crowd.children).forEach((p) => p.classList.remove("rainbow"));
    }
  }, 1400);
}

function isAnswerMatch(typed, romajiOptions) {
  return romajiOptions.some((r) => r === typed);
}

function isPrefixOfAny(typed, romajiOptions) {
  return romajiOptions.some((r) => r.startsWith(typed));
}

function isRomajiChar(ch) {
  return /^[a-zA-Z-]$/.test(ch);
}

function isHiraganaChar(ch) {
  return /^[\u3041-\u309F\u30FC]$/.test(ch);
}

function onCorrectKeystroke() {
  const cfg = DIFFICULTIES[state.difficulty];
  const mult = getScoreMultiplier();
  state.correctChars += 1;
  state.score += Math.round(10 * mult);
  state.hype = Math.min(100, state.hype + cfg.correctHype);
  lightNextPenlight();
  sfxCorrect();
  vibrate(12);

  if (state.hype >= 100 && !state.hypeCelebrated) {
    state.hypeCelebrated = true;
    celebrateHypeMax();
  }
}

function onMissKeystroke() {
  const cfg = DIFFICULTIES[state.difficulty];

  // 🛡️ ミスガードのスキルが発動中なら、このミスを無効化する
  if (state.missGuardCharges > 0) {
    state.missGuardCharges -= 1;
    showGhostToast("🛡️ ガード！");
    sfxCorrect();
    return;
  }

  state.missChars += 1;
  state.combo = 0;
  state.noMissWordStreak = 0;
  updateBandLevel();
  state.hype = Math.max(0, state.hype - cfg.missPenalty);
  if (state.hype < 100) state.hypeCelebrated = false;
  if (state.current) {
    recordWordMiss(state.current.word); // 累計の苦手記録（苦手克服モード用）
    state.missedWords[state.current.word] = (state.missedWords[state.current.word] || 0) + 1; // 今回のラウンドだけの記録
  }
  flashMiss();
  sfxMiss();
  vibrate([25, 40, 25]);
}

/* =========================================================
   バンド演奏（コンボが伸びるほど曲が豪華になる演出）
   ========================================================= */

function getBandLevel(combo) {
  return Math.min(4, Math.floor(combo / BAND_LEVEL_STEP));
}

function updateBandLevel() {
  const level = getBandLevel(state.combo);
  if (level === state.bandLevel) return;
  const reachedFullLive = level >= 4 && state.bandLevel < 4;
  state.bandLevel = level;

  if (el.bandRow) {
    el.bandRow.querySelectorAll(".band-icon").forEach((icon) => {
      icon.classList.toggle("active", Number(icon.dataset.level) <= level);
    });
  }
  if (typeof setBgmComboLevel === "function") setBgmComboLevel(level);

  if (reachedFullLive) {
    el.hypeBanner.textContent = "🎶 FULL LIVE!!";
    el.hypeBanner.classList.remove("show");
    void el.hypeBanner.offsetWidth;
    el.hypeBanner.classList.add("show");
    sfxMiracle();
  }
}

/* =========================================================
   スキルシステム（フィーバー / ミスガード / ダブルスコア）
   コンボが10の倍数に到達するたびに1回チャージされ、
   ボタンを押すとランダムに1つ発動する。
   ========================================================= */

const SKILL_TYPES = ["fever", "guard", "double"];

function checkSkillCharge() {
  const milestone = Math.floor(state.combo / SKILL_COMBO_STEP) * SKILL_COMBO_STEP;
  if (milestone > 0 && milestone > state.lastSkillMilestone) {
    state.lastSkillMilestone = milestone;
    if (!state.skillCharge) {
      state.skillCharge = true;
      el.skillBtn.hidden = false;
      el.skillBtn.classList.add("ready");
    }
  }
}

function activateSkill() {
  if (!state || !state.running || !state.skillCharge) return;
  state.skillCharge = false;
  el.skillBtn.hidden = true;
  el.skillBtn.classList.remove("ready");

  const kind = SKILL_TYPES[Math.floor(Math.random() * SKILL_TYPES.length)];
  if (kind === "fever") {
    state.skillActive = "fever";
    state.skillActiveUntil = Date.now() + FEVER_DURATION_MS;
    state.feverUsesThisRound += 1;
    el.stage.classList.add("fever");
    showGhostToast("🔥 フィーバー発動！");
    setTimeout(() => {
      if (state && state.skillActive === "fever") {
        state.skillActive = null;
        el.stage.classList.remove("fever");
      }
    }, FEVER_DURATION_MS);
  } else if (kind === "guard") {
    state.missGuardCharges += 1;
    showGhostToast("🛡️ ミスガード獲得！");
  } else {
    state.nextBonusBoost = 2;
    showGhostToast("💎 次のボーナスワードが2倍！");
  }
  sfxHypeMax();
}

if (el.skillBtn) {
  el.skillBtn.addEventListener("click", activateSkill);
}

function showBossBreakBanner() {
  el.hypeBanner.textContent = "BOSS BREAK!!";
  el.hypeBanner.classList.remove("show");
  void el.hypeBanner.offsetWidth;
  el.hypeBanner.classList.add("show");
  sfxMiracle();
  vibrate([50, 80, 50, 80, 200]);
}

function onWordComplete() {
  const mult = getScoreMultiplier();
  state.combo += 1;
  state.maxCombo = Math.max(state.maxCombo, state.combo);
  updateBandLevel();

  state.noMissWordStreak += 1;
  state.maxNoMissStreak = Math.max(state.maxNoMissStreak, state.noMissWordStreak);

  // 「アンコール！」称号用：同じお題を連続で成功させたかどうか
  const prevEntry = state.setlist[state.setlist.length - 1];
  state.encoreWordStreak = prevEntry && prevEntry.word === state.current.word ? state.encoreWordStreak + 1 : 0;

  const wordTimeMs = Date.now() - state.wordStartedAt;
  if (state.fastestWordMs === null || wordTimeMs < state.fastestWordMs) {
    state.fastestWordMs = wordTimeMs;
  }

  let points = Math.round(20 * mult);
  const wasBonus = state.isBonusWord;
  const wasBoss = state.isBossWord;
  if (wasBonus) {
    points *= 2 * state.nextBonusBoost;
    state.nextBonusBoost = 1;
    state.hype = 100;
  }
  if (wasBoss) {
    state.bossWordClearedThisRound = true;
    showBossBreakBanner();
  }

  // 💀 ギリギリの天才：残り3秒以内にスコア1000到達
  if (!state.practice && !state.clutchThousand && state.timeLeft <= 3 && state.score + points >= 1000) {
    state.clutchThousand = true;
  }

  state.score += points;
  state.setlist.push({ word: state.current.word, bonus: wasBonus, boss: wasBoss });

  burstSpotlight();
  sfxWordComplete();
  vibrate(30);
  showCrowdReaction(state.combo);
  checkSkillCharge();

  // オンライン対戦中は、コンボの節目で相手に軽い妨害を送れる（1試合2回まで）
  if (
    state.isDuel &&
    typeof onlineActive !== "undefined" &&
    onlineActive &&
    state.combo > 0 &&
    state.combo % SKILL_COMBO_STEP === 0 &&
    state.sabotagesSentThisMatch < SABOTAGE_MAX_PER_MATCH &&
    typeof sendSabotage === "function"
  ) {
    state.sabotagesSentThisMatch += 1;
    sendSabotage();
  }

  if (wasBonus && state.hype >= 100 && !state.hypeCelebrated) {
    state.hypeCelebrated = true;
    celebrateHypeMax();
  }

  nextWord();
}

function handleKanaInput(rawChar) {
  state.usedKana = true;
  const attempt = state.typedKana + rawChar;
  const kanaAnswer = state.current.kana;

  if (kanaAnswer.startsWith(attempt)) {
    state.typedKana = attempt;
    onCorrectKeystroke();
    renderPrompt();
    updateHud();
    if (attempt === kanaAnswer) onWordComplete();
  } else {
    onMissKeystroke();
    updateHud();
  }
}

function handleRomajiInput(key) {
  state.usedRomaji = true;
  const attempt = state.typed + key;
  const { romaji } = state.current;

  if (isPrefixOfAny(attempt, romaji)) {
    state.typed = attempt;
    onCorrectKeystroke();
    renderPrompt();
    updateHud();
    if (isAnswerMatch(state.typed, romaji)) onWordComplete();
  } else {
    onMissKeystroke();
    updateHud();
  }
}

function handleKeydown(e) {
  if (e.key.length !== 1 || !isRomajiChar(e.key)) return;
  typeChar(e.key);
}

function typeChar(rawKey) {
  if (!state || !state.running) return;

  if (isHiraganaChar(rawKey)) {
    handleKanaInput(rawKey);
  } else if (isRomajiChar(rawKey)) {
    handleRomajiInput(rawKey.toLowerCase());
  }
  // それ以外の文字（絵文字、記号、変換候補の確定前文字など）は無視
}

function triggerFinalSpurt() {
  state.finalSpurt = true;
  el.stage.classList.add("final-spurt");
  setBgmFast(true);
  sfxTick();
}

function clearFinalSpurt() {
  el.stage.classList.remove("final-spurt");
  setBgmFast(false);
}

function triggerStarTime() {
  state.eventActive = "star";
  state.eventActiveUntil = Date.now() + STAR_TIME_DURATION_MS;
  el.stage.classList.add("star-time");
  showGhostToast("🌟 STAR TIME！スコア2倍！");
  sfxHypeMax();
  setTimeout(() => {
    if (state && state.eventActive === "star") {
      state.eventActive = null;
      el.stage.classList.remove("star-time");
    }
  }, STAR_TIME_DURATION_MS);
}

function clearRoundEffects() {
  el.stage.classList.remove("fever", "star-time", "shake");
  if (el.skillBtn) {
    el.skillBtn.hidden = true;
    el.skillBtn.classList.remove("ready");
  }
}

// オンライン対戦で相手からの妨害を受けた時の演出（online.js から呼ばれる）
function triggerSabotageEffect() {
  el.stage.classList.remove("shake");
  void el.stage.offsetWidth;
  el.stage.classList.add("shake");
  showGhostToast("🌪️ 妨害された！");
  vibrate([30, 50, 30, 50, 30]);
  setTimeout(() => el.stage.classList.remove("shake"), 700);
}

function tick() {
  if (state.practice) return; // 練習モードはタイマー無し
  state.timeLeft -= 1;
  state.scoreTrace.push(state.score);

  if (!state.finalSpurt && state.timeLeft > 0 && state.timeLeft <= FINAL_SPURT_THRESHOLD) {
    triggerFinalSpurt();
  }

  // ランダムイベント（🌟 STAR TIME）：ラウンドに1回だけ、狙った時間帯で発生させる
  if (
    !state.eventFired &&
    state.eventFireAt !== null &&
    state.timeLeft <= state.eventFireAt &&
    state.timeLeft > FINAL_SPURT_THRESHOLD
  ) {
    state.eventFired = true;
    triggerStarTime();
  }

  updateHud();
  if (state.timeLeft <= 3 && state.timeLeft > 0) sfxTick();
  if (state.timeLeft <= 0) endGame();
}

function rankFor(score) {
  if (score >= 1400) return "伝説のボーカリスト";
  if (score >= 900) return "ライブの主役";
  if (score >= 500) return "頼れるバンドマン";
  if (score >= 200) return "見習いシンガー";
  return "路上ライブ初日";
}

/* =========================================================
   ミッション（3つのお題を毎回ランダムに出す）
   スコアアタックの通常プレイのみが対象（デイリー・苦手克服・対戦は除外）。
   ========================================================= */

function buildMissionPool(difficulty) {
  const scoreTargets = { easy: 150, normal: 300, hard: 500, expert: 700 };
  const scoreTarget = scoreTargets[difficulty] || 300;
  return [
    {
      id: "score",
      label: `${scoreTarget}点以上とる`,
      check: (s) => s.score >= scoreTarget,
    },
    {
      id: "combo",
      label: "8コンボ以上つなげる",
      check: (s) => s.maxCombo >= 8,
    },
    {
      id: "bonus",
      label: "ボーナスワードを2回成功させる",
      check: (s) => s.setlist.filter((e) => e.bonus).length >= 2,
    },
    {
      id: "lowmiss",
      label: "ミスを3回以下におさえる",
      check: (s) => s.missChars <= 3,
    },
  ];
}

function generateMissions(difficulty) {
  const pool = buildMissionPool(difficulty);
  // シャッフルして3つ選ぶ
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).map((m) => ({ id: m.id, label: m.label, check: m.check, cleared: false }));
}

let pendingMissions = null; // カウントダウン中に表示するミッション（開始直後にお題と被らせないため先に用意しておく）

function startGame(isDaily, isWeak, isDuel, duelSeed) {
  ensureAudio();
  const practice = (isDaily || isWeak || isDuel) ? false : !!(el.practiceToggle && el.practiceToggle.checked);
  // 対戦難易度は、ローカル対戦なら local2pMatch から、オンライン対戦なら
  // scheduleOnlineStart が事前にセットした selectedDifficulty から取る。
  const difficulty = (isDaily || isWeak) ? "normal" : (isDuel && local2pMatch) ? local2pMatch.difficulty : selectedDifficulty;
  state = initState(difficulty, practice, isDaily, isWeak, isDuel, duelSeed);
  state.running = true;

  // ミッション・ランダムイベントは、通常のスコアアタック（練習・デイリー・苦手克服・対戦以外）だけが対象
  const isStandardRun = !practice && !isDaily && !isWeak && !isDuel;
  if (isStandardRun) {
    // カウントダウン中にすでに表示済みのミッションがあればそれを使い、無ければここで生成する
    // （ローカル/オンライン対戦の合間の再戦などでも安全に動くようにするため）
    state.missions = pendingMissions || generateMissions(difficulty);
    state.eventFireAt = FINAL_SPURT_THRESHOLD + 5 + Math.floor(Math.random() * (GAME_SECONDS - FINAL_SPURT_THRESHOLD - 20));
  }
  pendingMissions = null;

  lastGhostSign = 0;
  if (el.bandRow) {
    el.bandRow.querySelectorAll(".band-icon").forEach((icon) => icon.classList.remove("active"));
  }
  if (typeof setBgmComboLevel === "function") setBgmComboLevel(0);
  buildCrowd();
  nextWord();
  updateHud();
  el.startOverlay.hidden = true;
  el.resultOverlay.hidden = true;
  el.pauseOverlay.hidden = true;
  el.hypeBanner.classList.remove("show");
  el.stage.classList.remove("final-spurt");
  el.stage.classList.remove("encore");
  el.prompter.classList.remove("bonus-word", "boss-word");
  clearRoundEffects();
  const isOnlineRound = typeof onlineActive !== "undefined" && onlineActive;
  el.duelPlayerBadge.hidden = !isDuel || isOnlineRound;
  if (isDuel && !isOnlineRound) {
    el.duelPlayerBadge.textContent = duelPendingPlayer === 1 ? "🎤 プレイヤー1" : "🎤 プレイヤー2";
  }
  el.kbdArea.hidden = false; // プレイ中だけキーボードエリアを表示する
  el.stage.classList.add("compact"); // プレイ中はステージを小さくしてキーボードのスペースを確保する
  state.timerId = setInterval(tick, 1000);
  startBgm();

  // 「端末のキーボード」モードならゲーム開始と同時にフォーカスして開く
  if (nativeInput && !nativeInput.hidden) {
    nativeInput.focus();
  }
}

function runCountdown(onDone, missions) {
  el.startOverlay.hidden = true;
  el.resultOverlay.hidden = true;
  el.pauseOverlay.hidden = true;
  el.duelIntroOverlay.hidden = true;
  el.duelResultOverlay.hidden = true;
  el.countdownOverlay.hidden = false;

  // ミッションは「お題が出る前」のこのタイミングでだけ表示する（お題と被らないように）
  if (missions && missions.length > 0 && el.countdownMissionsList) {
    el.countdownMissions.hidden = false;
    el.countdownMissionsList.innerHTML = missions.map((m) => `<li>${m.label}</li>`).join("");
  } else if (el.countdownMissions) {
    el.countdownMissions.hidden = true;
  }

  let n = 3;
  const showNum = () => {
    el.countdownNum.textContent = n;
    el.countdownNum.classList.remove("pulse");
    void el.countdownNum.offsetWidth;
    el.countdownNum.classList.add("pulse");
    sfxTick();
  };
  showNum();

  const iv = setInterval(() => {
    n -= 1;
    if (n > 0) {
      showNum();
    } else {
      clearInterval(iv);
      el.countdownOverlay.hidden = true;
      onDone();
    }
  }, 800);
}

function beginWithCountdown(isDaily, isWeak) {
  ensureAudio();
  const practice = (isDaily || isWeak) ? false : !!(el.practiceToggle && el.practiceToggle.checked);
  const difficulty = (isDaily || isWeak) ? "normal" : selectedDifficulty;
  const isStandardRun = !practice && !isDaily && !isWeak;
  pendingMissions = isStandardRun ? generateMissions(difficulty) : null;
  runCountdown(() => startGame(isDaily, isWeak), pendingMissions);
}

function renderNewTitles(newTitles) {
  if (!newTitles || newTitles.length === 0) {
    el.newTitles.hidden = true;
    el.newTitles.innerHTML = "";
    return;
  }
  el.newTitles.hidden = false;
  el.newTitles.innerHTML =
    `<p class="new-titles-heading">🎉 新しい称号を獲得！</p>` +
    newTitles.map((t) => `<span class="new-title-badge">${t.name}</span>`).join("");
}

function renderTrendChart() {
  const history = loadRunHistory()
    .filter((h) => !h.practice)
    .slice(-8);

  if (history.length < 2) {
    el.trendWrap.hidden = true;
    return;
  }
  el.trendWrap.hidden = false;

  const canvas = el.trendCanvas;
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const scores = history.map((r) => r.score);
  const max = Math.max(...scores, 1);
  const min = Math.min(...scores, 0);
  const range = Math.max(max - min, 1);
  const padding = 10;
  const stepX = scores.length > 1 ? (w - padding * 2) / (scores.length - 1) : 0;
  const toY = (s) => h - padding - ((s - min) / range) * (h - padding * 2);

  ctx.strokeStyle = "#ffd166";
  ctx.lineWidth = 2;
  ctx.beginPath();
  scores.forEach((s, i) => {
    const x = padding + i * stepX;
    const y = toY(s);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  scores.forEach((s, i) => {
    const x = padding + i * stepX;
    const y = toY(s);
    const isLast = i === scores.length - 1;
    ctx.fillStyle = isLast ? "#ff6fa5" : "#6fd9ff";
    ctx.beginPath();
    ctx.arc(x, y, isLast ? 4 : 3, 0, Math.PI * 2);
    ctx.fill();
  });
}

function renderSetlist() {
  if (!state.setlist || state.setlist.length === 0) {
    el.setlistWrap.hidden = true;
    return;
  }
  el.setlistWrap.hidden = false;
  el.setlistList.innerHTML = state.setlist
    .map((entry) => `<span class="setlist-tag${entry.bonus ? " bonus" : ""}">${entry.word}</span>`)
    .join("");
}

function renderMissedWords() {
  const entries = Object.entries(state.missedWords || {});
  if (entries.length === 0) {
    el.missedWrap.hidden = true;
    return;
  }
  el.missedWrap.hidden = false;
  entries.sort((a, b) => b[1] - a[1]); // ミスが多い順
  el.missedList.innerHTML = entries
    .map(([word, count]) => `<span class="setlist-tag miss">${word} ×${count}</span>`)
    .join("");
}

function calcElapsedSeconds() {
  if (state.practice) {
    return Math.max(1, Math.round((Date.now() - state.startedAt) / 1000));
  }
  return Math.max(1, GAME_SECONDS - state.timeLeft);
}

function finishDuelRound() {
  const result = {
    score: state.score,
    correct: state.correctChars,
    miss: state.missChars,
  };
  el.kbdArea.hidden = true;
  el.stage.classList.remove("compact");
  el.stage.classList.remove("final-spurt");
  el.duelPlayerBadge.hidden = true;

  if (duelPendingPlayer === 1) {
    local2pMatch.p1 = result;
    showDuelIntro(2);
  } else {
    local2pMatch.p2 = result;
    showDuelFinalResult();
  }
}

function showDuelFinalResult() {
  const p1 = local2pMatch.p1;
  const p2 = local2pMatch.p2;

  el.duelP1Score.textContent = p1.score;
  el.duelP1Sub.textContent = `正打${p1.correct} / ミス${p1.miss}`;
  el.duelP2Score.textContent = p2.score;
  el.duelP2Sub.textContent = `正打${p2.correct} / ミス${p2.miss}`;
  el.duelP1Card.classList.toggle("winner", p1.score > p2.score);
  el.duelP2Card.classList.toggle("winner", p2.score > p1.score);

  if (p1.score === p2.score) {
    el.duelWinnerTitle.textContent = "🤝 引き分け！";
  } else {
    el.duelWinnerTitle.textContent = p1.score > p2.score ? "🎉 プレイヤー1の勝ち！" : "🎉 プレイヤー2の勝ち！";
  }

  el.duelIntroOverlay.hidden = true;
  el.duelResultOverlay.hidden = false;
}

function evaluateMissions() {
  if (!state.missions || state.missions.length === 0) return { missions: [], allCleared: false };
  const missions = state.missions.map((m) => ({ label: m.label, cleared: m.check(state) }));
  const allCleared = missions.length > 0 && missions.every((m) => m.cleared);
  return { missions, allCleared };
}

function renderMissionResult(missionInfo) {
  if (!missionInfo.missions || missionInfo.missions.length === 0) {
    el.missionResultWrap.hidden = true;
    el.missionBonusNote.hidden = true;
    return;
  }
  el.missionResultWrap.hidden = false;
  el.missionResultList.innerHTML = missionInfo.missions
    .map((m) => `<li class="${m.cleared ? "cleared" : ""}">${m.cleared ? "✅" : "❌"} ${m.label}</li>`)
    .join("");
  el.missionBonusNote.hidden = !missionInfo.allCleared;
}

function renderGrowthComparison(prevRun, ctx, acc) {
  if (!prevRun) {
    el.growthWrap.hidden = true;
    return;
  }
  el.growthWrap.hidden = false;
  const prevTotal = prevRun.correctChars + prevRun.missChars;
  const prevAcc = prevTotal === 0 ? 0 : Math.round((prevRun.correctChars / prevTotal) * 100);

  const rows = [
    { label: "スコア", prev: prevRun.score, now: ctx.score },
    { label: "最高コンボ", prev: prevRun.maxCombo || 0, now: ctx.maxCombo },
    { label: "正答率", prev: prevAcc, now: acc, unit: "%" },
  ];

  el.growthList.innerHTML = rows
    .map((r) => {
      const diff = r.now - r.prev;
      const arrow = diff > 0 ? "↑" : diff < 0 ? "↓" : "→";
      const cls = diff > 0 ? "up" : diff < 0 ? "down" : "same";
      const unit = r.unit || "";
      return (
        `<li class="${cls}">${r.label}　${r.prev}${unit} → ${r.now}${unit} ${arrow}</li>`
      );
    })
    .join("");
}

/* =========================================================
   プレイスタイル診断（結果画面に表示する）
   ========================================================= */

function starsFor(value, thresholds) {
  let stars = 1;
  thresholds.forEach((t) => {
    if (value >= t) stars += 1;
  });
  return Math.min(5, stars);
}

function starString(n) {
  return "★".repeat(n) + "☆".repeat(5 - n);
}

function computeDiagnosis(ctx, charsPerMinute, acc) {
  const speedStars = starsFor(charsPerMinute, [60, 100, 150, 220]);
  const accuracyStars = starsFor(acc, [70, 80, 90, 97]);
  const comboStars = starsFor(ctx.maxCombo, [5, 10, 20, 35]);
  const liveStars = starsFor((state.hypeMaxCount || 0) + (state.feverUsesThisRound || 0), [1, 2, 3, 5]);

  const candidates = [
    { key: "speed", stars: speedStars, emoji: "⚡", label: "スピードスター" },
    { key: "accuracy", stars: accuracyStars, emoji: "💎", label: "パーフェクトタイプ" },
    { key: "combo", stars: comboStars, emoji: "👑", label: "コンボ職人" },
    { key: "live", stars: liveStars, emoji: "🔥", label: "HYPEメーカー" },
  ];
  const top = candidates.reduce((best, c) => (c.stars > best.stars ? c : best), candidates[0]);

  return {
    emoji: top.emoji,
    label: top.label,
    rows: [
      { label: "スピード", stars: speedStars },
      { label: "正確性", stars: accuracyStars },
      { label: "コンボ", stars: comboStars },
      { label: "ライブ力", stars: liveStars },
    ],
  };
}

function renderDiagnosis(ctx, charsPerMinute, acc) {
  if (!el.diagnosisWrap) return;
  if (ctx.practice) {
    el.diagnosisWrap.hidden = true;
    return;
  }
  const diagnosis = computeDiagnosis(ctx, charsPerMinute, acc);
  el.diagnosisWrap.hidden = false;
  el.diagnosisType.textContent = `${diagnosis.emoji} あなたのライブスタイルは……${diagnosis.label}`;
  el.diagnosisStats.innerHTML = diagnosis.rows
    .map((r) => `<li><span>${r.label}</span><span class="stars">${starString(r.stars)}</span></li>`)
    .join("");
}

function endGame() {
  state.running = false;
  clearInterval(state.timerId);
  stopBgm();
  clearFinalSpurt();
  clearRoundEffects();

  if (typeof onlineActive !== "undefined" && onlineActive) {
    finishOnlineRound();
    return;
  }

  if (state.isDuel) {
    finishDuelRound();
    return;
  }

  const isStandardRun = !state.practice && !state.isDaily && !state.isWeak;

  // ミッション（3つ全部クリアで追加ボーナス）を先に判定してからスコアに反映する
  const missionInfo = isStandardRun ? evaluateMissions() : { missions: [], allCleared: false };
  if (missionInfo.allCleared) {
    state.score = Math.round(state.score * (1 + MISSION_BONUS_RATE));
  }

  // ノーミスならパーフェクトボーナスとしてスコアを+20%する（練習モードは対象外）
  let perfectBonus = false;
  if (!state.practice && state.missChars === 0 && state.correctChars > 0) {
    state.score = Math.round(state.score * (1 + PERFECT_BONUS_RATE));
    perfectBonus = true;
  }

  const totalChars = state.correctChars + state.missChars;
  const acc = totalChars === 0 ? 0 : Math.round((state.correctChars / totalChars) * 100);
  const elapsedSec = calcElapsedSeconds();
  const charsPerMinute = Math.round((state.correctChars / elapsedSec) * 60);

  // 前回の同条件のプレイと比較するため、記録する前に履歴から拾っておく
  const prevRun = isStandardRun
    ? loadRunHistory()
        .filter((h) => !h.practice && !h.isDaily && !h.isWeak && !h.isDuel && h.difficulty === state.difficulty)
        .slice(-1)[0] || null
    : null;

  const ctx = {
    score: state.score,
    correctChars: state.correctChars,
    missChars: state.missChars,
    difficulty: state.difficulty,
    practice: state.practice,
    isDaily: state.isDaily,
    isWeak: state.isWeak,
    maxCombo: state.maxCombo,
    usedKana: state.usedKana,
    usedRomaji: state.usedRomaji,
    bossWordCleared: state.bossWordClearedThisRound,
    fastestWordMs: state.fastestWordMs,
    feverUsesThisRound: state.feverUsesThisRound,
    maxNoMissStreak: state.maxNoMissStreak,
    encoreWordStreak: state.encoreWordStreak,
    clutchThousand: state.clutchThousand,
    hour: new Date().getHours(),
    date: new Date().toISOString(),
  };

  recordRun(ctx);

  // 記録した直後のローカルランキングで1位になっていれば称号の対象にする
  const top = getLocalRanking(1)[0];
  ctx.isRankingFirst = !state.practice && !!top && top.date === ctx.date && top.score === ctx.score;

  renderTrendChart();
  renderSetlist();
  renderMissedWords();
  renderGrowthComparison(prevRun, ctx, acc);
  renderMissionResult(missionInfo);
  renderDiagnosis(ctx, charsPerMinute, acc);
  const newTitles = evaluateTitles(ctx);

  el.perfectBonusNote.hidden = !perfectBonus;

  if (state.practice) {
    el.resultRank.textContent = "練習おつかれさまでした！";
    el.resultBest.textContent = "練習モードのためスコアは記録されません";
  } else if (state.isDaily) {
    const daily = getTodayDaily();
    el.resultRank.textContent = `${rankFor(state.score)}（本日のステージ）`;
    el.resultBest.textContent = `本日のベスト：${daily ? daily.score : state.score}`;
  } else if (state.isWeak) {
    el.resultRank.textContent = `${rankFor(state.score)}（苦手克服モード）`;
    el.resultBest.textContent = "苦手克服モードは自己ベストの記録対象外です";
  } else {
    const { isNew, best } = saveBestScoreIfHigher(state.difficulty, state.score);
    el.resultRank.textContent = rankFor(state.score);
    if (isNew) {
      el.resultBest.innerHTML = `<span class="is-new">自己ベスト更新！ ${best}</span>`;
      saveBestTrace(state.difficulty, state.scoreTrace, state.score);
    } else {
      const gap = best - state.score;
      el.resultBest.textContent =
        gap > 0
          ? `自己ベストまであと${gap}点（ベスト：${best}）`
          : `自己ベスト（${DIFFICULTIES[state.difficulty].label}）：${best}`;
    }
  }

  el.resultScore.textContent = state.score;
  el.resultChars.textContent = state.correctChars;
  el.resultAcc.textContent = `${acc}%`;
  el.resultSpeed.textContent = `${charsPerMinute}`;
  renderNewTitles(newTitles);
  el.pauseOverlay.hidden = true;
  el.resultOverlay.hidden = false;
  el.kbdArea.hidden = true; // 結果画面ではキーボードエリアを隠す
  el.stage.classList.remove("compact"); // 結果画面はステージを通常サイズに戻す

  refreshStartBest();
  refreshDailyButton();
  refreshWeakButton();
}

function pauseGame() {
  if (!state || !state.running) return;
  state.running = false;
  clearInterval(state.timerId);
  stopBgm();
  el.pauseOverlay.hidden = false;
  el.kbdArea.hidden = true; // 一時停止中はキーボードエリアを隠す
  el.stage.classList.remove("compact"); // 一時停止中はステージを通常サイズに戻す
}

function resumeGame() {
  if (!state) return;
  el.pauseOverlay.hidden = true;
  el.kbdArea.hidden = false; // 再開したらキーボードエリアを再び表示する
  el.stage.classList.add("compact"); // 再開したらステージを再び小さくする
  if (state.finalSpurt) el.stage.classList.add("final-spurt"); // ラストスパート中に一時停止した場合は演出も復元する
  state.running = true;
  state.timerId = setInterval(tick, 1000);
  startBgm();
  if (state.finalSpurt) setBgmFast(true);
  if (nativeInput && !nativeInput.hidden) {
    nativeInput.focus();
  }
}

function backToMenu() {
  if (state) clearInterval(state.timerId);
  stopBgm();
  clearFinalSpurt();
  clearRoundEffects();
  if (typeof cleanupOnlineRoom === "function") cleanupOnlineRoom();
  state = null;
  local2pMatch = null;
  duelPendingPlayer = null;
  el.pauseOverlay.hidden = true;
  el.resultOverlay.hidden = true;
  el.countdownOverlay.hidden = true;
  el.duelIntroOverlay.hidden = true;
  el.duelResultOverlay.hidden = true;
  if (el.onlineMenuOverlay) el.onlineMenuOverlay.hidden = true;
  if (el.onlineWaitOverlay) el.onlineWaitOverlay.hidden = true;
  el.duelPlayerBadge.hidden = true;
  el.startOverlay.hidden = false;
  el.kbdArea.hidden = true; // メニューに戻ったらキーボードエリアを隠す
  el.stage.classList.remove("compact"); // メニューに戻ったらステージを通常サイズに戻す
  refreshStartBest();
  refreshDailyButton();
  refreshWeakButton();
}

/* ---------- 2人対戦（ローカル） ---------- */
function showDuelIntro(playerNum) {
  duelPendingPlayer = playerNum;
  el.duelIntroTitle.textContent = `プレイヤー${playerNum}の番です`;
  el.duelIntroText.textContent =
    playerNum === 1
      ? "端末を渡して、準備ができたらボタンを押してください。"
      : "交代してください！プレイヤー2の準備ができたらボタンを押してください。";
  el.startOverlay.hidden = true;
  el.resultOverlay.hidden = true;
  el.duelResultOverlay.hidden = true;
  el.duelIntroOverlay.hidden = false;
}

function startLocal2pMatch() {
  local2pMatch = {
    seed: Math.floor(Math.random() * 1e9),
    difficulty: selectedDifficulty,
    p1: null,
    p2: null,
  };
  showDuelIntro(1);
}

el.local2pBtn.addEventListener("click", startLocal2pMatch);

el.duelIntroBtn.addEventListener("click", () => {
  el.duelIntroOverlay.hidden = true;
  runCountdown(() => startGame(false, false, true, local2pMatch.seed));
});

el.duelRetryBtn.addEventListener("click", () => {
  el.duelResultOverlay.hidden = true;
  local2pMatch = {
    seed: Math.floor(Math.random() * 1e9),
    difficulty: local2pMatch.difficulty,
    p1: null,
    p2: null,
  };
  showDuelIntro(1);
});

el.duelBackBtn.addEventListener("click", () => {
  el.duelResultOverlay.hidden = true;
  backToMenu();
});

el.startBtn.addEventListener("click", () => beginWithCountdown(false));
el.retryBtn.addEventListener("click", () => beginWithCountdown(false));
el.backToMenuBtn.addEventListener("click", backToMenu);
el.pauseBtn.addEventListener("click", pauseGame);
el.resumeBtn.addEventListener("click", resumeGame);
el.retireBtn.addEventListener("click", endGame);
el.quitBtn.addEventListener("click", backToMenu);
window.addEventListener("keydown", handleKeydown);

// Escapeキーで一時停止・再開をトグル
window.addEventListener("keydown", (e) => {
  if (e.key !== "Escape" || !state) return;
  if (state.running) {
    pauseGame();
  } else if (!el.pauseOverlay.hidden) {
    resumeGame();
  }
});

/* ---------- 難易度選択 ---------- */
if (el.diffSelect) {
  el.diffSelect.querySelectorAll(".diff-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedDifficulty = btn.dataset.diff;
      el.diffSelect.querySelectorAll(".diff-btn").forEach((b) => {
        b.classList.toggle("active", b === btn);
      });
      safeSet(DIFF_KEY, selectedDifficulty);
      refreshStartBest();
    });
  });

  const savedDiff = safeGet(DIFF_KEY);
  if (savedDiff && DIFFICULTIES[savedDiff]) {
    selectedDifficulty = savedDiff;
    el.diffSelect.querySelectorAll(".diff-btn").forEach((b) => {
      b.classList.toggle("active", b.dataset.diff === savedDiff);
    });
  }
}
refreshStartBest();

/* ---------- 練習モードのトグル（状態を記憶） ---------- */
const PRACTICE_KEY = "karaokeTyping.practice";
if (el.practiceToggle) {
  el.practiceToggle.checked = safeGet(PRACTICE_KEY) === "1";
  el.practiceToggle.addEventListener("change", () => {
    safeSet(PRACTICE_KEY, el.practiceToggle.checked ? "1" : "0");
  });
}

/* ---------- デイリーチャレンジ ---------- */
refreshDailyButton();
el.dailyBtn.addEventListener("click", () => beginWithCountdown(true, false));

/* ---------- 苦手克服モード ---------- */
refreshWeakButton();
el.weakBtn.addEventListener("click", () => beginWithCountdown(false, true));

/* ---------- 称号一覧 ---------- */
function renderTitlesOverlay() {
  const unlocked = new Set(loadUnlockedTitles());
  el.titlesCount.textContent = `${unlocked.size} / ${TITLES.length} 個の称号を獲得`;
  if (el.collectionRow) {
    const items = getCollectedItems();
    el.collectionRow.textContent = items.length > 0 ? items.join(" ") : "まだアイテムはありません";
  }
  el.titlesList.innerHTML = TITLES.map((t) => {
    if (unlocked.has(t.id)) {
      return (
        `<div class="title-card unlocked">` +
        `<span class="title-icon">${t.item || "🏆"}</span>` +
        `<div><div class="title-name">${t.name}</div><div class="title-desc">${t.desc}</div></div>` +
        `</div>`
      );
    }
    return (
      `<div class="title-card locked">` +
      `<span class="title-icon">🔒</span>` +
      `<div><div class="title-name">？？？</div><div class="title-desc">まだ見ぬ称号</div></div>` +
      `</div>`
    );
  }).join("");
}

el.titlesBtn.addEventListener("click", () => {
  renderTitlesOverlay();
  el.startOverlay.hidden = true;
  el.titlesOverlay.hidden = false;
});

el.titlesCloseBtn.addEventListener("click", () => {
  el.titlesOverlay.hidden = true;
  el.startOverlay.hidden = false;
});

/* ---------- ローカルランキング ---------- */
function renderRankingOverlay() {
  const top = getLocalRanking(5);
  if (top.length === 0) {
    el.rankingList.innerHTML = `<p class="best-note">まだ記録がありません。まずは1回プレイしてみましょう。</p>`;
  } else {
    el.rankingList.innerHTML = top.map((h, i) => {
      const d = new Date(h.date);
      const dateLabel = `${d.getMonth() + 1}/${d.getDate()}`;
      const diffLabel = h.isDaily
        ? "デイリー"
        : h.isWeak
        ? "苦手克服"
        : (DIFFICULTIES[h.difficulty] ? DIFFICULTIES[h.difficulty].label : h.difficulty);
      return (
        `<div class="rank-row">` +
        `<span class="rank-no">${i + 1}</span>` +
        `<span class="rank-score">${h.score}</span>` +
        `<span class="rank-diff">${diffLabel}</span>` +
        `<span class="rank-date">${dateLabel}</span>` +
        `</div>`
      );
    }).join("");
  }

  const daily = getTodayDaily();
  el.dailyStatus.textContent = daily ? `本日のベスト：${daily.score}点` : "本日はまだ未挑戦です";
}

el.rankingBtn.addEventListener("click", () => {
  renderRankingOverlay();
  el.startOverlay.hidden = true;
  el.rankingOverlay.hidden = false;
});

el.rankingCloseBtn.addEventListener("click", () => {
  el.rankingOverlay.hidden = true;
  el.startOverlay.hidden = false;
});

/* ---------- 結果を画像で保存・シェア ---------- */
function buildResultCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 800;
  const ctx = canvas.getContext("2d");

  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, "#171330");
  grad.addColorStop(1, "#08060f");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = "center";

  ctx.fillStyle = "#b9b3d6";
  ctx.font = "600 24px sans-serif";
  ctx.fillText("ライブステージ・タイピング", canvas.width / 2, 110);

  ctx.fillStyle = "#ffd166";
  ctx.font = "900 52px sans-serif";
  const titleText = state.practice ? "練習おつかれさま！" : rankFor(state.score);
  ctx.fillText(titleText, canvas.width / 2, 200);

  ctx.fillStyle = "#f5f0ea";
  ctx.font = "700 72px monospace";
  ctx.fillText(state.practice ? "PRACTICE" : `SCORE ${state.score}`, canvas.width / 2, 330);

  const totalChars = state.correctChars + state.missChars;
  const acc = totalChars === 0 ? 0 : Math.round((state.correctChars / totalChars) * 100);

  ctx.fillStyle = "#b9b3d6";
  ctx.font = "500 26px sans-serif";
  ctx.fillText(`難易度：${DIFFICULTIES[state.difficulty].label}`, canvas.width / 2, 400);
  ctx.fillText(`正打数 ${state.correctChars}　正答率 ${acc}%`, canvas.width / 2, 440);

  // 装飾のペンライト列
  const colors = ["#ffd166", "#ff6fa5", "#6fd9ff"];
  const rows = 4;
  const cols = 11;
  const startY = 560;
  const gapX = (canvas.width - 120) / (cols - 1);
  const gapY = 50;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      ctx.fillStyle = colors[(r + c) % colors.length];
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.roundRect(60 + c * gapX - 6, startY + r * gapY, 12, 30, 6);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;

  return canvas;
}

function shareResult() {
  if (!state) return;
  const canvas = buildResultCanvas();

  canvas.toBlob(async (blob) => {
    if (!blob) return;
    const fileName = "live-stage-typing-result.png";
    const file = new File([blob], fileName, { type: "image/png" });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "ライブステージ・タイピング",
          text: state.practice ? "練習モードで遊びました！" : `スコア ${state.score} でクリア！`,
        });
        return;
      } catch (err) {
        // 共有がキャンセル・失敗した場合はダウンロードにフォールバック
      }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, "image/png");
}

if (el.shareBtn) {
  el.shareBtn.addEventListener("click", shareResult);
}

/* ---------- 入力方法の切り替え（ローマ字 / かな / 端末のキーボード） ---------- */
const KBD_MODE_KEY = "karaokeTyping.kbdMode";
const vkb = document.getElementById("vkb");
const flickKb = document.getElementById("flickKb");
const nativeInput = document.getElementById("nativeInput");
const kbdToggle = document.getElementById("kbdToggle");
let flickCancelPending = null; // かなキーボード（flick-keyboard.js）が自身の入力途中状態を破棄するための関数（そちらで登録される）

function setKbdMode(mode) {
  vkb.hidden = mode !== "custom";
  flickKb.hidden = mode !== "flick";
  nativeInput.hidden = mode !== "native";

  if (mode !== "flick" && flickCancelPending) {
    flickCancelPending();
  }

  kbdToggle.querySelectorAll(".kbd-toggle-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === mode);
  });

  safeSet(KBD_MODE_KEY, mode);

  if (mode === "native" && state && state.running) {
    nativeInput.focus();
  }
}

// タッチ専用端末（スマホ・タブレット）では、IME変換に起因する誤動作を避けるため
// 「ローマ字」「端末のキーボード」を選択肢から外し、かな専用キーボードだけを表示する。
// hover/pointerのメディアクエリだけでは判定しきれない端末があるため、
// スマホのユーザーエージェント判定もあわせて行い、より確実に検出する。
const isMobileUA = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
const isTouchOnlyDevice = window.matchMedia("(hover: none) and (pointer: coarse)").matches || isMobileUA;

if (kbdToggle) {
  if (isTouchOnlyDevice) {
    kbdToggle.hidden = true;
    setKbdMode("flick");
  } else {
    kbdToggle.querySelectorAll(".kbd-toggle-btn").forEach((btn) => {
      btn.addEventListener("click", () => setKbdMode(btn.dataset.mode));
    });
    setKbdMode(safeGet(KBD_MODE_KEY) || "custom");
  }
}

// 端末純正キーボードからの入力（ローマ字・かなの両方に対応）
// かな入力はIME（変換）を経由する端末があるため、変換中の "input" イベントは無視し、
// 変換が確定した（compositionend / isComposing=false の）タイミングでのみ文字を確定する。
// これをしないと、変換途中の文字まで拾ってお題が誤って進んでしまう。
if (nativeInput) {
  let ignoreNextInput = false;

  const consumeInput = () => {
    const chars = nativeInput.value.match(/[a-zA-Z\u3041-\u309F\u30FC-]/g) || [];
    chars.forEach((ch) => typeChar(ch));
    nativeInput.value = "";
  };

  nativeInput.addEventListener("input", (e) => {
    if (ignoreNextInput) {
      ignoreNextInput = false;
      return;
    }
    if (e.isComposing) return; // 変換中は無視
    consumeInput();
  });

  nativeInput.addEventListener("compositionend", () => {
    consumeInput();
    ignoreNextInput = true; // 直後に発火する重複のinputイベントを1回だけ無視する
  });
}

/* ---------- 専用オンスクリーンキーボード（ローマ字・タップ操作） ---------- */
if (vkb) {
  vkb.querySelectorAll(".vkb-key").forEach((btn) => {
    const key = btn.dataset.key;

    btn.addEventListener("pointerdown", () => btn.classList.add("pressed"));
    const release = () => btn.classList.remove("pressed");
    btn.addEventListener("pointerup", release);
    btn.addEventListener("pointerleave", release);

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      typeChar(key);
    });
  });
}

// 初期表示
buildCrowd();