/* =========================================================
   online.js
   オンライン対戦（Firebase Firestore を使った部屋番号方式の1対1対戦）
   ※ game.js より後、flick-keyboard.js より前に読み込むこと。
   Firebase SDK（firebase-app-compat / firebase-firestore-compat）の
   読み込みに失敗していても、他の機能には影響しないようにガードしている。
   ========================================================= */

// King's Game（飲み会ゲーム）と同じFirebaseプロジェクトを間借りする。
// コレクション名を専用にして、既存のデータと混ざらないようにしている。
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCFHcgn-W7SZuEYFeKBHK4O_GYYoR9ztM8",
  authDomain: "king-s-game-69946.firebaseapp.com",
  projectId: "king-s-game-69946",
  storageBucket: "king-s-game-69946.firebasestorage.app",
  messagingSenderId: "77028177674",
  appId: "1:77028177674:web:7b2fb2f29323c25e0a2cf3",
};

const ONLINE_ROOMS_COLLECTION = "typing_duel_rooms";
const ONLINE_COUNTDOWN_MS = 3000;

let onlineDb = null;
let onlineActive = false; // 現在プレイ中のラウンドがオンライン対戦かどうか
let onlineMatch = null;   // { roomCode, role, unsubscribe, resultShown, countdownScheduled }
let firebaseReadyPromise = null; // 初期化を一度だけ行うためのPromise

// ---------- 要素参照（game.js の el オブジェクトに追加する） ----------
el.onlineBtn = document.getElementById("onlineBtn");
el.onlineMenuOverlay = document.getElementById("onlineMenuOverlay");
el.onlineCreateBtn = document.getElementById("onlineCreateBtn");
el.onlineJoinInput = document.getElementById("onlineJoinInput");
el.onlineJoinBtn = document.getElementById("onlineJoinBtn");
el.onlineMenuStatus = document.getElementById("onlineMenuStatus");
el.onlineMenuCloseBtn = document.getElementById("onlineMenuCloseBtn");
el.onlineWaitOverlay = document.getElementById("onlineWaitOverlay");
el.onlineRoomCodeDisplay = document.getElementById("onlineRoomCodeDisplay");
el.onlineWaitStatus = document.getElementById("onlineWaitStatus");
el.onlineReadyBtn = document.getElementById("onlineReadyBtn");
el.onlineCancelBtn = document.getElementById("onlineCancelBtn");
el.duelP1Label = document.getElementById("duelP1Label");
el.duelP2Label = document.getElementById("duelP2Label");

// ---------- Firebase初期化 ----------
// typing_duel_rooms コレクションはログイン不要（allow read, write: if true）の
// ルールにしているため、認証待ちは不要。SDKが読み込めていない環境では null を返し、
// 呼び出し側は安全に諦める。Promiseを返す形にしているのは、呼び出し側のコードを
// シンプルに保つため（将来ログイン必須に変える場合もここだけ直せばよい）。
function ensureFirebaseReady() {
  if (typeof firebase === "undefined") return null;
  if (firebaseReadyPromise) return firebaseReadyPromise;

  try {
    if (!firebase.apps || firebase.apps.length === 0) {
      firebase.initializeApp(FIREBASE_CONFIG);
    }
    onlineDb = firebase.firestore();
    firebaseReadyPromise = Promise.resolve(true);
    return firebaseReadyPromise;
  } catch (err) {
    return null;
  }
}

function roomRef(code) {
  return onlineDb.collection(ONLINE_ROOMS_COLLECTION).doc(code);
}

function generateRoomCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function showOnlineMenuError(message) {
  el.onlineMenuStatus.textContent = message;
  el.onlineMenuStatus.classList.add("error");
}

function clearOnlineMenuError() {
  el.onlineMenuStatus.textContent = "";
  el.onlineMenuStatus.classList.remove("error");
}

function showOnlineWaitError(message) {
  el.onlineWaitStatus.textContent = message;
  el.onlineWaitStatus.classList.add("error");
  el.onlineReadyBtn.hidden = true;
}

/* =========================================================
   部屋の作成・参加
   ========================================================= */

function openOnlineMenu() {
  el.startOverlay.hidden = true;
  el.onlineMenuOverlay.hidden = false;
  clearOnlineMenuError();
  el.onlineJoinInput.value = "";

  const ready = ensureFirebaseReady();
  if (!ready) {
    showOnlineMenuError("オンライン対戦の準備に失敗しました。通信環境を確認してもう一度開いてみてください。");
    return;
  }
  ready.catch((err) => {
    showOnlineMenuError(`準備に失敗しました：${err.message}`);
  });
}

function createOnlineRoom() {
  const ready = ensureFirebaseReady();
  if (!ready) {
    showOnlineMenuError("オンライン対戦の準備に失敗しました。");
    return;
  }
  clearOnlineMenuError();

  ready
    .then(() => {
      const code = generateRoomCode();
      const seed = Math.floor(Math.random() * 1e9);
      const difficulty = selectedDifficulty;

      return roomRef(code)
        .set({
          difficulty,
          seed,
          hostJoined: true,
          guestJoined: false,
          hostReady: false,
          guestReady: false,
          startAt: null,
          hostResult: null,
          guestResult: null,
          hostSabotageAt: null,
          guestSabotageAt: null,
          createdAt: Date.now(),
        })
        .then(() => {
          onlineMatch = { roomCode: code, role: "host", resultShown: false, countdownScheduled: false, lastSeenSabotage: null };
          showOnlineWaitScreen(code, true);
          attachRoomListener(code, "host");
        });
    })
    .catch((err) => {
      showOnlineMenuError(`部屋の作成に失敗しました：${err.message}`);
    });
}

function joinOnlineRoom() {
  const ready = ensureFirebaseReady();
  if (!ready) {
    showOnlineMenuError("オンライン対戦の準備に失敗しました。");
    return;
  }
  const code = el.onlineJoinInput.value.trim();
  if (!/^\d{4}$/.test(code)) {
    showOnlineMenuError("4桁の部屋番号を入力してください。");
    return;
  }
  clearOnlineMenuError();

  ready
    .then(() => {
      const ref = roomRef(code);
      return ref.get().then((doc) => {
        if (!doc.exists) {
          showOnlineMenuError("その部屋番号は見つかりません。");
          return null;
        }
        const data = doc.data();
        if (data.guestJoined) {
          showOnlineMenuError("その部屋はすでに満員です。");
          return null;
        }
        return ref.update({ guestJoined: true });
      });
    })
    .then((result) => {
      // ref.update() が成功すると undefined が返るのは正常なので、undefined を
      // エラー扱いにしてはいけない。エラー時だけ明示的に null を返しているので、
      // null かどうかだけで判定する（以前は undefined も弾いてしまい、参加が
      // 成功しているのに画面が進まないバグになっていた）。
      if (result === null) return; // 上でエラー表示済み、もしくは既存チェックで弾かれた
      onlineMatch = { roomCode: code, role: "guest", resultShown: false, countdownScheduled: false, lastSeenSabotage: null };
      showOnlineWaitScreen(code, false);
      attachRoomListener(code, "guest");
    })
    .catch((err) => {
      showOnlineMenuError(`参加に失敗しました：${err.message}`);
    });
}

function showOnlineWaitScreen(code, isHost) {
  el.onlineMenuOverlay.hidden = true;
  el.onlineRoomCodeDisplay.textContent = code;
  el.onlineWaitStatus.classList.remove("error");
  el.onlineWaitStatus.textContent = isHost
    ? "この番号を相手に伝えて、参加を待ちましょう。"
    : "参加しました。相手の様子を見ています…";
  el.onlineReadyBtn.hidden = false;
  el.duelRetryBtn.hidden = true; // オンライン対戦の結果画面では「もう一度」は使わない
  el.onlineWaitOverlay.hidden = false;
}

/* =========================================================
   部屋のリアルタイム監視（状態が変わるたびに呼ばれる）
   ========================================================= */

function attachRoomListener(code, role) {
  const unsubscribe = roomRef(code).onSnapshot(
    (doc) => {
      if (!doc.exists) {
        showOnlineWaitError("部屋が見つかりません。相手が退出した可能性があります。");
        return;
      }
      handleRoomUpdate(doc.data(), role);
    },
    (err) => {
      showOnlineWaitError(`接続エラーが発生しました：${err.message}`);
    }
  );
  onlineMatch.unsubscribe = unsubscribe;
}

function handleRoomUpdate(data, role) {
  if (!onlineMatch) return;

  // 相手からの妨害（コンボ節目で送られる軽い演出）を検知する
  const oppField = role === "host" ? "guestSabotageAt" : "hostSabotageAt";
  const oppSabotageAt = data[oppField];
  if (oppSabotageAt && oppSabotageAt !== onlineMatch.lastSeenSabotage) {
    onlineMatch.lastSeenSabotage = oppSabotageAt;
    if (typeof triggerSabotageEffect === "function") triggerSabotageEffect();
  }

  // 両者そろって、結果もそろっていれば最終結果を表示する
  if (data.hostResult && data.guestResult) {
    if (!onlineMatch.resultShown) {
      onlineMatch.resultShown = true;
      showOnlineFinalResult(data, role);
    }
    return;
  }

  // 開始時刻が決まっていれば、その時刻に合わせてカウントダウンを予約する
  if (data.startAt) {
    if (!onlineMatch.countdownScheduled) {
      onlineMatch.countdownScheduled = true;
      scheduleOnlineStart(data.startAt, data.seed, data.difficulty);
    }
    return;
  }

  if (!data.hostJoined || !data.guestJoined) {
    el.onlineWaitStatus.textContent = "相手の参加を待っています…";
    return;
  }

  // 両者参加済み・まだ両者readyではない
  const selfReady = role === "host" ? data.hostReady : data.guestReady;
  el.onlineWaitStatus.textContent = selfReady
    ? "相手の準備を待っています…"
    : "相手が参加しました！準備ができたらボタンを押してください。";
  el.onlineReadyBtn.hidden = !!selfReady;

  // ホストが両者readyを検知したら開始時刻をセットする（片方だけが決めることで競合を避ける）
  if (role === "host" && data.hostReady && data.guestReady && !data.startAt) {
    roomRef(onlineMatch.roomCode).update({ startAt: Date.now() + ONLINE_COUNTDOWN_MS }).catch(() => {});
  }
}

function scheduleOnlineStart(startAt, seed, difficulty) {
  const delay = Math.max(0, startAt - Date.now());
  el.onlineWaitOverlay.hidden = true;
  setTimeout(() => {
    if (!onlineMatch) return; // その間にキャンセルされていたら何もしない
    onlineActive = true;
    selectedDifficulty = difficulty; // 結果表示のラベルなどを部屋の設定に合わせる
    runCountdown(() => startGame(false, false, true, seed));
  }, delay);
}

/* =========================================================
   ラウンド終了時の処理（game.js の endGame から呼ばれる）
   ========================================================= */

// コンボの節目で相手に軽い妨害（画面が少し揺れる演出）を送る（game.js から呼ばれる）
function sendSabotage() {
  if (!onlineMatch) return;
  const field = onlineMatch.role === "host" ? { hostSabotageAt: Date.now() } : { guestSabotageAt: Date.now() };
  roomRef(onlineMatch.roomCode).update(field).catch(() => {});
}

function finishOnlineRound() {
  const result = { score: state.score, correct: state.correctChars, miss: state.missChars };
  const field = onlineMatch.role === "host" ? { hostResult: result } : { guestResult: result };

  roomRef(onlineMatch.roomCode)
    .update(field)
    .catch((err) => {
      showOnlineWaitError(`結果の送信に失敗しました：${err.message}`);
    });

  el.kbdArea.hidden = true;
  el.stage.classList.remove("compact");
  el.stage.classList.remove("final-spurt");
  el.duelPlayerBadge.hidden = true;
  el.onlineWaitStatus.classList.remove("error");
  el.onlineWaitStatus.textContent = "結果を送信しました。相手の結果を待っています…";
  el.onlineReadyBtn.hidden = true;
  el.onlineWaitOverlay.hidden = false;
  onlineActive = false;
}

function showOnlineFinalResult(data, role) {
  const self = role === "host" ? data.hostResult : data.guestResult;
  const opp = role === "host" ? data.guestResult : data.hostResult;

  el.duelP1Label.textContent = "あなた";
  el.duelP2Label.textContent = "相手";
  el.duelP1Score.textContent = self.score;
  el.duelP1Sub.textContent = `正打${self.correct} / ミス${self.miss}`;
  el.duelP2Score.textContent = opp.score;
  el.duelP2Sub.textContent = `正打${opp.correct} / ミス${opp.miss}`;
  el.duelP1Card.classList.toggle("winner", self.score > opp.score);
  el.duelP2Card.classList.toggle("winner", opp.score > self.score);

  if (self.score === opp.score) {
    el.duelWinnerTitle.textContent = "🤝 引き分け！";
  } else {
    el.duelWinnerTitle.textContent = self.score > opp.score ? "🎉 あなたの勝ち！" : "😢 相手の勝ち！";
  }

  el.onlineWaitOverlay.hidden = true;
  el.duelResultOverlay.hidden = false;
  cleanupOnlineRoom();
}

function cleanupOnlineRoom() {
  if (onlineMatch) {
    if (onlineMatch.unsubscribe) onlineMatch.unsubscribe();
    if (onlineMatch.role === "host" && onlineMatch.roomCode) {
      roomRef(onlineMatch.roomCode).delete().catch(() => {});
    }
  }
  onlineActive = false;
  onlineMatch = null;
}

function cancelOnlineMatch() {
  cleanupOnlineRoom();
  el.onlineWaitOverlay.hidden = true;
  el.onlineMenuOverlay.hidden = true;
  el.startOverlay.hidden = false;
}

/* =========================================================
   ボタンの配線
   ========================================================= */

if (el.onlineBtn) el.onlineBtn.addEventListener("click", openOnlineMenu);
if (el.onlineMenuCloseBtn) {
  el.onlineMenuCloseBtn.addEventListener("click", () => {
    el.onlineMenuOverlay.hidden = true;
    el.startOverlay.hidden = false;
  });
}
if (el.onlineCreateBtn) el.onlineCreateBtn.addEventListener("click", createOnlineRoom);
if (el.onlineJoinBtn) el.onlineJoinBtn.addEventListener("click", joinOnlineRoom);
if (el.onlineReadyBtn) {
  el.onlineReadyBtn.addEventListener("click", () => {
    if (!onlineMatch) return;
    const field = onlineMatch.role === "host" ? { hostReady: true } : { guestReady: true };
    roomRef(onlineMatch.roomCode).update(field).catch(() => {});
    el.onlineReadyBtn.hidden = true;
  });
}
if (el.onlineCancelBtn) el.onlineCancelBtn.addEventListener("click", cancelOnlineMatch);

// 数字のみ入力させる
if (el.onlineJoinInput) {
  el.onlineJoinInput.addEventListener("input", () => {
    el.onlineJoinInput.value = el.onlineJoinInput.value.replace(/[^0-9]/g, "").slice(0, 4);
  });
}

// ローカル2人対戦の結果画面に戻ったときのため、ラベルを毎回既定値に戻しておく
const _originalShowDuelFinalResult = showDuelFinalResult;
showDuelFinalResult = function () {
  el.duelP1Label.textContent = "プレイヤー1";
  el.duelP2Label.textContent = "プレイヤー2";
  el.duelRetryBtn.hidden = false;
  _originalShowDuelFinalResult();
};

// duelBackBtn はローカル対戦・オンライン対戦の両方から使われる。
// game.js側で既にbackToMenu()を呼ぶリスナーが登録されているので、
// ここではオンラインの部屋の後片付けだけを追加で行う。
el.duelBackBtn.addEventListener("click", cleanupOnlineRoom);