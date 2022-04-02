import parser from "./lib/parser.js";
import render from "./lib/render.js";
import mapper from "./lib/mapper.js";
import { timeToText } from "./lib/utils.js";

class Liricle {
    constructor(container) {
        if (!(container instanceof HTMLElement)) {
            container = document.querySelector(container);
        }
        
        if (!container) {
            throw Error("[Liricle]: 404 container not found!");
        }
        
        this.container  = container;
        this.activeNode = null;
        this.ready = false;
        this.map = {};
    }
    
    async init(url) {
        this.ready = false;
        
        try {
            const text = await fetch(url).then(res => res.text());
            const data = parser(text);
            
            render(this.container, data);
            mapper(this.container, this.map, data);
            
            this.ready = true;
        }
        
        catch (error) {
            throw Error("[Liricle]: " + error);
        }
    }
    
    sync(time) {
        if (!this.ready) return;
        
        const key = timeToText(time);
        const node = this.map[key];
        
        if (!node || this.activeNode == node) return;
        
        if (this.activeNode) {
            this.activeNode.classList.remove("active");
        }
        
        this.activeNode = node;
        this.activeNode.classList.add("active");
        
        this.container.scrollTop = node.offsetTop - (this.container.offsetHeight / 2);
    }
}

export default Liricle;
