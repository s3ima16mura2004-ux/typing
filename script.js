/* =========================================================
   ライブステージ・タイピング
   打鍵ごとに客席のペンライトが1本ずつ灯っていくタイピングゲーム
   ========================================================= */

// ---------- お題リスト（難易度別） ----------
// word: 表示語 / kana: ふりがな（かな入力の正解） / romaji: 正解ローマ字（表記ゆれは配列で複数指定）

const EASY_WORDS = [
  { word: "夢",   kana: "ゆめ",   romaji: ["yume"] },
  { word: "叫べ", kana: "さけべ", romaji: ["sakebe"] },
  { word: "涙",   kana: "なみだ", romaji: ["namida"] },
  { word: "奇跡", kana: "きせき", romaji: ["kiseki"] },
  { word: "明日", kana: "あした", romaji: ["ashita"] },
  { word: "希望", kana: "きぼう", romaji: ["kibou"] },
  { word: "光",   kana: "ひかり", romaji: ["hikari"] },
  { word: "本気", kana: "ほんき", romaji: ["honki"] },
  { word: "絆",   kana: "きずな", romaji: ["kizuna"] },
  { word: "愛",   kana: "あい",   romaji: ["ai"] },
  { word: "歌",   kana: "うた",   romaji: ["uta"] },
  { word: "声",   kana: "こえ",   romaji: ["koe"] },
  { word: "夜",   kana: "よる",   romaji: ["yoru"] },
  { word: "星",   kana: "ほし",   romaji: ["hoshi", "hosi"] },
  { word: "月",   kana: "つき",   romaji: ["tsuki"] },
  { word: "花",   kana: "はな",   romaji: ["hana"] },
  { word: "道",   kana: "みち",   romaji: ["michi", "miti"] },
  { word: "炎",   kana: "ほのお", romaji: ["honoo"] },
  { word: "今",   kana: "いま",   romaji: ["ima"] },
  { word: "私",   kana: "わたし", romaji: ["watashi", "watasi"] },
  { word: "君",   kana: "きみ",   romaji: ["kimi"] },
  { word: "心",   kana: "こころ", romaji: ["kokoro"] },
  { word: "夏",   kana: "なつ",   romaji: ["natsu"] },
  { word: "風",   kana: "かぜ",   romaji: ["kaze"] },
  { word: "空",   kana: "そら",   romaji: ["sora"] },
  { word: "海",   kana: "うみ",   romaji: ["umi"] },
  { word: "虹",   kana: "にじ",   romaji: ["niji"] },
  { word: "朝",   kana: "あさ",   romaji: ["asa"] },
  { word: "影",   kana: "かげ",   romaji: ["kage"] },
  { word: "波",   kana: "なみ",   romaji: ["nami"] },
  { word: "雨",   kana: "あめ",   romaji: ["ame"] },
  { word: "雲",   kana: "くも",   romaji: ["kumo"] },
  { word: "笑う", kana: "わらう", romaji: ["warau"] },
  { word: "未来", kana: "みらい", romaji: ["mirai"] },
  { word: "拳",   kana: "こぶし", romaji: ["kobushi", "kobusi"] },
  { word: "音",   kana: "おと",   romaji: ["oto"] },
  { word: "色",   kana: "いろ",   romaji: ["iro"] },
  { word: "命",   kana: "いのち", romaji: ["inochi", "inoti"] },
  { word: "時",   kana: "とき",   romaji: ["toki"] },
  { word: "今夜", kana: "こんや", romaji: ["konya"] },
  { word: "青",   kana: "あお",   romaji: ["ao"] },
  { word: "赤",   kana: "あか",   romaji: ["aka"] },
  { word: "白",   kana: "しろ",   romaji: ["shiro", "siro"] },
  { word: "黒",   kana: "くろ",   romaji: ["kuro"] },
];

const NORMAL_WORDS = [
  { word: "情熱",   kana: "じょうねつ", romaji: ["jounetsu", "zyounetsu"] },
  { word: "声援",   kana: "せいえん",   romaji: ["seien"] },
  { word: "拍手",   kana: "はくしゅ",   romaji: ["hakushu", "hakusyu"] },
  { word: "運命",   kana: "うんめい",   romaji: ["unmei"] },
  { word: "青春",   kana: "せいしゅん", romaji: ["seishun", "seisyun"] },
  { word: "太陽",   kana: "たいよう",   romaji: ["taiyou"] },
  { word: "旅立ち", kana: "たびだち",   romaji: ["tabidachi", "tabidati"] },
  { word: "花道",   kana: "はなみち",   romaji: ["hanamichi", "hanamiti"] },
  { word: "歓声",   kana: "かんせい",   romaji: ["kansei"] },
  { word: "熱狂",   kana: "ねっきょう", romaji: ["nekkyou"] },
  { word: "喝采",   kana: "かっさい",   romaji: ["kassai"] },
  { word: "全力",   kana: "ぜんりょく", romaji: ["zenryoku"] },
  { word: "アンコール", kana: "あんこーる", romaji: ["ankoru", "ankooru"] },
  { word: "煌めき", kana: "きらめき",   romaji: ["kirameki"] },
  { word: "最高",   kana: "さいこう",   romaji: ["saikou"] },
  { word: "感謝",   kana: "かんしゃ",   romaji: ["kansha", "kansya"] },
  { word: "魂",     kana: "たましい",   romaji: ["tamashii", "tamasii"] },
  { word: "全開",   kana: "ぜんかい",   romaji: ["zenkai"] },
  { word: "情景",   kana: "じょうけい", romaji: ["joukei"] },
  { word: "感激",   kana: "かんげき",   romaji: ["kangeki"] },
  { word: "感動",   kana: "かんどう",   romaji: ["kandou"] },
  { word: "高鳴る", kana: "たかなる",   romaji: ["takanaru"] },
  { word: "響く",   kana: "ひびく",     romaji: ["hibiku"] },
  { word: "輝く",   kana: "かがやく",   romaji: ["kagayaku"] },
  { word: "弾ける", kana: "はじける",   romaji: ["hajikeru"] },
  { word: "見つめる", kana: "みつめる", romaji: ["mitsumeru"] },
  { word: "目指せ", kana: "めざせ",     romaji: ["mezase"] },
  { word: "誓う",   kana: "ちかう",     romaji: ["chikau", "tikau"] },
  { word: "舞台",   kana: "ぶたい",     romaji: ["butai"] },
  { word: "主役",   kana: "しゅやく",   romaji: ["shuyaku", "syuyaku"] },
  { word: "熱唱",   kana: "ねっしょう", romaji: ["nesshou", "nessyou"] },
  { word: "独唱",   kana: "どくしょう", romaji: ["dokushou", "dokusyou"] },
  { word: "音色",   kana: "ねいろ",     romaji: ["neiro"] },
  { word: "旋律",   kana: "せんりつ",   romaji: ["senritsu"] },
  { word: "律動",   kana: "りつどう",   romaji: ["ritsudou"] },
  { word: "心臓",   kana: "しんぞう",   romaji: ["shinzou"] },
  { word: "鼓動",   kana: "こどう",     romaji: ["kodou"] },
  { word: "歓喜",   kana: "かんき",     romaji: ["kanki"] },
  { word: "感涙",   kana: "かんるい",   romaji: ["kanrui"] },
  { word: "見せ場", kana: "みせば",     romaji: ["miseba"] },
  { word: "満員",   kana: "まんいん",   romaji: ["mannin"] },
  { word: "客席",   kana: "きゃくせき", romaji: ["kyakuseki"] },
  { word: "熱気",   kana: "ねっき",     romaji: ["nekki"] },
  { word: "高揚",   kana: "こうよう",   romaji: ["kouyou"] },
  { word: "覚醒",   kana: "かくせい",   romaji: ["kakusei"] },
  { word: "立ち位置", kana: "たちいち", romaji: ["tachiichi"] },
];

const HARD_WORDS = [
  { word: "主人公",     kana: "しゅじんこう",     romaji: ["shujinkou", "syuzinkou"] },
  { word: "一期一会",   kana: "いちごいちえ",     romaji: ["ichigoichie", "itigoitie"] },
  { word: "喉が枯れる", kana: "のどがかれる",     romaji: ["nodogakareru"] },
  { word: "感無量",     kana: "かんむりょう",     romaji: ["kanmuryou"] },
  { word: "拍手喝采",   kana: "はくしゅかっさい", romaji: ["hakushukassai", "hakusyukassai"] },
  { word: "一世一代",   kana: "いっせいちだい",   romaji: ["isseichidai"] },
  { word: "声を枯らして", kana: "こえをからして", romaji: ["koewokarashite"] },
  { word: "心を燃やせ", kana: "こころをもやせ",   romaji: ["kokorowomoyase"] },
  { word: "万雷の拍手", kana: "ばんらいのはくしゅ", romaji: ["banrainohakushu", "banrainohakusyu"] },
  { word: "一生忘れない", kana: "いっしょうわすれない", romaji: ["isshouwasurenai", "issyouwasurenai"] },
  { word: "咲き誇る",   kana: "さきほこる",       romaji: ["sakihokoru"] },
  { word: "大合唱",     kana: "だいがっしょう",   romaji: ["daigasshou", "daigassyou"] },
  { word: "名場面",     kana: "めいばめん",       romaji: ["meibamen"] },
  { word: "決め台詞",   kana: "きめぜりふ",       romaji: ["kimezerifu"] },
  { word: "無我夢中",   kana: "むがむちゅう",     romaji: ["mugamuchuu", "mugamutyuu"] },
  { word: "全身全霊",   kana: "ぜんしんぜんれい", romaji: ["zenshinzenrei"] },
  { word: "一体感",     kana: "いったいかん",     romaji: ["ittaikan"] },
  { word: "涙腺崩壊",   kana: "るいせんほうかい", romaji: ["ruisenhoukai"] },
  { word: "心震える",   kana: "こころふるえる",   romaji: ["kokorofurueru"] },
  { word: "声援に応える", kana: "せいえんにこたえる", romaji: ["seiennikotaeru"] },
  { word: "夢の続き",   kana: "ゆめのつづき",     romaji: ["yumenotsuzuki"] },
  { word: "心のままに", kana: "こころのままに",   romaji: ["kokoronomamani"] },
  { word: "限界突破",   kana: "げんかいとっぱ",   romaji: ["genkaitoppa"] },
  { word: "一世一代の舞台", kana: "いっせいちだいのぶたい", romaji: ["isseichidainobutai"] },
];

// ---------- ローマ字の表記ゆれを自動で展開する ----------
// 個別の単語ごとに手打ちしなくても、今後お題が増えたときに以下のルールが自動で効く：
//   ・shi⇄si / chi⇄ti / tsu⇄tu / fu⇄hu / ji⇄zi
//   ・sha⇄sya / shu⇄syu / sho⇄syo / cha⇄tya / chu⇄tyu / cho⇄tyo
//   ・母音を重ねる長音表記 ⇄ ハイフン表記（例: ankooru ⇄ anko-ru）
const ROMAJI_PAIRS = [
  ["shi", "si"],
  ["chi", "ti"],
  ["tsu", "tu"],
  ["ji", "zi"],
  ["sha", "sya"],
  ["shu", "syu"],
  ["sho", "syo"],
  ["cha", "tya"],
  ["chu", "tyu"],
  ["cho", "tyo"],
];

function expandRomajiVariants(str) {
  let variants = new Set([str]);

  ROMAJI_PAIRS.forEach(([a, b]) => {
    const next = new Set();
    variants.forEach((v) => {
      next.add(v);
      if (v.includes(a)) next.add(v.split(a).join(b));
      if (v.includes(b)) next.add(v.split(b).join(a));
    });
    variants = next;
  });

  // fu ⇄ hu（「shu」「chu」の語尾に含まれる hu は対象外にする）
  let next = new Set();
  variants.forEach((v) => {
    next.add(v);
    if (/(?<![sc])hu/.test(v)) {
      next.add(v.replace(/(?<![sc])hu/g, "fu"));
    }
    if (v.includes("fu")) {
      next.add(v.split("fu").join("hu"));
    }
  });
  variants = next;

  // 長音（同じ母音の連続） ⇄ ハイフン
  next = new Set();
  const vowels = ["a", "i", "u", "e", "o"];
  variants.forEach((v) => {
    next.add(v);
    vowels.forEach((vw) => {
      const doubled = vw + vw;
      if (v.includes(doubled)) {
        next.add(v.split(doubled).join(vw + "-"));
      }
    });
  });
  variants = next;

  return Array.from(variants);
}

// 各お題リストの romaji 配列に、上記ルールで生成した表記ゆれをすべて追加する
function expandWordList(list) {
  list.forEach((w) => {
    const expanded = new Set();
    w.romaji.forEach((r) => expandRomajiVariants(r).forEach((v) => expanded.add(v)));
    w.romaji = Array.from(expanded);
  });
  return list;
}

[EASY_WORDS, NORMAL_WORDS, HARD_WORDS].forEach(expandWordList);

// ---------- 難易度設定 ----------
const DIFFICULTIES = {
  easy: {
    label: "かんたん",
    words: EASY_WORDS,
    correctHype: 5,
    missPenalty: 3,
  },
  normal: {
    label: "ふつう",
    words: NORMAL_WORDS,
    correctHype: 4,
    missPenalty: 6,
  },
  hard: {
    label: "むずかしい",
    words: HARD_WORDS,
    correctHype: 3,
    missPenalty: 9,
  },
};

// コンボ数に応じたスコア倍率
const COMBO_TIERS = [
  { min: 8, mult: 2.0 },
  { min: 5, mult: 1.5 },
  { min: 3, mult: 1.2 },
  { min: 0, mult: 1.0 },
];

const PENLIGHT_COLORS = ["--gold", "--pink", "--cyan"];
const GAME_SECONDS = 60;
const CROWD_SIZE = 63; // 9列 x 7段
const BEST_SCORE_KEY = "karaokeTyping.bestScores";
const MUTE_KEY = "karaokeTyping.muted";
const DIFF_KEY = "karaokeTyping.difficulty";

const el = {
  crowd: document.getElementById("crowd"),
  spotlight: document.getElementById("spotlight"),
  mic: document.getElementById("mic"),
  muteBtn: document.getElementById("muteBtn"),
  pauseBtn: document.getElementById("pauseBtn"),
  scoreValue: document.getElementById("scoreValue"),
  comboValue: document.getElementById("comboValue"),
  timeValue: document.getElementById("timeValue"),
  hypeFill: document.getElementById("hypeFill"),
  hypeBanner: document.getElementById("hypeBanner"),
  promptKana: document.getElementById("promptKana"),
  promptWord: document.getElementById("promptWord"),
  promptRomaji: document.getElementById("promptRomaji"),
  startOverlay: document.getElementById("startOverlay"),
  startBtn: document.getElementById("startBtn"),
  startBest: document.getElementById("startBest"),
  diffSelect: document.getElementById("diffSelect"),
  resultOverlay: document.getElementById("resultOverlay"),
  resultRank: document.getElementById("resultRank"),
  resultBest: document.getElementById("resultBest"),
  resultScore: document.getElementById("resultScore"),
  resultChars: document.getElementById("resultChars"),
  resultAcc: document.getElementById("resultAcc"),
  retryBtn: document.getElementById("retryBtn"),
  backToMenuBtn: document.getElementById("backToMenuBtn"),
  pauseOverlay: document.getElementById("pauseOverlay"),
  resumeBtn: document.getElementById("resumeBtn"),
  retireBtn: document.getElementById("retireBtn"),
  quitBtn: document.getElementById("quitBtn"),
  countdownOverlay: document.getElementById("countdownOverlay"),
  countdownNum: document.getElementById("countdownNum"),
};

let state = null;
let selectedDifficulty = "normal";

/* =========================================================
   ローカルストレージ関連（自己ベスト・ミュート・難易度）
   ========================================================= */

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
   サウンド（Web Audio API / 追加ファイル不要）
   ========================================================= */

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

function sfxTick() {
  playTone(400, 0.05, "square", 0.06);
}

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
  const pool = DIFFICULTIES[state.difficulty].words;
  let candidate;
  do {
    candidate = pool[Math.floor(Math.random() * pool.length)];
  } while (pool.length > 1 && candidate === excludeWord);
  return candidate;
}

function initState(difficulty) {
  return {
    running: false,
    difficulty,
    timeLeft: GAME_SECONDS,
    score: 0,
    correctChars: 0,
    missChars: 0,
    hype: 0,
    hypeCelebrated: false,
    combo: 0,
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

  const kanaAnswer = current.kana;
  const doneK = kanaAnswer.slice(0, typedKana.length);
  const nextK = kanaAnswer.slice(typedKana.length, typedKana.length + 1);
  const restK = kanaAnswer.slice(typedKana.length + 1);
  el.promptKana.innerHTML =
    `<span class="romaji-done">${doneK}</span>` +
    `<span class="romaji-next">${nextK}</span>` +
    `<span class="romaji-rest">${restK}</span>`;

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
  state.typedKana = "";
  renderPrompt();
}

function comboMultiplier(combo) {
  const tier = COMBO_TIERS.find((t) => combo >= t.min);
  return tier ? tier.mult : 1.0;
}

function updateHud() {
  el.scoreValue.textContent = state.score;
  el.timeValue.textContent = state.timeLeft;
  el.timeValue.classList.toggle("time-warn", state.timeLeft <= 10);
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
}

function onWordComplete() {
  const mult = comboMultiplier(state.combo);
  state.combo += 1;
  state.score += Math.round(20 * mult);
  burstSpotlight();
  sfxWordComplete();
  nextWord();
}

function handleKanaInput(rawChar) {
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

function startGame() {
  ensureAudio();
  state = initState(selectedDifficulty);
  state.running = true;
  buildCrowd();
  nextWord();
  updateHud();
  el.startOverlay.hidden = true;
  el.resultOverlay.hidden = true;
  el.pauseOverlay.hidden = true;
  el.hypeBanner.classList.remove("show");
  state.timerId = setInterval(tick, 1000);

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

function beginWithCountdown() {
  ensureAudio();
  runCountdown(startGame);
}

function endGame() {
  state.running = false;
  clearInterval(state.timerId);

  const totalChars = state.correctChars + state.missChars;
  const acc = totalChars === 0 ? 0 : Math.round((state.correctChars / totalChars) * 100);
  const { isNew, best } = saveBestScoreIfHigher(state.difficulty, state.score);

  el.resultRank.textContent = rankFor(state.score);
  el.resultScore.textContent = state.score;
  el.resultChars.textContent = state.correctChars;
  el.resultAcc.textContent = `${acc}%`;
  el.resultBest.innerHTML = isNew
    ? `<span class="is-new">自己ベスト更新！ ${best}</span>`
    : `自己ベスト（${DIFFICULTIES[state.difficulty].label}）：${best}`;
  el.pauseOverlay.hidden = true;
  el.resultOverlay.hidden = false;

  refreshStartBest();
}

function pauseGame() {
  if (!state || !state.running) return;
  state.running = false;
  clearInterval(state.timerId);
  el.pauseOverlay.hidden = false;
}

function resumeGame() {
  if (!state) return;
  el.pauseOverlay.hidden = true;
  state.running = true;
  state.timerId = setInterval(tick, 1000);
  if (nativeInput && !nativeInput.hidden) {
    nativeInput.focus();
  }
}

function backToMenu() {
  if (state) clearInterval(state.timerId);
  state = null;
  el.pauseOverlay.hidden = true;
  el.resultOverlay.hidden = true;
  el.countdownOverlay.hidden = true;
  el.startOverlay.hidden = false;
  refreshStartBest();
}

el.startBtn.addEventListener("click", beginWithCountdown);
el.retryBtn.addEventListener("click", beginWithCountdown);
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

/* ---------- 入力方法の切り替え（専用キーボード / 端末のキーボード） ---------- */
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

  safeSet(KBD_MODE_KEY, mode);

  if (isNative && state && state.running) {
    nativeInput.focus();
  }
}

if (kbdToggle) {
  kbdToggle.querySelectorAll(".kbd-toggle-btn").forEach((btn) => {
    btn.addEventListener("click", () => setKbdMode(btn.dataset.mode));
  });
  setKbdMode(safeGet(KBD_MODE_KEY) || "custom");
}

// 端末純正キーボードからの入力（ローマ字・かなの両方に対応。1文字ずつ拾ってすぐ入力欄をクリアする）
if (nativeInput) {
  nativeInput.addEventListener("input", () => {
    const chars = nativeInput.value.match(/[a-zA-Z\u3041-\u309F\u30FC-]/g) || [];
    chars.forEach((ch) => typeChar(ch));
    nativeInput.value = "";
  });
}

/* ---------- 専用オンスクリーンキーボード（タップ操作） ---------- */
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