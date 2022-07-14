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

export default sync;
