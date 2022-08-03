// get DOM elements
const $audio = document.querySelector(".audio");
const $lyric_word = document.querySelector(".lyric-word");
const $lyric_line = document.querySelector(".lyric-line");

/////////////////////////////////////////////////////////////////////////////////////////

// create Liricle instance
const liricle = new Liricle();

// listen to on load event
liricle.on("load", data => {
      console.log(data);
});

// listen to on sync event
liricle.on("sync", (line, word) => {
      console.log("current line => ", line);
      console.log("current word => ", word);

      $lyric_line.innerText = line.text;
      // please always check the word value before using it.
      if (word) $lyric_word.innerText = word.text;
});

// load lyric
liricle.load({ url: "YOUR_LYRIC.lrc" });

// adjust lyric speed
// positive value => speed up
// negative value ​​=> slow down
liricle.offset = 200; // value in milliseconds.

$audio.addEventListener("timeupdate", () => {
    const time = $audio.currentTime;
    // sync lyric when the audio time updated
    liricle.sync(time, false);
});
