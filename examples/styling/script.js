// get lyrics wrapper element
const $lyricswrapper = document.querySelector('.lyrics-wrapper');
// to store lyric line elements
const $lyricLines = [];
// get audio element
const $player = document.querySelector('.player');
// create liricle instance
const liricle = new Liricle();
// to store current active line index
let currActiveLineIndex = null;

// function to render lyric line on the wrapper
function renderLyricLine(lineData) {
      const $lyricLine = document.createElement('div');

      $lyricLine.className = 'lyrics-line';
      $lyricLine.innerText = lineData.text;

      $lyricswrapper.appendChild($lyricLine);
      $lyricLines.push($lyricLine);
}

// function to automatically scroll the lyrics wrapper to the active lyric line
function scrollToActiveLine() {
      // get the currently active line element based on the active line index
      const $activeLine = $lyricLines[currActiveLineIndex];
      // calculate the vertical center of the lyrics wrapper
      const wrapperOffsetHeight = $lyricswrapper.offsetHeight / 2;
      // calculate the vertical center of the active line element
      const lineOffsetHeight = $activeLine.offsetHeight / 2;

      // adjust the scroll position of the lyrics wrapper so that the active line
      // is centered vertically within the wrapper
      $lyricswrapper.scrollTop = $activeLine.offsetTop - (wrapperOffsetHeight - lineOffsetHeight);
}

// please note, you must add liricle event handler before calling the .load or .sync method.
liricle.on('load', data => {
      data.lines.forEach(lineData => {
            // render lyric line
            renderLyricLine(lineData);
      });
});

liricle.on('error', error => {
      console.error('Failed to load lrc: ', error);
});

liricle.on('sync', data => {
      // check if there is a previously active lyric line. if yes, reset the style
      if (currActiveLineIndex) {
            $lyricLines[currActiveLineIndex].classList.remove('active-line');
      }

      // update current active line index
      currActiveLineIndex = data.index;
      // add style for the active line element
      $lyricLines[currActiveLineIndex].classList.add('active-line');

      // scroll to active line
      scrollToActiveLine();
});

// adjust lyric speed
// positive value => speed up
// negative value ​​=> slow down
liricle.offset = 200; // value in milliseconds.

// load lrc file
liricle.load({
      url: 'https://raw.githubusercontent.com/mcanam/assets/main/liricle-demo/lyric.lrc'
});

// listen when audio player time is changed or updated
$player.addEventListener('timeupdate', () => {
      // get audio player current time
      const time = $player.currentTime;
      // sync lyric with the audio player time
      liricle.sync(time, false);
});
