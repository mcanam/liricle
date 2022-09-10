# Liricle

Liricle is javascript library for syncing timed lyrics or commonly called [LRC](https://en.wikipedia.org/wiki/LRC_(file_format)) file format with song.

**[Live Demo →](https://mcanam.github.io/liricle)**

> Liricle now support [enhanced](https://en.wikipedia.org/wiki/LRC_(file_format)#Enhanced_format) LRC format 🎉  
> thanks to [@itaibh](https://github.com/itaibh) for the feature request and contributions 🤘

## Installation 📦

using npm:

``` bash
npm install liricle
```

in browser:

``` html
<script src="https://cdn.jsdelivr.net/npm/liricle"></script>
```

## Usage 🚀

### Setup

create the Liricle instance

``` javascript
const liricle = new Liricle();
```

### Load lyrics

from url:

```javascript
liricle.load({
    url: "your-lrc-file.lrc"
});
```

from text:

```javascript
liricle.load({
    text: `
      [01:02.03] lyric line 1
      [04:05.06] lyric line 2
      ...
    `;
});
```

you can call `.load()` method many times if you want to update the lyrics.  

### Sync lyrics

``` javascript
liricle.sync(time, continuous);
```

`.sync()` method has 2 parameters:

- **time**: current time from audio player or something else in seconds

  - required: `yes`

  - type: `number`

- **continuous**: always emit [sync event](#on-sync-event). by default Liricle only emit [sync event](#on-sync-event) if the lyric index changes

  - required: `no`

  - type: `boolean`

  - default: `false`

### Adjust lyrics offset

to adjust lyrics offset or speed, you can set `.offset` property value. the value is `number` in milliseconds

``` javascript
// positive value = speed up
liricle.offset = 200;

// negative value = slow down
liricle.offset = -200;
```

### Listen to event

#### on load event

``` javascript
liricle.on("load", (data) => {
  // ...
});
```

callback function will receive an `object` of parsed LRC file

<details>
  <summary>expand to see code</summary>

  ``` javascript
  {

    // LRC tags or metadata
    tags: {
      ar: "Liricle",
      ti: "Javascript lyric synchronizer library",
      offset: 200
    },

    // lyric lines
    lines: [
      {
        time: 39.98,
        text: "Hello world",

        // if LRC format is not enhanced
        // words value will be null.
        words: [
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
    enhanced: true

  }
  ```

</details>

#### on sync event

``` javascript
liricle.on("sync", (line, word) => {
  // ...
});
```

> 🚧 If LRC format is not enhanced the `word` value will be `null`

callback function will receive 2 arguments which represents the current lyric.  
both can be `object` or `null` if none of the lyrics match the time so always check the value.

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

## Example

for a complete example you can see **[here →](https://github.com/mcanam/liricle/tree/main/examples/simple)**

## Licence

distributed under the MIT License. see [LICENSE](https://github.com/mcanam/lirilce/blob/main/LICENSE) for more information.
