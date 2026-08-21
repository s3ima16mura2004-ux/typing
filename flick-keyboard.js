/* =========================================================
   flick-keyboard.js
   専用オンスクリーンキーボード（かな・端末のフリック入力と同じ形）
   端末のフリック配列（あ・か・さ / た・な・は / ま・や・ら / 小・わ・ー）を再現。
   指を離さず上下左右にフリックした方向で母音を直接選び、
   「゛゜小」キーで濁点・半濁点・小文字に変換する。
   ※ game.js が定義する typeChar / flickKb / flickCancelPending に依存するため、
      index.html では game.js の後に読み込むこと。
   ========================================================= */

const GYOU_CYCLES = {
  "あ": ["あ", "い", "う", "え", "お"],
  "か": ["か", "き", "く", "け", "こ"],
  "さ": ["さ", "し", "す", "せ", "そ"],
  "た": ["た", "ち", "つ", "て", "と"],
  "な": ["な", "に", "ぬ", "ね", "の"],
  "は": ["は", "ひ", "ふ", "へ", "ほ"],
  "ま": ["ま", "み", "む", "め", "も"],
  "や": ["や", "ゆ", "よ"],
  "ら": ["ら", "り", "る", "れ", "ろ"],
  "わ": ["わ", "を", "ん"],
};

const KANA_FORMS = {
  "あ": ["あ", "ぁ"], "い": ["い", "ぃ"], "う": ["う", "ぅ"], "え": ["え", "ぇ"], "お": ["お", "ぉ"],
  "か": ["か", "が"], "き": ["き", "ぎ"], "く": ["く", "ぐ"], "け": ["け", "げ"], "こ": ["こ", "ご"],
  "さ": ["さ", "ざ"], "し": ["し", "じ"], "す": ["す", "ず"], "せ": ["せ", "ぜ"], "そ": ["そ", "ぞ"],
  "た": ["た", "だ"], "ち": ["ち", "ぢ"], "つ": ["つ", "っ", "づ"], "て": ["て", "で"], "と": ["と", "ど"],
  "な": ["な"], "に": ["に"], "ぬ": ["ぬ"], "ね": ["ね"], "の": ["の"],
  "は": ["は", "ば", "ぱ"], "ひ": ["ひ", "び", "ぴ"], "ふ": ["ふ", "ぶ", "ぷ"], "へ": ["へ", "べ", "ぺ"], "ほ": ["ほ", "ぼ", "ぽ"],
  "ま": ["ま"], "み": ["み"], "む": ["む"], "め": ["め"], "も": ["も"],
  "や": ["や", "ゃ"], "ゆ": ["ゆ", "ゅ"], "よ": ["よ", "ょ"],
  "ら": ["ら"], "り": ["り"], "る": ["る"], "れ": ["れ"], "ろ": ["ろ"],
  "わ": ["わ", "ゎ"], "を": ["を"], "ん": ["ん"],
};

// 方向フリック → 母音のマッピング（実機のフリック配列と同じ: 上=う 左=い 右=え 下=お、動かさなければ基本母音）
const FLICK_DIR_MAP = {
  "あ": { tap: 0, left: 1, up: 2, right: 3, down: 4 },
  "か": { tap: 0, left: 1, up: 2, right: 3, down: 4 },
  "さ": { tap: 0, left: 1, up: 2, right: 3, down: 4 },
  "た": { tap: 0, left: 1, up: 2, right: 3, down: 4 },
  "な": { tap: 0, left: 1, up: 2, right: 3, down: 4 },
  "は": { tap: 0, left: 1, up: 2, right: 3, down: 4 },
  "ま": { tap: 0, left: 1, up: 2, right: 3, down: 4 },
  "ら": { tap: 0, left: 1, up: 2, right: 3, down: 4 },
  "や": { tap: 0, up: 1, down: 2 },   // や(tap) / ゆ(上) / よ(下)
  "わ": { tap: 0, left: 1, up: 2, right: "long" }, // わ(tap) / を(左) / ん(上) / ー(右)
};

const FLICK_COMMIT_DELAY = 750;
const FLICK_DISTANCE_THRESHOLD = 20; // これ以上動いたらフリックと判定する（px）

if (flickKb) {
  const flickPreview = document.getElementById("flickPreview");
  const flickModKey = document.getElementById("flickModKey");
  const flickLongKey = document.getElementById("flickLongKey");

  let pendingRow = null;      // 現在選択中のキー（例: "か"）
  let pendingVowelIndex = 0;  // フリックで選んだ母音の位置
  let pendingFormIndex = 0;   // 濁点・半濁点・小文字のバリエーション位置
  let commitTimer = null;

  function currentPendingChar() {
    if (!pendingRow) return null;
    const base = GYOU_CYCLES[pendingRow][pendingVowelIndex];
    const forms = KANA_FORMS[base] || [base];
    return forms[pendingFormIndex % forms.length];
  }

  function updatePreview() {
    const ch = currentPendingChar();
    if (ch) {
      flickPreview.textContent = ch;
      flickPreview.classList.remove("empty");
    } else {
      flickPreview.textContent = "";
      flickPreview.classList.add("empty");
    }
  }

  function clearCommitTimer() {
    if (commitTimer) {
      clearTimeout(commitTimer);
      commitTimer = null;
    }
  }

  function commitPending() {
    clearCommitTimer();
    const ch = currentPendingChar();
    if (ch) typeChar(ch);
    pendingRow = null;
    pendingVowelIndex = 0;
    pendingFormIndex = 0;
    updatePreview();
  }

  function scheduleCommit() {
    clearCommitTimer();
    commitTimer = setTimeout(commitPending, FLICK_COMMIT_DELAY);
  }

  flickCancelPending = () => {
    clearCommitTimer();
    pendingRow = null;
    pendingVowelIndex = 0;
    pendingFormIndex = 0;
    updatePreview();
  };

  // フリック方向で母音を直接選択する（タップ＝基本母音、上下左右＝う・い・え・お系）
  // 新しいキー操作が来た時点で、行が同じか違うかにかかわらず、直前に入力中だった文字を必ず確定する。
  // （同じ行かどうかで判定を分けていたため、「つづく」のように同じ行の文字が連続すると
  // 　1文字目が確定されずに消えてしまうバグがあったため修正）
  function selectVowel(row, vowelIndex) {
    if (pendingRow) {
      commitPending();
    }
    pendingRow = row;
    pendingVowelIndex = vowelIndex;
    pendingFormIndex = 0; // 母音を選び直したら濁点等の状態はリセット
    updatePreview();
    scheduleCommit();
  }

  function detectDirection(dx, dy) {
    const dist = Math.hypot(dx, dy);
    if (dist < FLICK_DISTANCE_THRESHOLD) return "tap";
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? "right" : "left";
    }
    return dy > 0 ? "down" : "up";
  }

  function pressModifier() {
    if (!pendingRow) return; // 入力中の文字がなければ何もしない
    const base = GYOU_CYCLES[pendingRow][pendingVowelIndex];
    const forms = KANA_FORMS[base] || [base];
    pendingFormIndex = (pendingFormIndex + 1) % forms.length;
    updatePreview();
    scheduleCommit();
  }

  function pressLongVowel() {
    if (pendingRow) commitPending();
    typeChar("-");
  }

  flickKb.querySelectorAll(".flick-key[data-row]").forEach((btn) => {
    const row = btn.dataset.row;
    const dirMap = FLICK_DIR_MAP[row] || { tap: 0 };
    let startX = 0;
    let startY = 0;

    btn.addEventListener("pointerdown", (e) => {
      btn.classList.add("pressed");
      startX = e.clientX;
      startY = e.clientY;
      try { btn.setPointerCapture(e.pointerId); } catch (err) { /* 対応外環境は無視 */ }
    });

    btn.addEventListener("pointerup", (e) => {
      btn.classList.remove("pressed");
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const direction = detectDirection(dx, dy);
      const target = dirMap[direction] !== undefined ? dirMap[direction] : 0;

      if (target === "long") {
        // わ行の右フリック：長音「ー」を直接入力する
        if (pendingRow) commitPending();
        typeChar("-");
        return;
      }
      selectVowel(row, target);
    });

    btn.addEventListener("pointercancel", () => btn.classList.remove("pressed"));
  });

  flickModKey.addEventListener("pointerdown", () => flickModKey.classList.add("pressed"));
  flickModKey.addEventListener("pointerup", () => flickModKey.classList.remove("pressed"));
  flickModKey.addEventListener("pointerleave", () => flickModKey.classList.remove("pressed"));
  flickModKey.addEventListener("click", (e) => {
    e.preventDefault();
    pressModifier();
  });

  flickLongKey.addEventListener("pointerdown", () => flickLongKey.classList.add("pressed"));
  flickLongKey.addEventListener("pointerup", () => flickLongKey.classList.remove("pressed"));
  flickLongKey.addEventListener("pointerleave", () => flickLongKey.classList.remove("pressed"));
  flickLongKey.addEventListener("click", (e) => {
    e.preventDefault();
    pressLongVowel();
  });
}