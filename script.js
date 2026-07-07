const audio = document.getElementById("audioEl");
const playBtn = document.getElementById("playBtn");
const iconPlay = playBtn.querySelector(".icon-play");
const iconPause = playBtn.querySelector(".icon-pause");
const track = document.getElementById("progressTrack");
const fill = document.getElementById("progressFill");
const timeLabel = document.getElementById("timeLabel");

function formatTime(sec){
    if (!isFinite(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
}

playBtn.addEventListener("click", () => {
    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }
});

audio.addEventListener("play", () => {
    iconPlay.style.display = "none";
    iconPause.style.display = "block";
});

audio.addEventListener("pause", () => {
    iconPlay.style.display = "block";
    iconPause.style.display = "none";
});

audio.addEventListener("timeupdate", () => {
    const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    fill.style.width = pct + "%";
    timeLabel.textContent = formatTime(audio.currentTime);
});

audio.addEventListener("loadedmetadata", () => {
    timeLabel.textContent = formatTime(audio.duration);
});

audio.addEventListener("ended", () => {
    iconPlay.style.display = "block";
    iconPause.style.display = "none";
});

track.addEventListener("click", (e) => {
    const rect = track.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    if (audio.duration) {
        audio.currentTime = ratio * audio.duration;
    }
});
