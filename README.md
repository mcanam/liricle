# Liricle

Mini library to run & sync [LRC file](https://en.m.wikipedia.org/wiki/LRC_(file_format)).

[✨ DEMO ✨](https://mcanam.github.io/liricle/)

## Install

NPM
``` bash
npm install liricle
```

CDN
``` html
https://cdn.jsdelivr.net/npm/liricle
```

## Usage

``` javascript
// create liricle instance
const liricle = new Liricle();

// initialize liricle
liricle.init({ url: "your-lyric.lrc" });
// OR
// liricle.init({ text: "[00:00.00]your lrc text" });

// sync lyrics with current player time.
// offset (optional) time in seconds, default: 0
liricle.sync(time, offset);

// listen on init event
liricle.on("init", (info, data) => {
    // info => {object} contain lrc tags info
    // data => [array] contain lyric time & text object
});

// listen on sync event
liricle.on("sync", (index, text) => {
    // index => current line index (start from zero)
    // text => lyric text
});
```

> please see [index.html](https://github.com/mcanam/liricle/blob/main/index.html) file for full example
