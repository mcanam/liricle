import parser from "./parser.js";
import syncher from "./syncher.js";

export default class Liricle {
      #activeLine = null;
      #activeWord = null;
      #offset = 0;
      #data = {};
      #onLoad = () => {};
      #onSync = () => {};

      get data() {
            return this.#data;
      }

      get offset() {
            return this.#offset;
      }

      /**
       * @param {number} value - lyric offset in milliseconds
       */
      set offset(value) {
            value = parseFloat(value) / 1000; // convert value to seconds
            this.#offset = value || 0; // if value is NaN, set 0
      }

      /**
       * method to load lyric
       * @param {Object} options - object that contains 'url' or 'text' properties
       * @param {string} options.text - lrc text
       * @param {string} options.url - lrc file url
       */
      load(options = {}) {
            if (options.text) { 
                  this.#data = parser(options.text);
                  this.#onLoad(this.#data);
            }
            
            if (options.url) {
                  fetch(options.url)
                        .then(res => res.text())
                        .then(text => {
                              this.#data = parser(text);
                              this.#onLoad(this.#data);
                        })
                        .catch(error => {
                              throw Error("failed to load lyric file. " + error.message);
                        });
            }
      }

      /**
       * method to sync lyric
       * @param {number} time - current player time or something else in seconds
       * @param {boolean} [continuous] - always emit sync event (optional)
       */
      sync(time, continuous = false) {
            const { line, word } = syncher(this.data, time + this.offset);
            const { enhanced } = this.data;

            if (line == null && word == null) return;

            if (continuous) {
                  return this.#onSync(line, word);
            }

            const isSameLine = line.index == this.#activeLine;
            const isSameWord = word != null && word.index == this.#activeWord;

            if (enhanced && word != null) {
                  if (isSameLine && isSameWord) return;
            } else { 
                  if (isSameLine) return;
            }

            this.#onSync(line, word);

            this.#activeLine = line.index;
            this.#activeWord = word != null ? word.index : null;
      }

      /**
       * listen to liricle event
       * @param {string} event - event name
       * @param {function} callback - event callback
       */
      on(event, callback) {
            switch (event) {
                  case "load":
                        this.#onLoad = callback;
                        break;
                  case "sync":
                        this.#onSync = callback;
                        break;
            }
      }
}
