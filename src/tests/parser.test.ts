import parser from '../parser';
import { ParserOptions } from '../types';

describe('parser', () => {
      const simpleLrc = `
      [00:12.46] Sample lyrics line 1
      [00:16.28] Sample lyrics line 2
      [00:21.14] Sample lyrics line 3`;

      const enhancedLrc = `
      [00:12.46] <00:12.46> Sample <00:12.69> lyrics <00:13.02> line <00:13.78> 1
      [00:16.28] <00:16.28> Sample <00:16.56> lyrics <00:17.07> line <00:17.66> 2
      [00:21.14] <00:21.14> Sample <00:21.42> lyrics <00:21.69> line <00:22.20> 3`;

      test('parse simple lrc', () => {
            const options: ParserOptions = { skipBlankLine: true };
            const result = parser(simpleLrc, options);

            expect(result.tags).toEqual({});
            expect(result.lines.length).toBe(3);
            expect(result.enhanced).toBe(false);

            expect(result.lines[0].text).toBe('Sample lyrics line 1');
            expect(result.lines[0].time).toBe(12.46);
            expect(result.lines[0].words).toBeNull();
            expect(result.lines[1].text).toBe('Sample lyrics line 2');
            expect(result.lines[1].time).toBe(16.28);
            expect(result.lines[1].words).toBeNull();
            expect(result.lines[2].text).toBe('Sample lyrics line 3');
            expect(result.lines[2].time).toBe(21.14);
            expect(result.lines[2].words).toBeNull();
      });

      test('parse enhanced lrc', () => {
            const options: ParserOptions = { skipBlankLine: true };
            const result = parser(enhancedLrc, options);

            expect(result.tags).toEqual({});
            expect(result.lines.length).toBe(3);
            expect(result.enhanced).toBe(true);

            expect(result.lines[0].text).toBe('Sample lyrics line 1');
            expect(result.lines[0].time).toBe(12.46);
            expect(result.lines[0].words?.length).toBe(4);
            expect(result.lines[0].words?.[0].text).toBe('Sample');
            expect(result.lines[0].words?.[0].time).toBe(12.46);
            expect(result.lines[0].words?.[1].text).toBe('lyrics');
            expect(result.lines[0].words?.[1].time).toBe(12.69);
            expect(result.lines[0].words?.[2].text).toBe('line');
            expect(result.lines[0].words?.[2].time).toBe(13.02);
            expect(result.lines[0].words?.[3].text).toBe('1');
            expect(result.lines[0].words?.[3].time).toBe(13.78);
      });

      test('skips blank lines if skipBlankLine is true', () => {
            const lrc = `
            [00:12.46] Sample lyrics line 1
            [00:16.28] 
            [00:21.14] Sample lyrics line 3`;

            const options: ParserOptions = { skipBlankLine: true };
            const result = parser(lrc, options);

            expect(result.lines.length).toBe(2);
      });

      test('includes blank lines if skipBlankLine is false', () => {
            const lrc = `
            [00:12.46] Sample lyrics line 1
            [00:16.28] 
            [00:21.14] Sample lyrics line 3`;

            const options: ParserOptions = { skipBlankLine: false };
            const result = parser(lrc, options);

            expect(result.lines.length).toBe(3);
      });

      test('parse lrc tags', () => {
            const lrc = `
            [ar: Artist]
            [ti: Title]
            [al: Album]
            [au: Author]
            [by: Liricle]
            [length: 2:23]
            [offset: 400]
            [re: Liricle]
            [ve: 4.0.1]`;

            const options: ParserOptions = { skipBlankLine: true };
            const result = parser(lrc, options);

            expect(result.tags).toEqual({
                  ar: 'Artist',
                  ti: 'Title',
                  al: 'Album',
                  au: 'Author',
                  by: 'Liricle',
                  length: '2:23',
                  offset: '400',
                  re: 'Liricle',
                  ve: '4.0.1'
            });
      });
});
