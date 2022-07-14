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
            // extract timestamp. "<00:00.00>."
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

export default parser;
