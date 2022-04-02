import parser from "./libs/parser.js";
import mapper from "./libs/mapper.js";

import { timeToText } from "./libs/utils.js";

class Liricle {
    constructor() {
        this.data = {};
        this.map = {};
        this.lines = [];
        this.activeLine = null;
    }
    
    init(text, callback = () => {}) {
        this.data = parser(text);
        this.map = mapper(this.data);
        
        const { info, timeline } = this.data;
        
        timeline.forEach(line => {
            this.lines.push(line.text);
        });
        
        callback(info, this.lines);
    }
    
    sync(time, callback = () => {}) {
        const key = timeToText(time);
        const line = this.map[key]; 
        
        if (!line) return;
        
        const [index, text] = line;
        
        if (this.activeLine != index) {
            callback(index, text);
            this.activeLine = index;
        }
    }
}

export default Liricle;
