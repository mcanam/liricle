import parser from "./parser.js";
import sync from "./sync.js";

class Liricle {
      constructor() {
            this._activeLine = null;
            this._onInit = () => {};
            this._onSync = () => {};

            this.data = null;
      }

      /**
       * 
       * @param {*} param0 
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
            this._onInit(this.data);
      }

      /**
       * 
       * @param {*} time 
       * @param {*} offset 
       */
      sync(time, offset = 0) {
            const { line, word } = sync(this.data, time + offset);

            // if not enhanced, event update only occurs if it 
            // reaches the next lyric instead of updating every second.
            if (!this.data.enhanced) {
                  if (line.index == null ||
                      line.index == this._activeLine
                  ) return;

                  this._activeLine = line.index;
                  return this._onSync(line, word);
            }

            // simplify, i think it's not good if there are too many parameters.
            this._onSync(line, word);
      }

      /**
       * 
       * @param {*} event 
       * @param {*} callback 
       */
      on(event, callback) {
            if (typeof callback != "function") {
                  throw Error("callback must be a function!");
            }

            switch (event) {
                  case "init":
                        this._onInit = callback;
                        break;
                  case "sync":
                        this._onSync = callback;
                        break;
            }
      }
}

export default Liricle;
