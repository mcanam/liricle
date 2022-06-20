import parser from "./parser.js";
import sync from "./sync.js";

class Liricle {
    constructor() {
        this.onInit = () => {};
        this.onSync = () => {};

        this.info = {};
        this.data = [];

        this.activeLine = null;
    }

    async init({ text, url }) {
        let lrc = text;
        
        if (url) {
            const resp = await fetch(url);
            const body = await resp.text();
            
            lrc = body;
        } 
        
        const { info, data } = parser(lrc);
        
        this.info = info;
        this.data = data;
        
        this.onInit(info, data);
    }

    sync(time, offset = 0) {
        const index = sync(this.data, time + offset);

        if (index == null) return;
        if (index == this.activeLine) return;

        const { text } = this.data[index];

        this.activeLine = index;
        this.onSync(index, text);
    }

    on(event, callback) {
        if (typeof callback != "function") {
            throw Error("Callback must be a function.");
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
