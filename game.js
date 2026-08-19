/* =========================================================
   game.js
   ライブステージ・タイピング — ゲーム本体
   打鍵ごとに客席のペンライトが1本ずつ灯っていくタイピングゲーム
   ※ words.js / audio.js を先に読み込んでおくこと。
   ========================================================= */

const PENLIGHT_COLORS = ["--gold", "--pink", "--cyan"];
const GAME_SECONDS = 60;
const CROWD_SIZE = 63; // 9列 x 7段
const BEST_SCORE_KEY = "karaokeTyping.bestScores";
const DIFF_KEY = "karaokeTyping.difficulty";
const RUN_HISTORY_KEY = "karaokeTyping.runHistory";

const el = {
  crowd: document.getElementById("crowd"),
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
  titlesBtn: document.getElementById("titlesBtn"),
  titlesOverlay: document.getElementById("titlesOverlay"),
  titlesCount: document.getElementById("titlesCount"),
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
  newTitles: document.getElementById("newTitles"),
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
};

let state = null;
let selectedDifficulty = "normal";

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
  el.dailyStatusInline.textContent = daily ? `本日のベスト：${daily.score}点` : "本日はまだ未挑戦";
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
  const pool = state.isDaily ? NORMAL_WORDS : DIFFICULTIES[state.difficulty].words;
  const rand = state.isDaily && state.rng ? state.rng : Math.random;
  let candidate;
  do {
    candidate = pool[Math.floor(rand() * pool.length)];
  } while (pool.length > 1 && candidate === excludeWord);
  return candidate;
}

function initState(difficulty, practice, isDaily) {
  return {
    running: false,
    difficulty,
    practice: !!practice,
    isDaily: !!isDaily,
    rng: isDaily ? mulberry32(hashSeedFromString(todayDateString())) : null,
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
  renderPrompt();
}

function comboMultiplier(combo) {
  const tier = COMBO_TIERS.find((t) => combo >= t.min);
  return tier ? tier.mult : 1.0;
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

  const mult = comboMultiplier(state.combo);
  if (state.combo >= 3) {
    el.comboValue.hidden = false;
    el.comboValue.textContent = `combo ${state.combo} (x${mult})`;
    el.comboValue.classList.toggle("boosted", mult > 1);
  } else {
    el.comboValue.hidden = true;
  }
}

function lightNextPenlight() {
  const lights = el.crowd.children;
  if (lights.length === 0) return;
  state.litCount = (state.litCount + 1) % lights.length;
  const target = lights[state.litCount];
  const color = PENLIGHT_COLORS[Math.floor(Math.random() * PENLIGHT_COLORS.length)];
  target.style.setProperty("--glow", `var(${color})`);
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

function celebrateHypeMax() {
  el.crowd.classList.add("wave");
  el.hypeBanner.classList.remove("show");
  void el.hypeBanner.offsetWidth;
  el.hypeBanner.classList.add("show");
  sfxHypeMax();
  vibrate([40, 60, 40, 60, 120]);
  setTimeout(() => el.crowd.classList.remove("wave"), 1400);
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
  const mult = comboMultiplier(state.combo);
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
  state.missChars += 1;
  state.combo = 0;
  state.hype = Math.max(0, state.hype - cfg.missPenalty);
  if (state.hype < 100) state.hypeCelebrated = false;
  flashMiss();
  sfxMiss();
  vibrate([25, 40, 25]);
}

function onWordComplete() {
  const mult = comboMultiplier(state.combo);
  state.combo += 1;
  state.maxCombo = Math.max(state.maxCombo, state.combo);
  state.score += Math.round(20 * mult);
  burstSpotlight();
  sfxWordComplete();
  vibrate(30);
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

function tick() {
  if (state.practice) return; // 練習モードはタイマー無し
  state.timeLeft -= 1;
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

function startGame(isDaily) {
  ensureAudio();
  const practice = isDaily ? false : !!(el.practiceToggle && el.practiceToggle.checked);
  state = initState(isDaily ? "normal" : selectedDifficulty, practice, isDaily);
  state.running = true;
  buildCrowd();
  nextWord();
  updateHud();
  el.startOverlay.hidden = true;
  el.resultOverlay.hidden = true;
  el.pauseOverlay.hidden = true;
  el.hypeBanner.classList.remove("show");
  state.timerId = setInterval(tick, 1000);
  startBgm();

  // 「端末のキーボード」モードならゲーム開始と同時にフォーカスして開く
  if (nativeInput && !nativeInput.hidden) {
    nativeInput.focus();
  }
}

function runCountdown(onDone) {
  el.startOverlay.hidden = true;
  el.resultOverlay.hidden = true;
  el.pauseOverlay.hidden = true;
  el.countdownOverlay.hidden = false;

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

function beginWithCountdown(isDaily) {
  ensureAudio();
  runCountdown(() => startGame(isDaily));
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

function endGame() {
  state.running = false;
  clearInterval(state.timerId);
  stopBgm();

  const totalChars = state.correctChars + state.missChars;
  const acc = totalChars === 0 ? 0 : Math.round((state.correctChars / totalChars) * 100);

  const ctx = {
    score: state.score,
    correctChars: state.correctChars,
    missChars: state.missChars,
    difficulty: state.difficulty,
    practice: state.practice,
    isDaily: state.isDaily,
    maxCombo: state.maxCombo,
    usedKana: state.usedKana,
    usedRomaji: state.usedRomaji,
    hour: new Date().getHours(),
    date: new Date().toISOString(),
  };

  recordRun(ctx);
  const newTitles = evaluateTitles(ctx);

  if (state.practice) {
    el.resultRank.textContent = "練習おつかれさまでした！";
    el.resultBest.textContent = "練習モードのためスコアは記録されません";
  } else if (state.isDaily) {
    const daily = getTodayDaily();
    el.resultRank.textContent = `${rankFor(state.score)}（本日のステージ）`;
    el.resultBest.textContent = `本日のベスト：${daily ? daily.score : state.score}`;
  } else {
    const { isNew, best } = saveBestScoreIfHigher(state.difficulty, state.score);
    el.resultRank.textContent = rankFor(state.score);
    el.resultBest.innerHTML = isNew
      ? `<span class="is-new">自己ベスト更新！ ${best}</span>`
      : `自己ベスト（${DIFFICULTIES[state.difficulty].label}）：${best}`;
  }

  el.resultScore.textContent = state.score;
  el.resultChars.textContent = state.correctChars;
  el.resultAcc.textContent = `${acc}%`;
  renderNewTitles(newTitles);
  el.pauseOverlay.hidden = true;
  el.resultOverlay.hidden = false;

  refreshStartBest();
  refreshDailyButton();
}

function pauseGame() {
  if (!state || !state.running) return;
  state.running = false;
  clearInterval(state.timerId);
  stopBgm();
  el.pauseOverlay.hidden = false;
}

function resumeGame() {
  if (!state) return;
  el.pauseOverlay.hidden = true;
  state.running = true;
  state.timerId = setInterval(tick, 1000);
  startBgm();
  if (nativeInput && !nativeInput.hidden) {
    nativeInput.focus();
  }
}

function backToMenu() {
  if (state) clearInterval(state.timerId);
  stopBgm();
  state = null;
  el.pauseOverlay.hidden = true;
  el.resultOverlay.hidden = true;
  el.countdownOverlay.hidden = true;
  el.startOverlay.hidden = false;
  refreshStartBest();
  refreshDailyButton();
}

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
el.dailyBtn.addEventListener("click", () => beginWithCountdown(true));

/* ---------- 称号一覧 ---------- */
function renderTitlesOverlay() {
  const unlocked = new Set(loadUnlockedTitles());
  el.titlesCount.textContent = `${unlocked.size} / ${TITLES.length} 個の称号を獲得`;
  el.titlesList.innerHTML = TITLES.map((t) => {
    if (unlocked.has(t.id)) {
      return (
        `<div class="title-card unlocked">` +
        `<span class="title-icon">🏆</span>` +
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
      const diffLabel = h.isDaily ? "デイリー" : (DIFFICULTIES[h.difficulty] ? DIFFICULTIES[h.difficulty].label : h.difficulty);
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
// 「端末のキーボード」を選択肢から外し、かな専用キーボードだけを表示する。
// マウス・トラックパッドが使える環境（hover:hover）ではこれまで通り選べるようにする。
const isTouchOnlyDevice = window.matchMedia("(hover: none) and (pointer: coarse)").matches;

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