/* =========================================================
   titles.js
   称号（実績）システム — 条件を満たすと解放される称号の定義と判定ロジック
   ※ audio.js の safeGet / safeSet より後に読み込むこと。
   各称号には「item」（獲得すると増える収集アイテムの絵文字）も持たせている。
   ========================================================= */

const TITLES_KEY = "karaokeTyping.unlockedTitles";
const STATS_KEY = "karaokeTyping.stats";

// ctx: そのラウンドの結果
//   score/correctChars/missChars/difficulty/practice/isDaily/isWeak/maxCombo/
//   usedKana/usedRomaji/hour/bossWordCleared/fastestWordMs/feverUsesThisRound/isRankingFirst
// stats: 累計の記録（totalPlays/totalPracticePlays/difficultiesCleared/feverUses など）
const TITLES = [
  {
    id: "first_stage",
    name: "初舞台",
    desc: "はじめてステージを完走した",
    item: "🎤",
    check: () => true,
  },
  {
    id: "no_miss",
    name: "無傷クリア",
    desc: "ノーミスでクリアした",
    item: "💎",
    check: (ctx) => !ctx.practice && ctx.missChars === 0 && ctx.correctChars > 0,
  },
  {
    id: "cautious",
    name: "慎重派",
    desc: "ミスを1回以下に抑えてクリアした",
    item: "🛡️",
    check: (ctx) => !ctx.practice && ctx.missChars <= 1 && ctx.correctChars > 0,
  },
  {
    id: "expert_clear",
    name: "エキスパート制覇",
    desc: "エキスパート難易度でクリアした",
    item: "👑",
    check: (ctx) => !ctx.practice && ctx.difficulty === "expert",
  },
  {
    id: "kana_master",
    name: "かな一筋",
    desc: "ローマ字を一切使わず、かな入力だけでクリアした",
    item: "🎹",
    check: (ctx) => !ctx.practice && ctx.usedKana && !ctx.usedRomaji && ctx.correctChars > 0,
  },
  {
    id: "midnight",
    name: "夜更かし列伝",
    desc: "深夜0時〜4時にプレイした",
    item: "🌙",
    check: (ctx) => ctx.hour >= 0 && ctx.hour < 4,
  },
  {
    id: "combo_king",
    name: "コンボ王",
    desc: "コンボ8以上に到達した",
    item: "🌈",
    check: (ctx) => ctx.maxCombo >= 8,
  },
  {
    id: "keizoku",
    name: "継続は力なり",
    desc: "累計10回プレイした",
    item: "🥁",
    check: (ctx, stats) => (stats.totalPlays || 0) + (stats.totalPracticePlays || 0) >= 10,
  },
  {
    id: "practice_lover",
    name: "練習の虫",
    desc: "練習モードを5回以上プレイした",
    item: "📔",
    check: (ctx, stats) => (stats.totalPracticePlays || 0) >= 5,
  },
  {
    id: "score_200",
    name: "見習いシンガー",
    desc: "スコア200点以上を記録した",
    item: "🎧",
    check: (ctx) => !ctx.practice && ctx.score >= 200,
  },
  {
    id: "score_500",
    name: "頼れるバンドマン",
    desc: "スコア500点以上を記録した",
    item: "🎸",
    check: (ctx) => !ctx.practice && ctx.score >= 500,
  },
  {
    id: "score_900",
    name: "ライブの主役",
    desc: "スコア900点以上を記録した",
    item: "💡",
    check: (ctx) => !ctx.practice && ctx.score >= 900,
  },
  {
    id: "score_1400",
    name: "伝説のボーカリスト",
    desc: "スコア1400点以上を記録した",
    item: "👑",
    check: (ctx) => !ctx.practice && ctx.score >= 1400,
  },
  {
    id: "all_difficulty",
    name: "全難易度制覇",
    desc: "かんたん・ふつう・むずかしい・エキスパート、すべてでクリアした",
    item: "🏆",
    check: (ctx, stats) => {
      const cleared = stats.difficultiesCleared || {};
      return ["easy", "normal", "hard", "expert"].every((d) => cleared[d]);
    },
  },
  {
    id: "daily_clear",
    name: "デイリー制覇",
    desc: "今日のステージ（デイリーチャレンジ）をクリアした",
    item: "🗓️",
    check: (ctx) => !!ctx.isDaily,
  },
  {
    id: "streak_7",
    name: "常連ボーカリスト",
    desc: "デイリーチャレンジに7日連続で挑戦した",
    item: "🔥",
    check: (ctx, stats) => (stats.dailyStreak || 0) >= 7,
  },
  {
    id: "boss_breaker",
    name: "ボスブレイカー",
    desc: "ボスワードを打ち切った",
    item: "⚔️",
    check: (ctx) => !!ctx.bossWordCleared,
  },
  {
    id: "fever_addict",
    name: "フィーバー中毒",
    desc: "フィーバースキルを累計10回発動した",
    item: "🔥",
    check: (ctx, stats) => (stats.feverUses || 0) >= 10,
  },
  {
    id: "speed_demon",
    name: "爆速シンガー",
    desc: "1つのお題を1.5秒以内に打ち切った",
    item: "⚡",
    check: (ctx) => typeof ctx.fastestWordMs === "number" && ctx.fastestWordMs <= 1500,
  },
  {
    id: "king_of_ranking",
    name: "王座奪還",
    desc: "ローカルランキングで1位になった",
    item: "👑",
    check: (ctx) => !!ctx.isRankingFirst,
  },
  {
    id: "perfect_streak_10",
    name: "完璧主義",
    desc: "10単語連続でノーミスで打ち切った",
    item: "💎",
    check: (ctx) => (ctx.maxNoMissStreak || 0) >= 10,
  },
  {
    id: "encore_word",
    name: "アンコール！",
    desc: "同じお題を連続で成功させた",
    item: "🎤",
    check: (ctx) => (ctx.encoreWordStreak || 0) >= 1,
  },
  {
    id: "clutch_thousand",
    name: "ギリギリの天才",
    desc: "残り3秒以内にスコア1000点に到達した",
    item: "💀",
    check: (ctx) => !!ctx.clutchThousand,
  },
  {
    id: "combo_100",
    name: "コンボマスター",
    desc: "コンボ100に到達した（激レア）",
    item: "🎯",
    check: (ctx) => ctx.maxCombo >= 100,
  },
  {
    id: "kana_500",
    name: "かな乗り",
    desc: "かな入力だけでスコア500点以上を記録した",
    item: "🎹",
    check: (ctx) => !ctx.practice && ctx.usedKana && !ctx.usedRomaji && ctx.score >= 500,
  },
  {
    id: "full_live",
    name: "フルライブ！",
    desc: "コンボ40に到達し、バンド演奏をフル編成にした",
    item: "🎶",
    check: (ctx) => ctx.maxCombo >= 40,
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

// 獲得済みの称号アイテム（コレクション）の一覧を返す
function getCollectedItems() {
  const unlocked = new Set(loadUnlockedTitles());
  return TITLES.filter((t) => unlocked.has(t.id)).map((t) => t.item);
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

  // フィーバースキルの累計発動回数を加算する
  if (ctx.feverUsesThisRound) {
    stats.feverUses = (stats.feverUses || 0) + ctx.feverUsesThisRound;
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