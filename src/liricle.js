import parser from "./parser.js";
import sync from "./sync.js";

class Liricle {
      constructor() {
            this.activeLine = null;
            this.activeWord = null;
            this.onInit = () => {};
            this.onSync = () => {};

            this.data = null;
      }

      /**
       * initialize Liricle
       * @param {Object} options
       * @param {string} options.text - LRC text
       * @param {string} options.url - LRC file url
       */
      async init({ text, url }) {
            let lrc = text;

            if (url) {
                  try {
                        const resp = await fetch(url);
                        const body = await resp.text();

                        lrc = body;
                  } 
                  
                  catch (error) { throw Error(error) }
            }

            this.data = parser(lrc);
            this.onInit(this.data);
      }

      /**
       * sync lyric with current time
       * @param {number} time - currrent time from audio player or something in seconds
       * @param {number} offset - lyric offset in seconds
       */
      sync(time, offset = 0, continuous = false) {
            const { line, word } = sync(this.data, time + offset);
            
            if (line == null && word == null) return;

            if (this.data.enhanced && word != null) {
                  if (
                        continuous == false &&
                        line.index == this.activeLine &&
                        word.index == this.activeWord
                  ) return;

                  this.activeLine = line.index;
                  this.activeWord = word.index;
            }

            else {
                  if (
                        continuous == false &&
                        line.index == this.activeLine
                  ) return;
                  
                  this.activeLine = line.index;
            }

            this.onSync(line, word);
      }

      /**
       * add event listener
       * @param {string} event - event name
       * @param {function} callback - event callback
       */
      on(event, callback) {
            if (typeof callback != "function") {
                  throw Error("callback must be a function!");
            }

            switch (event) {
                  case "init":
                        this.onInit = callback;
                        break;
                  case "sync":
                        this.onSync = callback;
                        break;
            }
      }
}

export default Liricle;
