
/*!
 * liricle v2.0.1
 * mini library to run & sync lrc file
 * https://github.com/mcanam/liricle#readme
 * MIT license by mcanam
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Liricle = factory());
})(this, (function () { 'use strict';

    class Liricle {
        constructor() {
            this._onInit = () => {};
            this._onSync = () => {};

            this._info = {};
            this._data = [];

            this._activeLine = null;
        }

        async init({ text, url }) {
            let lyric = "";

            if (text) {
                lyric = text;
            } 
            
            else if (url) {
                lyric = await this._loadLyric(url);
            } 
            
            else {
                throw Error("Missing parameter. You can pass text or url from lrc file.");
            }

            this._parseLyric(lyric);
            this._onInit(this._info, this._data);
        }

        sync(time, offset = 0) {
            const index = this._findLineIndex(time + offset);

            if (index == null) return;
            if (index == this._activeLine) return;

            const text = this._data[index].text;

            this._activeLine = index;
            this._onSync(index, text);
        }

        on(event, callback) {
            if (typeof callback != "function") {
                throw Error("Callback must be a function.");
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

        // Internal Methods

        async _loadLyric(url) {
            try {
                const resp = await fetch(url);
                return await resp.text();
            } 
            
            catch (error) {
                throw Error("Failed to load lrc file: " + error.message);
            }
        }

        // find line index closest to given time
        // i dont know the best way to do this.
        _findLineIndex(time) {
            const scores = [];

            this._data.forEach((line) => {
                const score = time - line.time;
                if (score >= 0) scores.push(score);
            });

            if (scores.length == 0) return null;

            const closest = Math.min.apply(Math, scores);
            return scores.indexOf(closest);
        }

        // parse lyric text.
        // info => lyric tags data
        // data => lyric lines data contains time & text.
        _parseLyric(text) {
            const info_regex = /\[((?:al|ar|au|by|re|ti|ve|length|offset):.+)\]/i;
            const data_regex = /\[(\d+:\d+(?:\.\d+))\](.*)/;

            const lines = text.split("\n");

            if (lines.length == 0) {
                throw Error("Lyric is empty.");
            }

            lines.forEach((line) => {
                const info = line.match(info_regex);
                const data = line.match(data_regex);

                if (info) {
                    const prop = info[1].match(/(\w+):(.*)/);

                    const name = prop[1];
                    const value = prop[2];

                    // store data to class property
                    this._info[name] = value;
                }

                if (data) {
                    const time = this._parseTime(data[1]);
                    const text = data[2] || "";

                    // store data to class property
                    this._data.push({ time, text });
                }
            });
        }

        // parse formated time.
        // "03:24.73" => 204.73 (total time in seconds)
        _parseTime(time) {
            const times = time.split(":");

            const min = parseInt(times[0]) * 60;
            const sec = parseFloat(times[1]);

            return parseFloat((min + sec).toFixed(2));
        }
    }

    return Liricle;

}));
