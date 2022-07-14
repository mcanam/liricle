import parser from "./parser.js";
import sync from "./sync.js";

class Liricle {
    constructor() {
        this._activeLine = null;
        this._onInit = () => { };
        this._onSync = () => { };

        this.data = null;
    }

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

    sync(time, offset = 0) {
        const index = sync(this.data, time + offset);

        if (index == null) return;
        if (index == this._activeLine) return;

        let line = this.data.lines[index.lineIndex];
        let word = "";
        if (index.wordIndex >= 0) {
            word = line.words[index.wordIndex].text;
        }

        this._activeLine = index;
        this._onSync(index.lineIndex, line.text, index.wordIndex, word, this.data);
    }

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
