
/*!
 * liricle v2.1.0
 * mini library to run & sync lrc file
 * https://github.com/mcanam/liricle#readme
 * MIT license by mcanam
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Liricle = factory());
})(this, (function () { 'use strict';

    // will match: "[name:value]"
    const TAGS_REGEX = /\[([a-z]+):(.+)\]/i;

    // will match: "[00:00.00]" one or more.
    const TIME_REGEX = /\[\d{2}:\d{2}(.\d{2,})?\]{1,}/g;

    function parser(text) {
        let info = {};
        let data = [];
        
        const lines = text.split(/\r|\n/);
        
        lines.forEach(line => {
            parseTags(line);
            parseTime(line);
        });
        
        function parseTags(line) {
            const match = line.match(TAGS_REGEX);
            
            if (match == null) return;
            
            const name  = match[1];
            const value = match[2];
            
            info[name] = value;
        }
        
        function parseTime(line) {
            const match = line.match(TIME_REGEX);
            
            if (match == null) return;
            
            match.forEach(value => {
                data.push({
                    time: convertTime(value),
                    text: extractText(line)
                });
            });
        }
        
        function convertTime(time) {
            time = time.replace(/\[|\]/g, "");
            time = time.split(":");
            
            let [min, sec] = time;
            
            min = parseInt(min) * 60;
            sec = parseFloat(sec);
            
            return min + sec;
        }
        
        function extractText(text) {
            text = text.replace(TIME_REGEX, "");
            return text.trim();
        }
        
        function sortData(data) {
            return data.sort((a, b) => a.time - b.time);
        }
        
        return { info, data: sortData(data) };
    }

    function sync(data, time) {
        const scores = [];
        
        data.forEach(line => {
            // get gap or time distance
            const score = time - line.time;
            if (score >= 0) scores.push(score);
        });
        
        if (scores.length == 0) return null;
        
        // get the smallest value from scores
        const closest = Math.min(...scores);
        
        // return the index of closest lyric
        return scores.indexOf(closest);
    }

    class Liricle {
        constructor() {
            this._activeLine = null;
            this._onInit = () => {};
            this._onSync = () => {};

            this.info = {};
            this.data = [];
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
            
            const { info, data } = parser(lrc);
            
            this.info = info;
            this.data = data;
            
            this._onInit(info, data);
        }

        sync(time, offset = 0) {
            const index = sync(this.data, time + offset);
            
            if (index == null) return;
            if (index == this._activeLine) return;
            
            const { text } = this.data[index];
            
            this._activeLine = index;
            this._onSync(index, text);
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

    return Liricle;

}));
