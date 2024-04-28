
/*!
 * liricle v4.0.5
 * javascript lyric synchronizer library
 * https://github.com/mcanam/liricle
 * MIT license by mcanam
 */

(function (global, factory) {
      typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
      typeof define === 'function' && define.amd ? define(factory) :
      (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Liricle = factory());
})(this, (function () { 'use strict';

      // will match: "[tag:value]"
      const TAG_REGEX = /\[(ar|ti|al|au|by|length|offset|re|ve):(.*)\]/i;

      // will match: "[00:00.00]"
      const LINE_TIME_REGEX = /\[\d{2}:\d{2}(.\d{2,})?\]/g;

      // will match: "<00:00.00>"
      const WORD_TIME_REGEX = /<\d{2}:\d{2}(.\d{2,})?>/g;

      // will match: "<00:00.00> blablabla"
      const ENHANCED_REGEX = /<\d{2}:\d{2}(.\d{2,})?>\s*[^\s|<]*/g;

      /**
       * parse lrc to javascript object
       * @param {string} lrc - lrc text
       * @returns {Object} parsed lrc data
       */
      function parser(lrc) {
            const output = {
                  tags : {},
                  lines: [],
                  enhanced: isEnhanced(lrc)
            };

            if (typeof lrc != 'string' || !lrc.trim()) {
                  console.warn("[Liricle] LRC is empty.");
                  return output;
            }

            const lines = lrc.split(/\r?\n/);

            // parsing started
            lines.forEach(value => {
                  const tag  = parseTag(value);
                  const line = parseLine(value);

                  if (tag)  output.tags[tag.key] = tag.value;
                  if (line) output.lines.push(...line);
            });

            // if lrc has multiple timestamps "[mm:ss.xx]" in the same line.
            // parser will split into individual lines. so, we have to reorder them.
            output.lines = sortLines(output.lines);

            return output;
      }

      /**
       * parse lrc tag
       * @param {string} line - lrc line value
       * @return {(Object|undefined)} extrated tag object or undefined
       */
      function parseTag(line) {
            const [, key, value] = line.match(TAG_REGEX) || [];
            if (!key || !value) return;

            return { key, value: value.trim() };
      }

      /**
       * parse time, text and words from lrc
       * @param {string} line - lrc line value
       * @return {(Array|undefined)} array that contains lrc line object or undefined
       */
      function parseLine(line) {
            const output = [];
            const timestamps = line.match(LINE_TIME_REGEX);

            if (!timestamps) return;

            // lrc can have multiple timestamps "[mm:ss.xx]" on the same line.
            timestamps.forEach(timestamp => {
                  output.push({
                        time : extractTime(timestamp),
                        text : extractText(line),
                        words: extractWords(line)
                  });
            });

            return output;
      }

      /**
       * extract time from lrc line and convert to seconds
       * @param {string} timestamp - time string "[mm:ss.xx]"
       * @returns {number} extracted time number in seconds
       */
      function extractTime(timestamp) {
            let time = timestamp.replace(/\[|\]|<|>/g, "");
            time = convertTime(time);

            return time;
      }

      /**
       * extract text from lrc line
       * @param {string} line - lrc line
       * @returns {string} extracted text
       */
      function extractText(line) {
            let text = line.replace(LINE_TIME_REGEX, "");
                text = text.replace(WORD_TIME_REGEX, "");
                text = text.replace(/\s{2,}/g, " ");

            return text.trim();
      }

      /**
       * extract words from lrc line
       * @param {string} line - lrc line
       * @returns {(Array|null)} extracted words or null
       */
      function extractWords(line) {
            const output = [];
            const words = line.match(ENHANCED_REGEX);

            if (!words) return null;

            words.forEach(word => {
                  // extract timestamp "<00:00.00>" with regex
                  // i think it's easier than split them
                  const timestamp = word.match(WORD_TIME_REGEX)[0];

                  output.push({
                        time: extractTime(timestamp),
                        text: extractText(word)
                  });
            });

            return output;
      }

      /**
       * convert "03:24.73" to 204.73 (total time in seconds)
       * @param {string} time - time string "mm:ss.xx"
       * @returns {number} total time in secondsi
       */
      function convertTime(time) {
            let [min, sec] = time.split(":");

            min = parseFloat(min) * 60;
            sec = parseFloat(sec);

            return min + sec;
      }

      /**
       * sort lines by time (shortest to longest)
       * @param {Array} lines - array of lrc lines objects
       * @returns {Array} sorted lines
       */
      function sortLines(lines) {
            return lines.sort((a, b) => a.time - b.time);
      }

      /**
       * check the lrc format is enhanced or not
       * @param {string} text - lrc text
       * @returns {boolean} is enhanced?
       */
      function isEnhanced(text) {
            return ENHANCED_REGEX.test(text);
      }

      /**
       * find closest word and line from given time
       * @param {Object} data - output data from parser
       * @param {number} time - current time from audio player or something else
       */
      function syncher(data, time) {
            let line = null;
            let word = null;

            const lines = data.lines;
            line = findLine(lines, time);

            if (line != null) {
                  if (data.enhanced) {
                        const words = line.words;
                        word = findWord(words, time);
                  }

                  // delete 'words' property from line
                  // because we don't need it anymore.
                  delete line.words;
            }

            return { line, word };
      }

      /**
       * find closest lyric line
       * @param {Array} lines - array of lrc lines object
       * @param {number} time - time argument
       * @returns {(Object|null)} closest lyric line or null
       */
      function findLine(lines, time) {
            const index = getClosestIndex(lines, time);
            return index != null ? { index, ...lines[index] } : null;
      }

      /**
       * find closest lyric word
       * @param {Array} words - array of lrc line words object
       * @param {number} time - time argument
       * @returns {(Object|null)} closest lyric word or null
       */
      function findWord(words, time) {
            // if words are null, just return it.
            if (words == null) return words;

            const index = getClosestIndex(words, time);
            return index != null ? { index, ...words[index] } : null;
      }

      /**
       *
       * @param {Array} items - array that contains lrc words or lines
       * @param {number} time - time argument
       * @returns {(number|null)} closest index of lyric or null
       */
      function getClosestIndex(items, time) {
            // to find the closest index we just need to subtract each line or word time with the given time
            // then put the value into an array and find the smallest positive value with Math.min()
            // after that we can find the index from smallest value in array with indexOf() method.

            const scores = [];

            items.forEach(item => {
                  const score = time - item.time;
                  if (score >= 0) scores.push(score);
            });

            if (scores.length == 0) return null;

            const smallest = Math.min(...scores);
            const index = scores.indexOf(smallest);

            return index;
      }

      class Liricle {
            #activeLine = null;
            #activeWord = null;
            #isLoaded = false;
            #offset = 0;
            #data = {};
            #onLoad = () => {};
            #onSync = () => {};

            get data() {
                  return this.#data;
            }

            get offset() {
                  return this.#offset;
            }

            /**
             * @param {number} value - lyric offset in milliseconds
             */
            set offset(value) {
                  value = parseFloat(value) / 1000; // convert value to seconds
                  this.#offset = value || 0; // if value is NaN, set 0
            }

            /**
             * method to load lyrics
             * @param {Object} options - object that contains 'url' or 'text' properties
             * @param {string} options.text - lrc text
             * @param {string} options.url - lrc file url
             */
            load(options = {}) {
                  this.#isLoaded = false;

                  if (options.text) { 
                        this.#data = parser(options.text);
                        this.#isLoaded = true;
                        this.#onLoad(this.#data);
                  }
                  
                  if (options.url) {
                        fetch(options.url)
                              .then(res => res.text())
                              .then(text => {
                                    this.#data = parser(text);
                                    this.#isLoaded = true;
                                    this.#onLoad(this.#data);
                              })
                              .catch(error => {
                                    this.#isLoaded = false;
                                    throw Error("[Liricle] Failed to load LRC. " + error.message);
                              });
                  }
            }

            /**
             * method to sync lyrics
             * @param {number} time - current player time or something else in seconds
             * @param {boolean} [continuous] - always emit sync event (optional)
             */
            sync(time, continuous = false) {
                  if (!this.#isLoaded) {
                        // if lrc is not loaded, stop execution.
                        return console.warn("[Liricle] LRC not loaded yet.");
                  }

                  const { enhanced } = this.#data;
                  const { line, word } = syncher(this.#data, time + this.offset);

                  if (line == null && word == null) return;

                  if (continuous) {
                        return this.#onSync(line, word);
                  }

                  const isSameLine = line.index == this.#activeLine;
                  const isSameWord = word != null && word.index == this.#activeWord;

                  if (enhanced && word != null) {
                        if (isSameLine && isSameWord) return;
                  } else { 
                        if (isSameLine) return;
                  }

                  this.#onSync(line, word);

                  this.#activeLine = line.index;
                  this.#activeWord = word != null ? word.index : null;
            }

            /**
             * listen to liricle event
             * @param {string} event - event name
             * @param {function} callback - event callback
             */
            on(event, callback) {
                  switch (event) {
                        case "load":
                              this.#onLoad = callback;
                              break;
                        case "sync":
                              this.#onSync = callback;
                              break;
                  }
            }
      }

      return Liricle;

}));
