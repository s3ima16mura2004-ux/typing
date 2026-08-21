/* =========================================================
   titles.js
   称号（実績）システム — 条件を満たすと解放される称号の定義と判定ロジック
   ※ audio.js の safeGet / safeSet より後に読み込むこと。
   ========================================================= */

const TITLES_KEY = "karaokeTyping.unlockedTitles";
const STATS_KEY = "karaokeTyping.stats";

// ctx: そのラウンドの結果（score/correctChars/missChars/difficulty/practice/isDaily/maxCombo/usedKana/usedRomaji/hour）
// stats: 累計の記録（totalPlays/totalPracticePlays/difficultiesCleared）
const TITLES = [
  {
    id: "first_stage",
    name: "初舞台",
    desc: "はじめてステージを完走した",
    check: () => true,
  },
  {
    id: "no_miss",
    name: "無傷クリア",
    desc: "ノーミスでクリアした",
    check: (ctx) => !ctx.practice && ctx.missChars === 0 && ctx.correctChars > 0,
  },
  {
    id: "expert_clear",
    name: "エキスパート制覇",
    desc: "エキスパート難易度でクリアした",
    check: (ctx) => !ctx.practice && ctx.difficulty === "expert",
  },
  {
    id: "kana_master",
    name: "かな一筋",
    desc: "ローマ字を一切使わず、かな入力だけでクリアした",
    check: (ctx) => !ctx.practice && ctx.usedKana && !ctx.usedRomaji && ctx.correctChars > 0,
  },
  {
    id: "midnight",
    name: "夜更かし列伝",
    desc: "深夜0時〜4時にプレイした",
    check: (ctx) => ctx.hour >= 0 && ctx.hour < 4,
  },
  {
    id: "combo_king",
    name: "コンボ王",
    desc: "コンボ8以上に到達した",
    check: (ctx) => ctx.maxCombo >= 8,
  },
  {
    id: "keizoku",
    name: "継続は力なり",
    desc: "累計10回プレイした",
    check: (ctx, stats) => (stats.totalPlays || 0) + (stats.totalPracticePlays || 0) >= 10,
  },
  {
    id: "practice_lover",
    name: "練習の虫",
    desc: "練習モードを5回以上プレイした",
    check: (ctx, stats) => (stats.totalPracticePlays || 0) >= 5,
  },
  {
    id: "score_200",
    name: "見習いシンガー",
    desc: "スコア200点以上を記録した",
    check: (ctx) => !ctx.practice && ctx.score >= 200,
  },
  {
    id: "score_500",
    name: "頼れるバンドマン",
    desc: "スコア500点以上を記録した",
    check: (ctx) => !ctx.practice && ctx.score >= 500,
  },
  {
    id: "score_900",
    name: "ライブの主役",
    desc: "スコア900点以上を記録した",
    check: (ctx) => !ctx.practice && ctx.score >= 900,
  },
  {
    id: "score_1400",
    name: "伝説のボーカリスト",
    desc: "スコア1400点以上を記録した",
    check: (ctx) => !ctx.practice && ctx.score >= 1400,
  },
  {
    id: "all_difficulty",
    name: "全難易度制覇",
    desc: "かんたん・ふつう・むずかしい・エキスパート、すべてでクリアした",
    check: (ctx, stats) => {
      const cleared = stats.difficultiesCleared || {};
      return ["easy", "normal", "hard", "expert"].every((d) => cleared[d]);
    },
  },
  {
    id: "daily_clear",
    name: "デイリー制覇",
    desc: "今日のステージ（デイリーチャレンジ）をクリアした",
    check: (ctx) => !!ctx.isDaily,
  },
  {
    id: "streak_7",
    name: "常連ボーカリスト",
    desc: "デイリーチャレンジに7日連続で挑戦した",
    check: (ctx, stats) => (stats.dailyStreak || 0) >= 7,
  },
];

function loadUnlockedTitles() {
  try {
    return JSON.parse(safeGet(TITLES_KEY)) || [];
  } catch (err) {
    return [];
  }
}

function saveUnlockedTitles(arr) {
  safeSet(TITLES_KEY, JSON.stringify(arr));
}

function loadStats() {
  try {
    return JSON.parse(safeGet(STATS_KEY)) || { totalPlays: 0, totalPracticePlays: 0, difficultiesCleared: {} };
  } catch (err) {
    return { totalPlays: 0, totalPracticePlays: 0, difficultiesCleared: {} };
  }
}

function saveStats(stats) {
  safeSet(STATS_KEY, JSON.stringify(stats));
}

function getDailyStreak() {
  return loadStats().dailyStreak || 0;
}

// そのラウンドの結果を元に、累計記録を更新し、新しく解放された称号を返す
function evaluateTitles(ctx) {
  const stats = loadStats();

  if (ctx.practice) {
    stats.totalPracticePlays = (stats.totalPracticePlays || 0) + 1;
  } else {
    stats.totalPlays = (stats.totalPlays || 0) + 1;
    stats.difficultiesCleared = stats.difficultiesCleared || {};
    stats.difficultiesCleared[ctx.difficulty] = true;
  }

  // デイリーチャレンジの連続挑戦日数（ストリーク）を更新する
  if (ctx.isDaily) {
    const today = ctx.date.slice(0, 10);
    if (stats.lastDailyDate !== today) {
      const y = new Date(ctx.date);
      y.setDate(y.getDate() - 1);
      const yesterday = y.toISOString().slice(0, 10);
      stats.dailyStreak = stats.lastDailyDate === yesterday ? (stats.dailyStreak || 0) + 1 : 1;
      stats.lastDailyDate = today;
    }
    // 同じ日に何度再挑戦してもストリークは変えない
  }

  saveStats(stats);

  const unlockedSet = new Set(loadUnlockedTitles());
  const newly = [];

  TITLES.forEach((t) => {
    if (unlockedSet.has(t.id)) return;
    if (t.check(ctx, stats)) {
      unlockedSet.add(t.id);
      newly.push(t);
    }
  });

  if (newly.length) saveUnlockedTitles(Array.from(unlockedSet));
  return newly;
}