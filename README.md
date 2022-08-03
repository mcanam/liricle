# Liricle

Liricle is javascript library for syncing timed lyrics or commonly called [LRC](https://en.wikipedia.org/wiki/LRC_(file_format)) file format with song.

**[Live Demo →](https://mcanam.github.io/liricle)**

> Liricle now support enhanced LRC format 🎉  
> thanks to [@itaibh](https://github.com/itaibh) for the feature request and contributions 🤘

## Install 📦

Install using npm

``` bash
npm install liricle
```

once installed you can import it into your project

``` javascript
import Liricle from "liricle";
```

If you don't want to use npm you can add the script tag below in your html

``` html
<script src="https://cdn.jsdelivr.net/npm/liricle"></script>
```

## Usage 🚀

> ⚡ You can directly see the example **[here →](https://github.com/mcanam/liricle/tree/main/examples/simple)**

### Setup

Create the liricle instance

``` javascript
const liricle = new Liricle();
```

### Load lyric

Load lyric via url or text with the `.load()` method

#### Load from url

```javascript
liricle.load({
    url: "your-lrc-file.lrc"
});
```

#### Load from text

```javascript
liricle.load({
    text: `
      [01:02.03] lyric line 1
      [04:05.06] lyric line 2
      ...
    `;
});
```

> ⚡ You can call `.load()` method many times if you want to update the lyric.  

### Sync lyric

Sync lyric by calling `.sync()` method

``` javascript
liricle.sync(time, continuous);
```

the method has 2 parameters:

- **time**: current time from audio player or something else in seconds

  - required: `yes`

  - type: `number`

- **continuous**: always emit sync event  

  by default liricle only emit [sync event](#sync-event) if the lyric index changes,  
  but if you are working with enhanced lrc i recommend set it to `true` which will emit the event every second.

  - required: `no`

  - type: `boolean`

  - default: `false`

### Adjust lyric offset

To adjust offset or speed of the lyric you can set the `.offset` property

``` javascript
// positive value => speed up
// negative value ​​=> slow down
liricle.offset = 200; // value in milliseconds.
```

### Listen to event

Liricle has 2 events:

- load: when the `.load()` method is called

- sync: when the `.sync()` method is called

You can listen for events by using the `.on()` method as in the example below:

#### load event

``` javascript
liricle.on("load", (data) => {
  // ...
});
```

callback function will receive an `object`

<details>
  <summary>expand to see code</summary>

  ``` javascript
  {

    // lrc tags or metadata
    "tags": {
      "ar": "Liricle",
      "ti": "Javascript lyric synchronizer library",
      "offset": "200"
    },

    // lyric lines
    "lines": [
      {
        "time": 39.98,
        "text": "Hello world",

        // if lrc format is not enhanced, words value will be null.
        "words": [
          {
            time: 40.10,
            text: "Hello"
          },
          ......
        ]
      },
      ......
    ],

    // indicates whether the lrc format is enhanced or not.
    "enhanced": true

  }
  ```

</details>

#### sync event

``` javascript
liricle.on("sync", (line, word) => {
  // ...
});
```

> 🚧 If lrc format is not enhanced the word value will be `null`

callback function will receive 2 arguments which represents the current lyric. both can be `object` or `null` if none of the lyrics match the time. so always check the value

<details>
  <summary>expand to see code</summary>

  ``` javascript
  // both line and word objects have the same properties
  
  {
    index: 1,
    time: 39.98,
    text: "Hello world"
  }
  ```

</details>

### Example

For a complete example you can see **[here →](https://github.com/mcanam/liricle/tree/main/examples/simple)**
