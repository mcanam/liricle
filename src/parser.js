// will match: "[tag:value]"
const TAGS_REGEX = /\[(ar|ti|al|au|by|length|offset|re|ve):(.*)\]/i;

// will match: "<00:00.00> blablabla"
const WORD_REGEX = /<\d{2}:\d{2}(.\d{2,})?>\s*[^\s|<]*/g;

// will match: "[00:00.00]"
const LINE_TIME_REGEX = /\[\d{2}:\d{2}(.\d{2,})?\]/g;

// will match: "<00:00.00>"
const WORD_TIME_REGEX = /<\d{2}:\d{2}(.\d{2,})?>/g;

/**
 * parse lrc to javascript object
 * @param {string} text - lrc text
 * @returns {Object} parsed lrc data
 */
export default function parser(text) {
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

      // if lrc has multiple timestamps "[mm:ss.xx]" in the same line
      // parser will split into individual lines
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
                  words: extractWords(line)
            });
      });

      return bucket;
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
      const words = line.match(WORD_REGEX);
      const bucket = [];

      if (!words) return null;

      words.forEach(value => {
            // extract timestamp "<00:00.00>" with regex
            // i think it's easier than split them
            const time = value.match(WORD_TIME_REGEX)[0];

            bucket.push({
                  time: extractTime(time),
                  text: extractText(value)
            });
      });

      return bucket;
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
      return WORD_TIME_REGEX.test(text);
}
