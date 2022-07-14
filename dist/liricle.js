
/*!
 * liricle v3.0.0
 * Mini library to run & sync LRC file
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

      // will match: "<00:00.00> blablabla".
      const WORD_REGEX = /(<\d{2}:\d{2}.\d{2,}>\s{0,}([^\s]+))/g;

      // only match: "<00:00.00>". mainly used to extract time.
      const WORD_TIME_REGEX = /<\d{2}:\d{2}(.\d{2,})?>/;

      const output = {
            lines: [],
            tags: {},
            enhanced: false,
      };

      let wordIndex = 0;

      /**
       * LRC parser
       * @param {string} lrc - LRC text
       * @returns {Object} output
       */
      function parser(lrc) {
            // check if the lrc file is enhanced or not
            if (WORD_TIME_REGEX.test(lrc)) {
                  output.enhanced = true;
            }

            const lines = lrc.split(/\r|\n/);

            // parsing started
            lines.forEach((line) => {
                  parseTags(line);
                  parseLine(line);
            });

            output.lines = sortLines(output.lines);
            return output;
      }

      /**
       * parse tags data from LRC file
       * @param {string} line - LRC line
       */
      function parseTags(line) {
            const match = line.match(TAGS_REGEX);

            if (match == null) return;

            const name = match[1];
            const value = match[2].trim();

            // push data to output
            output.tags[name] = value;
      }

      /**
       * parse line from LRC file
       * @param {string} line - LRC line
       */
      function parseLine(line) {
            const match = line.match(TIME_REGEX);

            if (match == null) return;

            match.forEach((value) => {
                  // push data to output
                  output.lines.push({
                        time: convertTime(value),
                        text: extractText(line),
                        words: parseWords(line)
                  });
            });
      }

      /**
       * parse words from enhanced LRC
       * @param {string} line - LRC line
       * @returns {Array} parsed words
       */
      function parseWords(line) {
            const match = line.match(WORD_REGEX);
            const words = [];

            if (match == null) return null;

            match.forEach((value) => {
                  // extract timestamp. "<00:00.00>"
                  // i think it's easier than split them.
                  const time = value.match(WORD_TIME_REGEX)[0];

                  words.push({
                        index: wordIndex,
                        time: convertTime(time),
                        text: extractText(value),
                  });
                  
                  wordIndex += 1;
            });

            return words;
      }

      /**
       * extract text / lyric from timed line
       * @param {string} line - LRC line
       * @returns {string} extracted text
       */
       function extractText(line) {
            // remove timestamp
            line = line.replace(TIME_REGEX, "");
            line = line.replace(WORD_REGEX, "$2");

            return line.trim();
      }

      /**
       * convert "[03:24.73]" => 204.73 (total time in seconds)
       * @param {string} time - string time "[mm:ss.xx]" or "<mm:ss.xx>"
       * @returns {number} total time in seconds
       */
      function convertTime(time) {
            time = time.replace(/\[|\]|<|>/g, "");
            time = time.split(":");

            let [min, sec] = time;

            min = parseInt(min) * 60;
            sec = parseFloat(sec);

            return min + sec;
      }

      /**
       * sort lines from shortest to longest
       * @param {Array} lines - parsed lines
       * @returns {Array} sorted lines
       */
      function sortLines(lines) {
            return lines.sort((a, b) => a.time - b.time);
      }

      /**
       * find closest lyric index from given time
       * @param {Object} data - output data from parser
       * @param {number} time - currrent time from audio player or something in seconds
       * @returns {Object} - the current lyric line and word
       */
      function sync(data, time) {
            let line = findLine(data, time);
            let word = line != null && data.enhanced ? findWord(line, time) : null;

            // delete words property from line
            if (line != null) delete line.words;

            return { line, word };
      }

      /**
       * find closest line
       * @param {Object} data 
       * @param {number} time - currrent time
       * @returns {Object|null}
       */
      function findLine(data, time) {
            const lines = data.lines;
            const index = getClosestIndex(lines, time);

            return index != null ? { index, ...lines[index] } : null;
      }

      /**
       * find closest word
       * @param {Object} line 
       * @param {number} time - currrent time
       * @returns {Object|null}
       */
      function findWord(line, time) {
            const words = line.words;
            const index = getClosestIndex(words, time);

            return index != null ? words[index] : null;
      }

      /**
       * find closest lyric index
       * @param {Array} data 
       * @param {number} time - currrent time 
       * @returns {number|null} index of lyric
       */
      function getClosestIndex(data, time) {
            // to find the closest index we just need to subtract each line or word time with the given time
            // then put the value into an array and find the smallest positive value with Math.min()
            // after that we can find the index from smallest value in array with indexOf() method.

            const scores = [];

            data.forEach((item) => {
                  const score = time - item.time;
                  if (score >= 0) scores.push(score);
            });

            if (scores.length == 0) return null;

            const smallest = Math.min(...scores);
            const index = scores.indexOf(smallest);

            return index;
      }

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

      return Liricle;

}));
