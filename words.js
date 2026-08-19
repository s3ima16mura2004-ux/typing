/* =========================================================
   words.js
   お題データ（難易度別の単語リスト）と難易度設定
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

const EXPERT_WORDS = [
  { word: "今宵限りの奇跡を起こせ",     kana: "こよいかぎりのきせきをおこせ",     romaji: ["koyoikagirinokisekiwookose"] },
  { word: "声援よ届け空の彼方まで",     kana: "せいえんよとどけそらのかなたまで", romaji: ["seienyotodokesoranokanatamade"] },
  { word: "忘れられない夜になる",       kana: "わすれられないよるになる",         romaji: ["wasurerarenaiyoruninaru"] },
  { word: "涙も汗も全部歌にする",       kana: "なみだもあせもぜんぶうたにする",   romaji: ["namidamoasemozenbuutanisuru"] },
  { word: "今この瞬間がすべて",         kana: "いまこのしゅんかんがすべて",       romaji: ["imakonoshunkangasubete"] },
  { word: "心の底から叫びたい",         kana: "こころのそこからさけびたい",       romaji: ["kokoronosokokarasakebitai"] },
  { word: "誰も知らない物語を歌う",     kana: "だれもしらないものがたりをうたう", romaji: ["daremoshiranaimonogatariwoutau"] },
  { word: "ステージの上だけが自由",     kana: "すてーじのうえだけがじゆう",       romaji: ["suteejinouedakegajiyuu"] },
  { word: "限界の先にある景色",         kana: "げんかいのさきにあるけしき",       romaji: ["genkainosakiniarukeshiki"] },
  { word: "一音一音に想いを込めて",     kana: "いちおんいちおんにおもいをこめて", romaji: ["ichionichionniomoiwokomete"] },
  { word: "今夜だけは主役でいさせて",   kana: "こんやだけはしゅやくでいさせて",   romaji: ["konyadakewashuyakudeisasete"] },
  { word: "客席まで届く声で叫ぶ",       kana: "きゃくせきまでとどくこえでさけぶ", romaji: ["kyakusekimadetodokukoedesakebu"] },
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

[EASY_WORDS, NORMAL_WORDS, HARD_WORDS, EXPERT_WORDS].forEach(expandWordList);

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
  expert: {
    label: "エキスパート",
    words: EXPERT_WORDS,
    correctHype: 2,
    missPenalty: 12,
  },
};

// コンボ数に応じたスコア倍率
const COMBO_TIERS = [
  { min: 8, mult: 2.0 },
  { min: 5, mult: 1.5 },
  { min: 3, mult: 1.2 },
  { min: 0, mult: 1.0 },
];