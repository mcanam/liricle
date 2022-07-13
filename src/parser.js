// will match: "[name:value]"
const TAGS_REGEX = /\[([a-z]+):(.+)\]/i;

// will match: "[00:00.00]" one or more.
const TIME_REGEX = /\[\d{2}:\d{2}(.\d{2,})?\]{1,}/g;

// will match: "<00:00.00> blablabla".
const WORD_REGEX = /(<\d{2}:\d{2}.\d{2,}>\s{0,}([^\s]+))/g;

// only match: "<00:00.00>". This is used to extract time
const WORD_TIME_REGEX = /\<\d{2}:\d{2}(.\d{2,})?\>/;

function parser(lrc) {
      const output = {
            lines: [],
            info: {},
            enhanced: false,
      };

      let wordIndex = 0;

      // check if the lrc file is enhanced or not
      if (WORD_TIME_REGEX.test(lrc)) {
            output.enhanced = true;
      }

      const lines = lrc.split(/\r|\n/);

      lines.forEach((line) => {
            parseTags(line);
            parseTime(line);
      });

      function parseTags(line) {
            const match = line.match(TAGS_REGEX);

            if (match == null) return;

            const name = match[1];
            const value = match[2].trim();

            output.info[name] = value;
      }

      function parseTime(line) {
            const match = line.match(TIME_REGEX);

            if (match == null) return;

            match.forEach((value) => {
                  output.lines.push({
                        time: convertTime(value),
                        text: extractText(line),
                        words: extractWords(line), // new property
                  });
            });
      }

      function extractText(line) {
            // clean up text from timestamp
            line = line.replace(TIME_REGEX, "");
            line = line.replace(WORD_TIME_REGEX, "");

            return line.trim();
      }

      function extractWords(line) {
            const match = line.match(WORD_REGEX);
            const words = [];

            if (match == null) return null;

            match.forEach((value) => {
                  // since we don't know whether timestamp 
                  // and text are separated by spaces or not.
                  // so we just extract it, then pass it to 
                  // the existing convertTime() function.
                  const time = value.match(WORD_TIME_REGEX)[0];

                  words.push({
                        index: wordIndex,
                        time: convertTime(time),
                        text: extractText(value)
                  });

                  wordIndex += 1;
            });

            return words;
      }

      function convertTime(time) {
            time = time.replace(/\[|\]|<|>/g, "");
            time = time.split(":");

            let [min, sec] = time;

            min = parseInt(min) * 60;
            sec = parseFloat(sec);

            return min + sec;
      }

      function sortLines(data) {
            return data.sort((a, b) => a.time - b.time);
      }

      output.lines = sortLines(output.lines);
      return output;
}

export default parser;
