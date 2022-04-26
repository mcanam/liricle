# liricle

mini library to run & sync lrc file

[see demo](https://mcanam.github.io/liricle/)

# install

npm
``` bash
npm install liricle
```

cdn
``` html
https://cdn.jsdelivr.net/npm/liricle
```

# usage

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
