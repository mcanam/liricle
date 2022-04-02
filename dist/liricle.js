(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Liricle = factory());
})(this, (function () { 'use strict';

    function parser(input) {
        const lines = input.split("\n");
        const output = [];
        
        lines.forEach(line => {
            if (!line) return;
        
            const regex = /\[(?<time>.*)\]((?<text>.*))?/;
            const match = line.match(regex);
        
            if (!match || !match.groups) {
                return console.warn("invalid line: '" + line + "'");
            }
        
            const { time, text } = match.groups;
            const isTime = /\d+:\d\d\.\d+/.test(time);
        
            if (!isTime) return;
        
            output.push({ time, text });
        });
        
        return output;
    }

    function render(container, data) {
        const fragment = document.createDocumentFragment();
        
        data.forEach((item, index) => {
            const node = document.createElement("div");
            
            node.className = "liricle-line";
            node.innerText = item.text || "";
            
            fragment.append(node);
        });
        
        container.innerHTML = "";
        container.append(fragment);
    }

    function timeToText(time) {
        let min = Math.floor(time / 60);
        let sec = (time % 60).toFixed(2);

        min = min < 10 ? "0" + min : min;
        sec = sec < 10 ? "0" + sec : sec;

        return min + ":" + sec;
    }

    function textToTime(text) {
        const times = text.split(":");
        const min = parseInt(times[0]) * 60;
        const sec = parseFloat(times[1]);

        return parseFloat((min + sec).toFixed(2));
    }

    function mapper(container, map, data) {
        const nodes = container.children;
        
        data.forEach((item, index) => {
            let start = item.time;
            let end = data[index + 1];
        
            if (!end) return;
        
            start = textToTime(start);
            end = textToTime(end.time);
        
            const diff = end - start;
            const node = nodes[index];
        
            let i = 0;
        
            for (; i < diff;) {
                const time = timeToText(start + i);
                map[time] = node;
        
                i += 0.01;
            }
        });
    }

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

    return Liricle;

}));
