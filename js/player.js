const fastMove = 10;
const rateMove = 2;
const recordChunkSize = 5 * 1000; // seconds per chanck
const maxVideoLength = 60 * 10 ** 3;
const player = document.querySelector(".player");
const error = document.querySelector('.error');
const errorMessage = document.querySelector('.errorMessage');
const uploadedVideo = document.querySelector("input[type=file]");
const video = player.querySelector(".viewer");
const controls = player.querySelector(".player__controls");
const progress = player.querySelector(".progress");
const progressBar = player.querySelector(".progress__filled");
const toggleButton = player.querySelector(".togglePlayback");
const volume = player.querySelector(".playerVolume");
const fullscreen = player.querySelector(".toggleFullscreen");
const fastRewind = player.querySelector(".player__fastRewind");
const rateRewind = player.querySelector(".player__rateRewind");
const fastForward = player.querySelector(".player__fastForward");
const rateForward = player.querySelector(".player__rateForward");
const customInput = document.querySelector(".custom-file-upload");
const start = document.getElementById('start');
const stop = document.getElementById('stop');
const buttons = document.getElementById('btns');
let chunks = [];
let isError = false;
let media = {
    tag: 'video',
    type: 'video/webm',
    ext: '.mp4',
    gUM: {video: true, audio: true}
};
let stream;
let recorder;


/* Functions */
function togglePlay() {
    const icon = toggleButton.querySelector(".player__playbackIcon");
    video.paused ? video.play() : video.pause();
    icon.classList.toggle("player__playbackIcon--paused");
}

function handleRangeUpdate() {
    video[this.name] = this.value;
}

function handleProgress() {
    const percent = video.currentTime / video.duration * 100;
    progressBar.style.flexBasis = `${percent}%`;
}

function handleSeek(e) {
    const seekTime = e.offsetX / progress.offsetWidth * video.duration;
    video.currentTime = seekTime;
}

function handleRateRewind() {
    video.currentTime -= rateMove;
}

function handleFastRewind() {
    video.currentTime -= fastMove;
}

function handleRateForward() {
    video.currentTime += rateMove;
}

function handleFastForward() {
    video.currentTime += fastMove;
}

function handleUploadedVideo() {
    let file = uploadedVideo.files[0];
    let type = file.type.split('/');
    isError = false;
    if (type[type.length - 1] !== "mp4" && type[type.length - 1] !== "mov"){
        isError = true;
        error.style.display = "block";
        errorMessage.innerText += "Please upload .mp4/.mov video file only \n";
    }
    if (file.size / 1024**2 < 1){
        isError = true;
        error.style.display = "block";
        errorMessage.innerText += "Please upload 1mb file size minimum requirements \n";
    }
    if (file.size / 1024**2 > 10){
        isError = true;
        error.style.display = "block";
        errorMessage.innerText += "10mb file size max only";
    }
    if (!isError) {
        errorMessage.innerText = "";
        error.style.display = "none";
        video.src = URL.createObjectURL(file);
        customInput.innerHTML = "Change video";
    }
}

// Create fullscreen video button
function toggleFullscreen() {
    if (!document.webkitFullscreenElement) {
        if (video.requestFullScreen) {
            player.requestFullScreen();
        } else if (video.webkitRequestFullScreen) {
            player.webkitRequestFullScreen();
        } else if (video.mozRequestFullScreen) {
            player.mozRequestFullScreen();
        }
    } else {
        document.webkitExitFullscreen();
    }
}

var countrolsHideTimeout;

function toggleControls() {
    if (!video.paused) {
        clearTimeout(countrolsHideTimeout);
        controls.classList.add("player__controls--visible");
        countrolsHideTimeout = setTimeout(() => {
            controls.classList.remove("player__controls--visible");
        }, 3000);
    }
}

start.onclick = e => {
    navigator.mediaDevices.getUserMedia(media.gUM).then(_stream => {
        stop.disabled = false;
        stream = _stream;
        buttons.style.display = 'inherit';
        start.removeAttribute('disabled');
        recorder = new MediaRecorder(stream);
        recorder.ondataavailable = e => {
            chunks.push(e.data);
            if (chunks.length === maxVideoLength / recordChunkSize) {
                stop.click();
            }
        };
        recorder.start(recordChunkSize);
        recorder.onstop = () => {
            let blob = new Blob(chunks, {type: 'video'});
            video.src = URL.createObjectURL(blob);
            handleProgress();
            errorMessage.innerText = "";
            error.style.display = "none";
            stop.disabled = true;
        };
        start.disabled = true;
        stop.removeAttribute('disabled');
    }).catch(console.log);
};

stop.onclick = e => {
    stop.disabled = true;
    recorder.stop();
    stream.getTracks().forEach(function (track) {
        track.stop();
    });
    start.removeAttribute('disabled');
};


video.addEventListener("click", togglePlay);
video.addEventListener("timeupdate", handleProgress);

toggleButton.addEventListener("click", togglePlay);
fastForward.addEventListener("click", handleFastForward);
rateForward.addEventListener("click", handleRateForward);
fastRewind.addEventListener("click", handleFastRewind);
rateRewind.addEventListener("click", handleRateRewind);
volume.addEventListener("change", handleRangeUpdate);
volume.addEventListener("mousemove", handleRangeUpdate);

let mousedown = false;
progress.addEventListener("click", handleSeek);
progress.addEventListener("mousemove", e => mousedown && handleSeek(e));
progress.addEventListener("mousedown", () => (mousedown = true));
progress.addEventListener("mouseup", () => (mousedown = false));

fullscreen.addEventListener("click", toggleFullscreen);
video.addEventListener("dblclick", toggleFullscreen);

video.addEventListener("mousemove", toggleControls);
controls.addEventListener("mouseover", () => {
    clearTimeout(countrolsHideTimeout);
});

uploadedVideo.addEventListener('change', handleUploadedVideo);