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

// ログ送信を有効にするか（フォーム準備できるまではfalseでOK）
const LOG_ENABLED = false;

// GoogleフォームのURL（/formResponse で終わるもの）
const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/ここにフォームID/formResponse";

// 各項目のエントリーID（例: "entry.123456789"）
const FIELD_ANSWER  = "entry.0000000001";   // 入力された答え
const FIELD_RESULT  = "entry.0000000002";   // 正解/不正解
const FIELD_ATTEMPT = "entry.0000000003";   // 何回目の挑戦か


//==============================
// 以下は基本触らなくてOK
//==============================

const answerInput   = document.getElementById("answerInput");
const submitBtn     = document.getElementById("submitBtn");
const attemptLabel  = document.getElementById("attemptCounter");
const resultArea    = document.getElementById("resultArea");

let attempts = 0;
let solved = false;

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
        showResult(true);
        lockForm();
    } else {
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
