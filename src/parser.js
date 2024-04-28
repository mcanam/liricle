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
export default function parser(lrc) {
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
