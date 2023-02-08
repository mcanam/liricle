interface Lyric {
      time: number;
      text: string;
}
interface Line extends Lyric {
      words: Lyric[] | null
}

interface Tags {
      ar?: string;
      ti?: string;
      al?: string;
      au?: string;
      by?: string;
      length?: string;
      offset?: string;
      re?: string;
      ve?: string;
}

interface LyricData {
      enhanced: boolean;
      lines: Line[];
      tags: Tags;
}

type EventName = 'load' | 'sync';

export default class Liricle {
      /**
       * Parsed LRC data
       */
      get data(): LyricData;

      /**
       * Current lyric offset
       */
      get offset(): number;

      /**
       * Set the speed or offset of the lyrics in milliseconds (negative values ​​are allowed).  
       * - positive value => speed up  
       * - negative value => slow down
       */
      set offset(value: number);

      /**
       * Load lrc from url or directly from text. 
       * You can't use both options together.
       */
      load(options: { text?: string; url?: string }): void;

      /**
       * Synchronize lyrics with song.  
       * - The first argument accepts the current time of the audio player or something else in milliseconds.   
       * - The second argument is a boolean which if value is `true` (default `false`) it will emit a `sync` event every time this method is called.  
       * By default liricle will only emit a `sync` event when lyrics (lines or words) change.
       */
      sync(time: number, continuous?: boolean): void;

      /**
       * Listen to liricle event.   
       * Liricle has only 2 events `sync` and `load`:  
       * - `sync` event triggered when the `.sync()` method is called or the lyric index changes.  
       * - `load` event triggered when the `.load()` method is called.
       */
      on(event: EventName, callback: Function): void;
}
