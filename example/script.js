const BASE_URL = "https://raw.githubusercontent.com/mcanam/assets/main/liricle-demo/";

// get DOM elements
const $audio = document.querySelector(".audio");
const $lyric_word = document.querySelector(".lyric-word");
const $lyric_line = document.querySelector(".lyric-line");

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

liricle.on("init", (data) => {
      console.log(data);
});

liricle.on("sync", (line, word) => {
      console.log("current line => ", line);
      console.log("current word => ", word);

      $lyric_line.innerText = line.text;
      
      // please always check the word value before using it.
      if (word != null) {
            $lyric_word.innerText = word.text;
      } 
});

// Sync lyric with audio

// positive value => speed up
// negative value ​​=> slow down
const offset = 0.2; // value in seconds.

// listen to the audio player when the time is updated.
$audio.addEventListener("timeupdate", () => {
      const time = $audio.currentTime;
      liricle.sync(time, offset); // <= sync lyric
});