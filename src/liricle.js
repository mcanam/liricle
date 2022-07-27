import parser from "./parser.js";
import sync from "./sync.js";

export default class Liricle {
      #activeLine = null;
      #activeWord = null;
      #onInit = () => {};
      #onSync = () => {};
      
      constructor() {
            this.data = null;
      }

      /**
       * initialize Liricle
       * @param {Object} options
       * @param {string} options.text - lrc text
       * @param {string} options.url - lrc file url
       */
      async init(options) {            
            if (options && options.url) {
                  try {
                        const resp = await fetch(options.url);

                        if (!resp.ok) {
                              throw Error(`${resp.status} ${resp.statusText} (${resp.url})`);
                        }

                        const body = await resp.text();
                        this.data = parser(body);
                  } 
                  
                  catch (error) {
                        throw Error(`Liricle.init(): ${error.message}`);
                  }
            } 

            else if (options && options.text) {
                  this.data = parser(options.text);
            } 
            
            else {
                  throw Error(`Liricle.init(): invalid argument`);
            }
            
            this.#onInit(this.data);
      }

      /**
       * sync lyric with current time
       * @param {number} time - currrent time from audio player or something else in seconds
       * @param {number} offset - lyric offset in seconds
       * @param {boolean} continuous - always emit sync event 
       */
      sync(time, offset = 0, continuous = false) {
            if (time == undefined) {
                  throw Error("Liricle.sync(): missing 'time' argument");
            }

            if (typeof time != "number") {
                  throw Error("Liricle.sync(): 'time' argument must be a number!");
            }

            if (typeof offset != "number") {
                  throw Error("Liricle.sync(): 'offset' argument must be a number!");
            }

            if (typeof continuous != "boolean") {
                  throw Error("Liricle.sync(): 'continuous' argument must be a boolean!");
            }
            
            if (offset === 0 && ("offset" in this.data.tags)) {
                  offset = (parseFloat(this.data.tags.offset) / 1000) || 0;
            }
            
            const { line, word } = sync(this.data, (time + offset));
            
            if (line == null && word == null) return;

            if (this.data.enhanced && word != null) {
                  if (
                        continuous == false &&
                        line.index == this.#activeLine &&
                        word.index == this.#activeWord
                  ) return;

                  this.#activeLine = line.index;
                  this.#activeWord = word.index;
            }

            else {
                  if (
                        continuous == false &&
                        line.index == this.#activeLine
                  ) return;
                  
                  this.#activeLine = line.index;
            }

            this.#onSync(line, word);
      }

      /**
       * listen to lyricle event
       * @param {string} event - event name
       * @param {function} callback - event callback
       */
      on(event, callback) {
            if (typeof callback != "function") {
                  throw Error("Liricle.on(): 'callback' argument must be a function!");
            }

            switch (event) {
                  case "init":
                        this.#onInit = callback;
                        break;
                  case "sync":
                        this.#onSync = callback;
                        break;
            }
      }
}
