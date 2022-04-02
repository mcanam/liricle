(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Liricle = factory());
})(this, (function () { 'use strict';

    function parser(input) {
        const lines = input.split("\n");
        const output = { info: {}, timeline: [] };
        
        lines.forEach(line => {
            if (!line) return;
        
            const regex = /\[(?<meta>.*)\]((?<text>.*))?/;
            const match = line.match(regex);
        
            if (!match || !match.groups) {
                return console.warn("invalid line: '" + line + "'");
            }
        
            const { meta, text } = match.groups;
            const isTime = /\d+:\d\d\.\d+/.test(meta);
        
            if (isTime) {
                output.timeline.push({ 
                    time: meta, 
                    text: text || ""
                });
            }
            
            else {
                const props = meta.split(":");
                const name  = props[0];
                const value = props[1];
                
                output.info[name] = value;
            }
        });
        
        return output;
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

    function mapper(input) {
        const timeline = input.timeline;
        const output = {};
        
        timeline.forEach((line, index) => {
            let start = line.time;
            let end = timeline[index + 1];
        
            if (!end) return;
        
            start = textToTime(start);
            end = textToTime(end.time);
        
            const diff = end - start;
        
            let i = 0;
        
            for (; i < diff;) {
                const time = timeToText(start + i);
                const text = line.text;
                
                output[time] = [index, text];
        
                i += 0.01;
            }
        });
        
        return output;
    }

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

    return Liricle;

}));
