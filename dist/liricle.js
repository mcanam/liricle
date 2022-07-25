
/*!
 * liricle v3.1.0
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
      const TAGS_REGEX = /\[([a-z]+):(.*)\]/i;

      // will match: "<00:00.00> blablabla"
      const WORD_REGEX = /<\d{2}:\d{2}(.\d{2,})?>\s*[^\s|<]*/g;

      // will match: "[00:00.00]"
      const LINE_TIME_REGEX = /\[\d{2}:\d{2}(.\d{2,})?\]/g;

      // will match: "<00:00.00>"
      const WORD_TIME_REGEX = /<\d{2}:\d{2}(.\d{2,})?>/g;

      /**
       * parse lrc to javascript object
       * @param {string} text - lrc text
       * @returns {Object} parsed data from lrc
       */
      function parser(text) {
            const lines = text.split(/\r?\n/);
            
            const output = {
                  tags: {},
                  lines: [],
                  enhanced: isEnhanced(text)
            };

            // parsing started
            lines.forEach(value => {
                  const tags = extractTags(value);
                  const line = extractLine(value);

                  if (tags) output.tags[tags.name] = tags.value;
                  if (line) output.lines.push(...line);
            });

            // if lrc has multiple time in the same line 
            // parser will split them into individual lines 
            // so we have to reorder them.
            output.lines = sortLines(output.lines);

            return output;
      }

      /**
       * extract tag data from lrc
       * @param {string} text - lrc line
       * @return {(Object|undefined)} extrated tag object or undefined
       */
       function extractTags(text) {
            const tags = text.match(TAGS_REGEX);

            if (!tags) return;

            return { 
                  name: tags[1], 
                  value: tags[2].trim() 
            };
      }

      /**
       * extract time, text and words from lrc
       * @param {string} line - lrc line
       * @return {(Array|undefined)} array that contains lrc line object or undefined
       */
       function extractLine(line) {
            const times = line.match(LINE_TIME_REGEX);
            const bucket = [];

            if (!times) return;

            times.forEach(value => {
                  bucket.push({
                        time: extractTime(value),
                        text: extractText(line),
                        words: extractWords(line),
                  });
            });

            return bucket;
      }

      /**
       * extract time from lrc line and convert to seconds
       * @param {string} line - time string "[mm:ss.xx]"
       * @returns {number} extracted time number in seconds
       */
       function extractTime(line) {
            let time = line.replace(/\[|\]|<|>/g, "");
            time = convertTime(time);

            return time;
      }

      /**
       * extract words from lrc line
       * @param {string} line - lrc line
       * @returns {(Array|null)} extracted words or null
       */
       function extractWords(line) {
            const words = line.match(WORD_REGEX);
            const bucket = [];

            if (!words) return null;

            words.forEach(value => {
                  // extract timestamp "<00:00.00>" with regex
                  // i think it's easier than split them
                  const time = value.match(WORD_TIME_REGEX)[0];

                  bucket.push({
                        time: extractTime(time),
                        text: extractText(value),
                  });
            });

            return bucket;
      }

      /**
       * extract text from lrc line
       * @param {string} line - lrc line
       * @returns {string} extracted text
       */
       function extractText(line) {
            let text = line.replace(LINE_TIME_REGEX, "");
            text = text.replace(WORD_TIME_REGEX, "");

            return text.trim();
      }

      /**
       * convert "[03:24.73]" to 204.73 (total time in seconds)
       * @param {string} time - time string "mm:ss.xx"
       * @returns {number} total time in seconds
       */
       function convertTime(time) {
            let [min, sec] = time.split(":");

            min = parseFloat(min) * 60;
            sec = parseFloat(sec);

            return min + sec;
      }

      /**
       * sort lines by time (shortest to longest)
       * @param {Array} lines - parsed lrc lines
       * @returns {Array} sorted lines
       */
      function sortLines(lines) {
            return lines.sort((a, b) => a.time - b.time);
      }

      /**
       * check the lrt format is enhanced or not
       * @param {string} text - lrc text
       * @returns {boolean} is enhanced?
       */
      function isEnhanced(text) {
            return WORD_TIME_REGEX.test(text);
      }

      /**
       * find closest lyric word and line from given time
       * @param {Object} data - output data from parser
       * @param {number} time - current time from audio player or something else
       */
      function sync(data, time) {
            let line = null;
            let word = null;

            const lines = data.lines;
            line = findLine(lines, time);

            if (line != null && data.enhanced) {
                  const words = line.words;
                  word = findWord(words, time);

                  // delete 'words' property from line
                  // because we don't need it anymore.
                  delete line.words;
            }

            return { line, word };
      }

      /**
       * find closest lyric line
       * @param {Array} lines - array that contains lyric lines
       * @param {number} time - time argument of the sync function
       * @returns {(Object|null)} closest lyric line or null
       */
      function findLine(lines, time) {
            const index = getClosestIndex(lines, time);
            return index != null ? { index, ...lines[index] } : null;
      }

      /**
       * find closest lyric word
       * @param {Array} words - array that contains lyric words
       * @param {number} time - time argument of the sync function
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
       * @param {Array} items - array that contains lyric words or lines
       * @param {number} time - time argument of the sync function
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
            #onInit = () => {};
            #onSync = () => {};

            constructor() {
                  this.data = null;
            }

            /**
             * initialize Liricle
             * @param {Object} options
             * @param {string} options.text - lrc text
             * @param {string} options.url - lrc file url
             */
            async init({ text, url }) {            
                  if (url) {
                        try {
                              const resp = await fetch(url);

                              if (!resp.ok) {
                                    throw Error(`${resp.status} ${resp.statusText} (${resp.url})`);
                              }

                              const body = await resp.text();
                              this.data = parser(body);
                        } 
                        
                        catch (error) {
                              throw Error(`Liricle.init(): ${error.message}`);
                        }
                  } 

                  else if (text) {
                        this.data = parser(text);
                  } 
                  
                  else {
                        throw Error(`Liricle.init(): missing argument`);
                  }
                  
                  this.#onInit(this.data);
            }

            /**
             * sync lyric with current time
             * @param {number} time - currrent time from audio player or something else in seconds
             * @param {number} offset - lyric offset in seconds
             * @param {boolean} continuous - always emit sync event 
             */
            sync(time, offset = 0, continuous = false) {
                  if (time == undefined) {
                        throw Error("Liricle.sync(): missing 'time' argument");
                  }

                  if (typeof time != "number") {
                        throw Error("Liricle.sync(): 'time' argument must be a number!");
                  }

                  if (typeof offset != "number") {
                        throw Error("Liricle.sync(): 'offset' argument must be a number!");
                  }

                  if (typeof continuous != "boolean") {
                        throw Error("Liricle.sync(): 'continuous' argument must be a boolean!");
                  }

                  const { line, word } = sync(this.data, time + offset);
                  
                  if (line == null && word == null) return;

                  if (this.data.enhanced && word != null) {
                        if (
                              continuous == false &&
                              line.index == this.#activeLine &&
                              word.index == this.#activeWord
                        ) return;

                        this.#activeLine = line.index;
                        this.#activeWord = word.index;
                  }

                  else {
                        if (
                              continuous == false &&
                              line.index == this.#activeLine
                        ) return;
                        
                        this.#activeLine = line.index;
                  }

                  this.#onSync(line, word);
            }

            /**
             * listen to lyricle event
             * @param {string} event - event name
             * @param {function} callback - event callback
             */
            on(event, callback) {
                  if (typeof callback != "function") {
                        throw Error("Liricle.on(): 'callback' argument must be a function!");
                  }

                  switch (event) {
                        case "init":
                              this.#onInit = callback;
                              break;
                        case "sync":
                              this.#onSync = callback;
                              break;
                  }
            }
      }

      return Liricle;

}));
