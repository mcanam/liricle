> 🚧 this library is beta 🚧.

# liricle

mini library to parse and sync lrc file

[see demo](https://mcanam.github.io/liricle/)

# install

npm
``` bash
npm install liricle@beta
```

cdn
``` html
https://cdn.jsdelivr.net/npm/liricle@beta
```

# usage

``` javascript
const lyric = `
[00:00.00] blablabla
.....
`;

// create liricle instance
const liricle = new Liricle();

// initialize liricle
liricle.init(lyric, (info, lines) => {
    // do something....
});

// sync lyrics with given time
liricle.sync(time, (index, text) => {
    // do something....
});
```

> please see [index.html](https://github.com/mcanam/liricle/blob/main/index.html) file for full example

# methods

### `Liricle.init(text: string[, callback: func])`

- `text` lrc text

- `callback` will receive two parameters  
    - info: `object` containing lyric info
    - lines: `array` containing lyric text per line

> you can call this method multiple times to update the lyrics

### `Liricle.sync(time: number[, callback: func])`

- `time` audio player current time in milliseconds

- `callback` will receive two parameters
    - index: `number` containing current active line
    - text: `string` containing lyric text
