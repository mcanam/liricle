# Liricle

liricle is javascript library for syncing timed lyrics with song. 

you can see the demo here

> liricle now supports enhanced lrc format

## Install 📦

install using npm

``` bash
npm install liricle
```

once installed you can import it into your project

``` javascript
import Liricle from "liricle";
```

if you don't want to use npm you can add the script tag below in your html

``` html
<script src="https://cdn.jsdelivr.net/npm/liricle"></script>
```

## Usage 🚀

### Instantiation and initialization

firstly you need to create the liricle instance

``` javascript
const liricle = new Liricle();
```

after that you can load the lyric by calling `init` method like the example below:

load from url:

```javascript
liricle.init({
    url: "your-lrc-file.lrc"
});
```

load from text:

```javascript
liricle.init({
    text: `
      [01:02.03] lyric line 1
      [04:05.06] lyric line 2
      ...
    `;
});
```

> you can call `init` method many times if you want to update the lyric.  

### Syncronization

you can sync the lyric by calling `sync` method

``` javascript
liricle.sync(time, offset);
```

this method has 2 parameters:

- **time**: current time from audio player or something else in seconds.

  - **required:** `yes`

  - **type**: `number` 

- **offset**: the lyric offset in seconds (optional). this is used to set the lyric speed.

  - **required:** `no`

  - **type**: `number`

  - **default**: `0`

### Listen to event

you can add event listener by calling `on` method

``` javascript
liricle.on(event, callback);
```

liricle has 2 events: 

- **init**: when the `init` method is called

- **sync**: when the `sync` method is called

for example, see the code below:

listen init event:

``` javascript
liricle.on("init", (data) => {
      // ....
});
```

callback function will receive a `object` called **data** that contain:

- **tags** `Object`: key-value pair of lyric tags info

- **lines** `Array`: array of lyric line object that contain:

  - **time** `number`: lyric line time in seconds

  - **text** `string`: lyric line text

  - **words** `Array`: every word of the lyric line if the lrc is enhanced. otherwise `null`

- **enhanced** `boolean`: lrc format is enhanced or not

listen sync event:

``` javascript
liricle.on("sync", (line, word) => {
      // ...
});
```

callback function will receive 2 arguments called **line** and **word**.  \
both can be `object` or `null` if none of the lyrics match the time. so always check the value.

both **line** and **word** objects contain:

- **index** `number`: current line or word index

- **text** `string`: current lyric text

- **time** `number`: current lyric time

### Example

for a complete example you can check the `example folder` in this repo.
