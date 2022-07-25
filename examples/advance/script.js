const BASE_URL = "https://raw.githubusercontent.com/mcanam/assets/main/liricle-demo/";

// get DOM elements
const $audio = document.querySelector(".audio");

const $lyric_alternating_lines = document.querySelectorAll(".line");

// load audio
$audio.src = BASE_URL + "audio.mp3";

/////////////////////////////////////////////////////////////////////////////////////////

// Create Liricle instance

const liricle = new Liricle();

// Initialize Liricle

liricle.init({
    url: BASE_URL + "lyric-enhanced.lrc"
});

// Listening Liricle events
let lyrics_data = null;
liricle.on("init", (data) => {
    console.log(data);
    lyrics_data = data;
});

liricle.on("sync", (line, word) => {
    console.log("current line => ", line);
    console.log("current word => ", word);

    let filling_line_index = line.index % 2;
   
    let em_curr_line = $lyric_alternating_lines[filling_line_index];
    let em_next_line = $lyric_alternating_lines[1 - filling_line_index];
    
    em_curr_line.children[0].innerText = line.text;
    em_curr_line.children[1].innerText = line.text;
    em_curr_line.children[1].style = "width: 0px";
    
    let next_line = lyrics_data.lines[line.index + 1];

    if (next_line) {
        em_next_line.children[0].innerText = next_line.text;
    } else {
        em_next_line.children[0].innerText = "";
    }

    em_next_line.children[1].innerText = "";
    em_next_line.children[1].style = "width: 0px";

    // please always check the word value before using it.
    if (word) {
        let total_fill_time = $audio.currentTime - line.time;

        let words = lyrics_data.lines[line.index].words;
        let last_word_time = words[words.length - 1].time;
        let total_line_time = last_word_time - line.time;
        if (total_line_time == 0 && next_line) {
            total_line_time = next_line.time - line.time;
        }

        let fill_width = Math.min(1, total_fill_time / total_line_time) * em_curr_line.children[0].offsetWidth;

        em_curr_line.children[1].style = "width: "+ fill_width + "px";
    }
});

// Sync lyric with audio

// positive value => speed up
// negative value ​​=> slow down
const offset = 0.2; // value in seconds.

// listen to the audio player when the time is updated.
// $audio.addEventListener("timeupdate", () => {
//     const time = $audio.currentTime;
//     liricle.sync(time, offset, true); // <= sync lyric
// });
let stillPlaying = false;

function sync(timestamp){
    if (stillPlaying == false) return;
    const time = $audio.currentTime;
    liricle.sync(time, offset, true); // <= sync lyric
    requestAnimationFrame(sync);
}

$audio.addEventListener("play", (e) => {
    stillPlaying = true;
    requestAnimationFrame(sync);
});

$audio.addEventListener("pause", (e) => {
    stillPlaying = false;
});

$audio.addEventListener("ended", (e) => {
    stillPlaying = false;
});
