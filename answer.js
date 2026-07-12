//==============================
// 設定（ここだけ変更すればOK）
//==============================

// 正解（複数指定可・表記ゆれはnormalizeで吸収）
const ANSWERS = ["ヘッドスパ", "へっどすぱ"];

// 挑戦できる回数
const MAX_ATTEMPTS = 3;

// 正解時のメッセージ
const SUCCESS_MESSAGE = `おめでとう。正解だ。
私としては残念だが
プレゼントを返そう。
もらった箱の「底」を
剥がしてみるといい。`;

//------------------------------
// Googleフォーム設定
// フォームを作ったら、この2つを書き換える
//------------------------------

// ログ送信を有効にするか
const LOG_ENABLED = true;

// GoogleフォームのURL（/formResponse で終わるもの）
const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSerux45OyBntEyMN_iDfUxO2xYrmKhgAXwEMtxebmN1dKvxyA/formResponse";

// 各項目のエントリーID
const FIELD_ANSWER  = "entry.1471133704";   // 答え
const FIELD_RESULT  = "entry.1252315385";   // 結果
const FIELD_ATTEMPT = "entry.683952145";    // 回数


//==============================
// 以下は基本触らなくてOK
//==============================

const answerInput   = document.getElementById("answerInput");
const submitBtn     = document.getElementById("submitBtn");
const attemptLabel  = document.getElementById("attemptCounter");
const resultArea    = document.getElementById("resultArea");

// localStorageのキー
const STORE_KEY = "yokokujo_answer_state";

let attempts = 0;
let solved = false;

// 保存された状態を読み込む
function loadState(){
    try {
        const saved = localStorage.getItem(STORE_KEY);
        if (!saved) return;
        const s = JSON.parse(saved);
        attempts = s.attempts || 0;
        solved   = s.solved || false;
    } catch(e){
        // 読み込めなくても続行
    }
}

// 状態を保存する
function saveState(){
    try {
        localStorage.setItem(STORE_KEY, JSON.stringify({ attempts, solved }));
    } catch(e){
        // 保存できなくても続行
    }
}

// ページを開いたとき、前回の状態を復元する
function restore(){

    loadState();
    updateCounter();

    if (solved){
        showResult(true);
        lockForm();
        return;
    }

    if (attempts >= MAX_ATTEMPTS){
        resultArea.innerHTML = `<div class="locked-note">挑戦回数の上限に達した。</div>`;
        lockForm();
    }
}

restore();

submitBtn.addEventListener("click", handleSubmit);

answerInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSubmit();
});

// 表記ゆれを吸収する（空白除去・カタカナ/ひらがな統一・大文字小文字）
function normalize(str){
    return str
        .trim()
        .replace(/[\s　]/g, "")
        .toLowerCase()
        // カタカナ → ひらがな に統一
        .replace(/[\u30a1-\u30f6]/g, m =>
            String.fromCharCode(m.charCodeAt(0) - 0x60)
        );
}

function isCorrect(value){
    const v = normalize(value);
    return ANSWERS.some(a => normalize(a) === v);
}

function handleSubmit(){

    if (solved) return;
    if (attempts >= MAX_ATTEMPTS) return;

    const raw = answerInput.value;

    if (raw.trim().length === 0){
        showResult(false, "答えを入力してくれ。", true);
        return;
    }

    attempts++;
    const correct = isCorrect(raw);

    updateCounter();

    // ログ送信（惜しい回答も後で見返せるように、毎回送る）
    sendLog(raw, correct ? "正解" : "不正解", attempts);

    if (correct){
        solved = true;
        saveState();
        showResult(true);
        lockForm();
    } else {
        saveState();
        showResult(false);
        if (attempts >= MAX_ATTEMPTS){
            lockForm();
        }
    }

    answerInput.value = "";
}

function updateCounter(){
    attemptLabel.textContent = `送信カウント：${attempts}/${MAX_ATTEMPTS}`;
}

function lockForm(){
    answerInput.disabled = true;
    submitBtn.disabled = true;
}

function showResult(correct, customText, isNotice){

    if (isNotice){
        resultArea.innerHTML = `<div class="attempt-counter">${customText}</div>`;
        return;
    }

    if (correct){

        resultArea.innerHTML = `
            <div class="result-title correct">正解！</div>
            <div class="result-message">${SUCCESS_MESSAGE.replace(/\n/g,"<br>")}</div>
        `;

    } else {

        let extra = "";
        if (attempts >= MAX_ATTEMPTS){
            extra = `<div class="locked-note">挑戦回数の上限に達した。</div>`;
        }

        resultArea.innerHTML = `
            <div class="result-title wrong">不正解！</div>
            ${extra}
        `;
    }

    resultArea.scrollIntoView({ behavior:"smooth", block:"center" });
}

// Googleフォームへログを送信する
function sendLog(answer, result, attemptNo){

    if (!LOG_ENABLED) return;

    const data = new FormData();
    data.append(FIELD_ANSWER,  answer);
    data.append(FIELD_RESULT,  result);
    data.append(FIELD_ATTEMPT, String(attemptNo));

    // no-corsで投げっぱなし（成功可否は取得できないが、記録はされる）
    fetch(GOOGLE_FORM_URL, {
        method: "POST",
        mode: "no-cors",
        body: data
    }).catch(() => { /* 送信失敗してもページ側は止めない */ });
}
