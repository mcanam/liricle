/**
 * find closest word and line from given time
 * @param {Object} data - output data from parser
 * @param {number} time - current time from audio player or something else
 */
export default function syncher(data, time) {
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
