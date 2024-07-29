import parser from './parser';
import syncer from './syncer';
import { EventTypeMap, LoadErrorEventCallback, LoadEventCallback, LoadOptions, LyricsData, SyncEventCallback } from './types';

export default class Liricle {
      /* private */ #data: LyricsData | null = null;
      /* private */ #offset = 0;
      /* private */ #activeLine: number | null = null;
      /* private */ #activeWord: number | null = null;
      /* private */ #isLoaded = false;
      /* private */ #onLoad: LoadEventCallback = () => { };
      /* private */ #onLoadError: LoadErrorEventCallback = () => { };
      /* private */ #onSync: SyncEventCallback = () => { };

      /**
       * Gets the currently loaded lyrics data.
       * @returns { LyricsData | null } Lyrics data or null.
       */
      get data(): LyricsData | null {
            return this.#data;
      }

      /**
       * Gets current offset in seconds.
       * @returns { number } Lyric offset in seconds.
       */
      get offset(): number {
            return this.#offset;
      }

      /**
       * Sets the lyric offset in milliseconds.
       * @param { number } value - Lyric offset in milliseconds
       */
      set offset(value: number) {
            this.#offset = value / 1000;
      }

      /**
       * Load lyrics from either text or url.
       * @param { LoadOptions } options - Load options.
       */
      load(options: LoadOptions) {
            const text = options?.text;
            const url = options?.url;
            const skipBlankLine = options?.skipBlankLine ?? true;

            this.#isLoaded = false;
            this.#activeLine = null;
            this.#activeWord = null;

            if (!text?.trim() && !url?.trim()) {
                  throw Error('[Liricle]: text or url options required.');
            }

            if (text && url) {
                  throw Error('[Liricle]: text and url options cant be used together.');
            }

            if (text) {
                  this.#data = parser(text, { skipBlankLine });
                  this.#isLoaded = true;
                  this.#onLoad(this.#data);
            }

            if (url) {
                  fetch(url)
                        .then(res => {
                              if (!res.ok) throw Error('Network error with status ' + res.status);
                              return res.text();
                        })
                        .then(text => {
                              this.#data = parser(text, { skipBlankLine });
                              this.#isLoaded = true;
                              this.#onLoad(this.#data);
                        })
                        .catch(error => {
                              this.#onLoadError(error);
                        });
            }
      }

      /**
       * Synchronize the lyrics based on the given time.
       * @param { number } time - Time in seconds.
       * @param { boolean } [continuous=false] - Whether to call the sync callback continuously.
       */
      sync(time: number, continuous: boolean = false) {
            if (!this.#isLoaded || !this.#data) {
                  return console.warn('[Liricle]: lyrics not loaded yet.');
            }

            const { enhanced } = this.#data;
            const { line, word } = syncer(this.#data, time + this.#offset);

            if (!line && !word) return;
            if (continuous) return this.#onSync(line, word);

            const isSameLine = line !== null && line.index === this.#activeLine;
            const isSameWord = word !== null && word.index === this.#activeWord;

            if (enhanced && word && isSameLine && isSameWord) return;
            if (!enhanced && isSameLine) return;

            this.#onSync(line, word);

            this.#activeLine = line?.index ?? null;
            this.#activeWord = word?.index ?? null;
      }

      /**
       * Listen liricle event.
       * @param { K } type - The type of event ('load', 'loaderror' or 'sync').
       * @param { EventTypeMap[K] } callback - The callback function to handle the event.
       */
      on<K extends keyof EventTypeMap>(type: K, callback: EventTypeMap[K]) {
            switch (type) {
                  case 'load':
                        this.#onLoad = callback as LoadEventCallback;
                        break;
                  case 'loaderror':
                        this.#onLoadError = callback as LoadErrorEventCallback;
                        break;
                  case 'sync':
                        this.#onSync = callback as SyncEventCallback;
                        break;
            }
      }
}
