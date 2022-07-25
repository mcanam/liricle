// get DOM elements
const $audio = document.querySelector(".audio");
const $lyric_word = document.querySelector(".lyric-word");
const $lyric_line = document.querySelector(".lyric-line");

/////////////////////////////////////////////////////////////////////////////////////////

// create Liricle instance

const liricle = new Liricle();

// initialize Liricle

liricle.init({
      url: "YOUR_LYRIC.lrc"
});

// listen to liricle events

liricle.on("init", data => {
      console.log(data);
      // do something...
});

liricle.on("sync", (line, word) => {
      console.log("current line => ", line);
      console.log("current word => ", word);

      $lyric_line.innerText = line.text;

      // please always check the word value before using it.
      if (word) $lyric_word.innerText = word.text;
});

// Sync lyric with audio

// positive value => speed up
// negative value ​​=> slow down
const offset = 0; // value in seconds.

// listen to the audio player when the time is updated.
$audio.addEventListener("timeupdate", () => {
    const time = $audio.currentTime;
    liricle.sync(time, offset, false); // <= sync lyric
});
