# Liricle

Liricle is a simple JavaScript library to synchronize lyrics with music in real-time using the [LRC](https://en.wikipedia.org/wiki/LRC_(file_format)) file format. It supports both basic and enhanced LRC formats, providing methods to load, sync, and adjust lyrics.

**[Live Demo →](https://mcanam.github.io/liricle)**

## Installation 📦

### Using npm

```bash
npm install liricle
```

### In Browser

```html
<script src="https://cdn.jsdelivr.net/npm/liricle"></script>
```

## Example Usage 🚀

### Initialization

Create a Liricle instance:

```javascript
const liricle = new Liricle();
```

### Registering Events

Before loading lyrics, you should register event handlers to handle events such as when the lyrics are loaded, when the lyrics are synced, and when there is an error loading the lyrics. This ensures that your application responds to these events correctly.

**Example:**

```javascript
// Register the load event
liricle.on("load", (data) => {
  console.log("Lyrics loaded:", data);
});

// If you load lyrics from a URL, you can listen for the loaderror event when loading fails
liricle.on("loaderror", (error) => {
  console.error("Failed to load lyrics:", error.message);
});

// Register the sync event
liricle.on("sync", (line, word) => {
  console.log("Sync event:", line, word);
});
```

### Load Lyrics

You can load lyrics from either a URL or raw text.

**From URL:**

```javascript
liricle.load({
    url: "path/to/your-lrc-file.lrc"
});
```

**From Text:**

```javascript
liricle.load({
    text: `
      [01:02.03] lyric line 1
      [04:05.06] lyric line 2
      ...
    `
});
```

**Note:** You must provide either `url` or `text`, but not both simultaneously. For more details, see [load method](#methods).

### Sync Lyrics

Synchronize lyrics with the given time from audio player or something else in seconds:

```javascript
liricle.sync(60); // Sync with time at 60 seconds
```

### Set Offset

Adjust the offset or speed of the lyrics:

```javascript
// Speed up lyrics by 200 milliseconds
liricle.offset = 200;

// Slow down lyrics by 200 milliseconds
liricle.offset = -200;
```

## Methods

### `load(options)`

Loads lyrics from a URL or text.

**Parameters:**

- `options.url` (string, optional): URL to the LRC file.
- `options.text` (string, optional): Raw LRC text.
- `options.skipBlankLine` (boolean, optional): Whether to ignore blank lyric lines. Default is `true`.

**Note:** You must provide either `url` or `text`, but not both. For more information, see [Example Usage → Load Lyrics](#load-lyrics).

### `sync(time, continuous)`

Synchronizes the lyrics with the provided time.

**Parameters:**

- `time` (number): Current time from audio player or something else in seconds.
- `continuous` (boolean, optional): Always emit [sync event](#sync). By default Liricle only emit event if the lyrics index changes.

For more information, see [Example Usage → Sync Lyrics](#sync-lyrics).

## Properties

### `offset` (getter/setter)

**Type:** `number` (milliseconds)

Adjusts the offset or speed of the lyrics. Positive values speed up the lyrics, while negative values slow them down.

**Getter Example:**

```javascript
const currentOffset = liricle.offset;
console.log("Current offset:", currentOffset);
```

**Setter Example:**

```javascript
liricle.offset = 200;  // Speed up lyrics
```

### `data` (getter)

**Type:** `object`

Contains the parsed LRC file data after calling the `load` method.

**Getter Example:**

```javascript
const lyricData = liricle.data;
console.log("Lyrics data:", lyricData);
```

## Events

### `load`

**Callback Signature:**

```javascript
liricle.on("load", (data) => {
  // Handle load event
});
```

**Parameters:**

- `data` (object): Contains parsed LRC file data.

<details>
  <summary>Expand to see data object example</summary>

  ```javascript
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

### `loaderror`

**Callback Signature:**

```javascript
liricle.on("loaderror", (error) => {
  // Handle loaderror event
});
```

**Parameters:**

- `error` (Error): Error object containing details about the failure.


### `sync`

**Callback Signature:**

```javascript
liricle.on("sync", (line, word) => {
  // Handle sync event
});
```

**Parameters:**

- `line` (object or null): Current lyric line.
- `word` (object or null): Current lyric word (if the LRC format is enhanced).

<details>
  <summary>Expand to see lyric object example</summary>

  ```javascript
  {
    index: 1,
    time: 39.98,
    text: "Hello world"
  }
  ```

</details>

## Example

For a complete example, see **[here →](https://github.com/mcanam/liricle/tree/main/examples/simple)**

## Contributing

Want to contribute? [Let's go](https://github.com/mcanam/liricle/blob/main/.github/CONTRIBUTING.md) 🚀

## License

Distributed under the MIT License. See [LICENSE](https://github.com/mcanam/liricle/blob/main/LICENSE) for more information.
