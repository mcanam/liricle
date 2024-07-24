import { ENHANCED_REGEX, LINE_TIME_REGEX, TAG_REGEX, WORD_TIME_REGEX } from './constants';
import { LineData, LyricsData, ParserOptions, TagsData, WordData } from './types';

/**
 * Parse lrc string to lyrics data.
 * @param { string } input - The lrc string.
 * @param { ParserOptions } options - The parser options.
 * @returns { LyricsData } - The parsed lyrics data.
 */
export default function parser(input: string, options: ParserOptions): LyricsData {
      const lines = input.split(/\r?\n/).map(line => line.trim());
      const skipBlankLine = options?.skipBlankLine ?? true;

      const output: LyricsData = {
            tags: {},
            lines: [],
            enhanced: isEnhanced(input)
      };

      lines.forEach(line => {
            if (!line) return;

            const tag = parseTag(line);
            const lines = parseLines(line, skipBlankLine);

            if (tag) Object.assign(output.tags, tag);
            if (lines) output.lines.push(...lines);
      });

      output.lines = output.lines.sort((a, b) => a.time - b.time);
      return output;
}

/**
 * Parse tag from the given line.
 * @param { string } line - The line to parse.
 * @returns { TagsData | null } - The parsed tag or null.
 */
function parseTag(line: string): TagsData | null {
      const match = line.match(TAG_REGEX);
      const key = match?.[1];
      const value = match?.[2];

      if (!key || !value) return null;
      return { [key]: value.trim() };
}

/**
 * Parses time, text and words from the given line.
 * @param { string } line - The line to parse.
 * @param { boolean } skipBlankLine - Skip blank line.
 * @returns { LineData[] | null } - The parsed lines or undefined.
 */
function parseLines(line: string, skipBlankLine: boolean): LineData[] | null {
      const output: LineData[] = [];
      const timestamps = line.match(LINE_TIME_REGEX);

      if (!timestamps) return null;

      // lrc can have multiple timestamps [mm:ss.xx] on the same line.
      timestamps.forEach(timestamp => {
            const text = extractText(line);
            if (!text && skipBlankLine) return;

            const time = extractTime(timestamp);
            const words =  extractWords(line);

            output.push({ time, text, words });
      });

      return output;
}

/**
 * Extracts the time from a timestamp.
 * @param { string } timestamp - The timestamp string [mm:ss.xx].
 * @returns { number } - The extracted time in seconds.
 */
function extractTime(timestamp: string): number {
      const time = timestamp.replace(/\[|\]|<|>/g, '');
      return converTime(time);
}

/**
 * Extracts the text from a line, removing timestamps.
 * @param { string } line - The line to extract text from.
 * @returns { string } - The extracted text.
 */
function extractText(line: string): string {
      return line
            .replace(LINE_TIME_REGEX, '')
            .replace(WORD_TIME_REGEX, '')
            .replace(/\s{2,}/g, ' ')
            .trim();
}

/**
 * Extracts the words with timestamps from a line.
 * @param { string } line - The line to extract words from.
 * @returns { WordData[] | null } - The extracted words or null.
 */
function extractWords(line: string): WordData[] | null {
      const output: WordData[] = [];
      const words = line.match(ENHANCED_REGEX);

      if (!words) return null;

      words.forEach(word => {
            const timestamp = word.match(WORD_TIME_REGEX)?.[0];
            if (!timestamp) return;

            output.push({
                  time: extractTime(timestamp),
                  text: extractText(word)
            });
      });

      return output;
}
/**
 * Converts a time string to seconds.
 * @param { string } time - The time string in the format "mm:ss.xx".
 * @returns { number } - The time in seconds.
 */
function converTime(time: string): number {
      let [min, sec]: (string | number)[] = time.split(":");

      min = parseFloat(min) * 60;
      sec = parseFloat(sec);

      return min + sec;
}

/**
 * Checks if the lrc string contains enhanced lyrics.
 * @param { string } input - The input string.
 * @returns { boolean } - True if the input contains enhanced lyrics, otherwise false.
 */
function isEnhanced(input: string): boolean {
      return ENHANCED_REGEX.test(input);
}
