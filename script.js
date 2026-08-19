/* =========================================================
   ライブステージ・タイピング
   打鍵ごとに客席のペンライトが1本ずつ灯っていくタイピングゲーム
   ========================================================= */

// お題リスト（表示語 / ふりがな / 正解ローマ字 / 別解ローマ字）
const WORDS = [
  { word: "夢",       kana: "ゆめ",         romaji: ["yume"] },
  { word: "情熱",     kana: "じょうねつ",   romaji: ["jounetsu", "zyounetsu", "jounetu"] },
  { word: "声援",     kana: "せいえん",     romaji: ["seien"] },
  { word: "拍手",     kana: "はくしゅ",     romaji: ["hakushu", "hakusyu"] },
  { word: "叫べ",     kana: "さけべ",       romaji: ["sakebe"] },
  { word: "涙",       kana: "なみだ",       romaji: ["namida"] },
  { word: "奇跡",     kana: "きせき",       romaji: ["kiseki"] },
  { word: "運命",     kana: "うんめい",     romaji: ["unmei"] },
  { word: "青春",     kana: "せいしゅん",   romaji: ["seishun", "seisyun"] },
  { word: "太陽",     kana: "たいよう",     romaji: ["taiyou"] },
  { word: "明日",     kana: "あした",       romaji: ["ashita", "asita"] },
  { word: "希望",     kana: "きぼう",       romaji: ["kibou"] },
  { word: "旅立ち",   kana: "たびだち",     romaji: ["tabidachi", "tabidati"] },
  { word: "主人公",   kana: "しゅじんこう", romaji: ["shujinkou", "syuzinkou"] },
  { word: "花道",     kana: "はなみち",     romaji: ["hanamichi", "hanamiti"] },
  { word: "歓声",     kana: "かんせい",     romaji: ["kansei"] },
  { word: "熱狂",     kana: "ねっきょう",   romaji: ["nekkyou"] },
  { word: "喝采",     kana: "かっさい",     romaji: ["kassai"] },
  { word: "全力",     kana: "ぜんりょく",   romaji: ["zenryoku"] },
  { word: "光",       kana: "ひかり",       romaji: ["hikari"] },
  { word: "アンコール", kana: "あんこーる", romaji: ["ankoru", "ankooru","anko-ru"] },
  { word: "一期一会", kana: "いちごいちえ", romaji: ["ichigoichie", "itigoitie"] },
  { word: "本気",     kana: "ほんき",       romaji: ["honki"] },
  { word: "絆",       kana: "きずな",       romaji: ["kizuna"] },
  { word: "煌めき",   kana: "きらめき",     romaji: ["kirameki"] },
  { word: "最高",     kana: "さいこう",     romaji: ["saikou"] },
  { word: "感謝",     kana: "かんしゃ",     romaji: ["kansha", "kansya"] },
  { word: "喉が枯れる", kana: "のどがかれる", romaji: ["nodogakareru"] },
  { word: "魂",       kana: "たましい",     romaji: ["tamashii", "tamasii"] },
  { word: "全開",     kana: "ぜんかい",     romaji: ["zenkai"] },
];

const PENLIGHT_COLORS = ["--gold", "--pink", "--cyan"];
const GAME_SECONDS = 60;
const CROWD_SIZE = 63; // 9列 x 7段

const el = {
  crowd: document.getElementById("crowd"),
  spotlight: document.getElementById("spotlight"),
  mic: document.getElementById("mic"),
  scoreValue: document.getElementById("scoreValue"),
  timeValue: document.getElementById("timeValue"),
  hypeFill: document.getElementById("hypeFill"),
  promptKana: document.getElementById("promptKana"),
  promptWord: document.getElementById("promptWord"),
  promptRomaji: document.getElementById("promptRomaji"),
  startOverlay: document.getElementById("startOverlay"),
  startBtn: document.getElementById("startBtn"),
  resultOverlay: document.getElementById("resultOverlay"),
  resultRank: document.getElementById("resultRank"),
  resultScore: document.getElementById("resultScore"),
  resultChars: document.getElementById("resultChars"),
  resultAcc: document.getElementById("resultAcc"),
  retryBtn: document.getElementById("retryBtn"),
};

let state = null;

function buildCrowd() {
  el.crowd.innerHTML = "";
  for (let i = 0; i < CROWD_SIZE; i++) {
    const p = document.createElement("div");
    p.className = "penlight";
    el.crowd.appendChild(p);
  }
}

function pickWord(excludeWord) {
  let candidate;
  do {
    candidate = WORDS[Math.floor(Math.random() * WORDS.length)];
  } while (WORDS.length > 1 && candidate === excludeWord);
  return candidate;
}

function initState() {
  return {
    running: false,
    timeLeft: GAME_SECONDS,
    score: 0,
    correctChars: 0,
    missChars: 0,
    hype: 0,
    current: null,
    typed: "",
    litCount: 0,
    timerId: null,
  };
}

function renderPrompt() {
  const { current, typed } = state;
  el.promptKana.textContent = current.kana;
  el.promptWord.textContent = current.word;

  const answer = current.romaji[0];
  const done = answer.slice(0, typed.length);
  const next = answer.slice(typed.length, typed.length + 1);
  const rest = answer.slice(typed.length + 1);

  el.promptRomaji.innerHTML =
    `<span class="romaji-done">${done}</span>` +
    `<span class="romaji-next">${next}</span>` +
    `<span class="romaji-rest">${rest}</span>`;
}

function nextWord() {
  state.current = pickWord(state.current);
  state.typed = "";
  renderPrompt();
}

function updateHud() {
  el.scoreValue.textContent = state.score;
  el.timeValue.textContent = state.timeLeft;
  el.timeValue.classList.toggle("time-warn", state.timeLeft <= 10);
  el.hypeFill.style.width = `${state.hype}%`;
  el.hypeFill.classList.toggle("maxed", state.hype >= 100);
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
  // reflow で再アニメーションさせる
  void el.mic.offsetWidth;
  el.mic.classList.add("miss");
}

function burstSpotlight() {
  el.spotlight.classList.remove("burst");
  void el.spotlight.offsetWidth;
  el.spotlight.classList.add("burst");
}

function isAnswerMatch(typed, romajiOptions) {
  return romajiOptions.some((r) => r === typed);
}

function isPrefixOfAny(typed, romajiOptions) {
  return romajiOptions.some((r) => r.startsWith(typed));
}

function handleKeydown(e) {
  if (e.key.length !== 1 || !/^[a-zA-Z]$/.test(e.key)) return;
  typeChar(e.key);
}

function typeChar(rawKey) {
  if (!state.running) return;

  const key = rawKey.toLowerCase();
  const attempt = state.typed + key;
  const { romaji } = state.current;

  if (isPrefixOfAny(attempt, romaji)) {
    // 正しい打鍵
    state.typed = attempt;
    state.correctChars += 1;
    state.score += 10;
    state.hype = Math.min(100, state.hype + 4);
    lightNextPenlight();
    renderPrompt();
    updateHud();

    if (isAnswerMatch(state.typed, romaji)) {
      // 単語を打ち切った
      state.score += 20;
      burstSpotlight();
      nextWord();
    }
  } else {
    // ミス打鍵
    state.missChars += 1;
    state.hype = Math.max(0, state.hype - 6);
    flashMiss();
    updateHud();
  }
}

function tick() {
  state.timeLeft -= 1;
  updateHud();
  if (state.timeLeft <= 0) {
    endGame();
  }
}

function rankFor(score) {
  if (score >= 1400) return "伝説のボーカリスト";
  if (score >= 900) return "ライブの主役";
  if (score >= 500) return "頼れるバンドマン";
  if (score >= 200) return "見習いシンガー";
  return "路上ライブ初日";
}

function startGame() {
  state = initState();
  state.running = true;
  buildCrowd();
  nextWord();
  updateHud();
  el.startOverlay.hidden = true;
  el.resultOverlay.hidden = true;
  state.timerId = setInterval(tick, 1000);

  // 「端末のキーボード」モードならゲーム開始と同時にフォーカスして開く
  if (nativeInput && !nativeInput.hidden) {
    nativeInput.focus();
  }
}

function endGame() {
  state.running = false;
  clearInterval(state.timerId);

  const totalChars = state.correctChars + state.missChars;
  const acc = totalChars === 0 ? 0 : Math.round((state.correctChars / totalChars) * 100);

  el.resultRank.textContent = rankFor(state.score);
  el.resultScore.textContent = state.score;
  el.resultChars.textContent = state.correctChars;
  el.resultAcc.textContent = `${acc}%`;
  el.resultOverlay.hidden = false;
}

el.startBtn.addEventListener("click", startGame);
el.retryBtn.addEventListener("click", startGame);
window.addEventListener("keydown", handleKeydown);

// ---------- 入力方法の切り替え（専用キーボード / 端末のキーボード） ----------
const KBD_MODE_KEY = "karaokeTyping.kbdMode";
const vkb = document.getElementById("vkb");
const nativeInput = document.getElementById("nativeInput");
const kbdToggle = document.getElementById("kbdToggle");

function setKbdMode(mode) {
  const isNative = mode === "native";
  vkb.hidden = isNative;
  nativeInput.hidden = !isNative;

  kbdToggle.querySelectorAll(".kbd-toggle-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === mode);
  });

  try {
    localStorage.setItem(KBD_MODE_KEY, mode);
  } catch (err) {
    // プライベートブラウズ等でlocalStorageが使えない場合は無視
  }

  if (isNative && state && state.running) {
    nativeInput.focus();
  }
}

if (kbdToggle) {
  kbdToggle.querySelectorAll(".kbd-toggle-btn").forEach((btn) => {
    btn.addEventListener("click", () => setKbdMode(btn.dataset.mode));
  });

  let savedMode = "custom";
  try {
    savedMode = localStorage.getItem(KBD_MODE_KEY) || "custom";
  } catch (err) {
    // 無視
  }
  setKbdMode(savedMode);
}

// 端末純正キーボードからの入力（1文字ずつ拾ってすぐ入力欄をクリアする）
if (nativeInput) {
  nativeInput.addEventListener("input", () => {
    const chars = nativeInput.value.match(/[a-zA-Z]/g) || [];
    chars.forEach((ch) => typeChar(ch));
    nativeInput.value = "";
  });
}

// ---------- 専用オンスクリーンキーボード（タップ操作） ----------
if (vkb) {
  vkb.querySelectorAll(".vkb-key").forEach((btn) => {
    const key = btn.dataset.key;

    btn.addEventListener("pointerdown", () => {
      btn.classList.add("pressed");
    });
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