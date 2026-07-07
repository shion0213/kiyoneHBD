//==============================
// 設定（ここだけ変更すればOK）
//==============================

// 正解
const ANSWER = "キッド";

// 正解時タイトル
const SUCCESS_TITLE = "正解だ。";

// 正解時メッセージ
const SUCCESS_MESSAGE = `
見事だ。

約束通り、
プレゼントは返却しよう。

後ろを見ろ。

── 回答キッド
`;

// 不正解タイトル
const FAIL_TITLE = "残念";

// 不正解メッセージ
const FAIL_MESSAGE = `
まだ真実には届かないようだ。

もう一度音声を聞いてみるといい。

── 回答キッド
`;


//==============================
// 以下は基本触らなくてOK
//==============================

const input = document.getElementById("answer");
const button = document.getElementById("submit");
const result = document.getElementById("result");

button.addEventListener("click", checkAnswer);

input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        checkAnswer();
    }
});

function checkAnswer() {

    const value = input.value.trim();

    if (value.length === 0) {
        showMessage(
            "入力されていない",
            "答えを入力してから挑戦してくれ。"
        );
        return;
    }

    if (normalize(value) === normalize(ANSWER)) {

        showMessage(
            SUCCESS_TITLE,
            SUCCESS_MESSAGE,
            true
        );

    } else {

        showMessage(
            FAIL_TITLE,
            FAIL_MESSAGE,
            false
        );

    }

}

function normalize(str){

    return str
        .trim()
        .toLowerCase()
        .replace(/\s/g,"")
        .replace(/　/g,"");

}

function showMessage(title,message,isSuccess=false){

    result.innerHTML = `
        <div class="resultTitle ${isSuccess ? "success" : "fail"}">
            ${title}
        </div>

        <div class="resultMessage">
            ${message.replace(/\n/g,"<br>")}
        </div>
    `;

    result.scrollIntoView({
        behavior:"smooth",
        block:"center"
    });

}