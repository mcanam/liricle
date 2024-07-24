import { LineData, LyricsData, SyncedData, WordData } from './types';

/**
 * Find the closest word and line from the given time.
 * @param { LyricsData } data - Lyrics data.
 * @param { number } time - The current time from the audio player or another source.
 * @returns { SyncedData } - The closest line and word.
 */
export default function syncer(data: LyricsData, time: number): SyncedData {
      let line: LineData | null = findLine(data.lines, time);
      let word: WordData | null = null;

      if (data.enhanced && line?.words) {
            word = findWord(line.words, time);
      }

      delete line?.words;
      return { line, word };
}

/**
 * Find the closest lyrics line.
 * @param { LineData[] } lines - The array of line data.
 * @param { number } time - The current time from the audio player or another source.
 * @returns { LineData | null } - The closest lyrics line or null.
 */
function findLine(lines: LineData[], time: number): LineData | null {
      const index = getClosestIndex(lines, time);
      return index !== null ? { index, ...lines[index] } : null;
}

/**
 * Find the closest lyrics word.
 * @param { WordData[] } words - The array of word data.
 * @param { number } time - The current time from the audio player or another source.
 * @returns { WordData | null } - The closest lyrics word or null.
 */
function findWord(words: WordData[] | undefined, time: number): WordData | null {
      if (!words) return null;

      const index = getClosestIndex(words, time);
      return index !== null ? { index, ...words[index] } : null;
}

/**
 * Get the closest index of lyrics.
 * @param { Array<LineData | WordData> } data - The array that contains word or line data.
 * @param { number } time - The current time from the audio player or another source.
 * @returns { number | null } - The closest index of lyrics or null.
 */
function getClosestIndex(data: LineData[] | WordData[], time: number): number | null {
      const gaps: number[] = [];

      data.forEach(item => {
            const gap = time - item.time;
            if (gap >= 0) gaps.push(gap);
      });

      if (gaps.length === 0) return null;

      const smallest = Math.min(...gaps);
      const index = gaps.indexOf(smallest);

      return index;
}
