import syncer from '../syncer';
import { LyricsData } from '../types';

describe('syncer', () => {
      const simpleLyricsData: LyricsData = {
            tags: {},
            lines: [
                  { time: 12.46, text: 'Sample lyrics line 1', words: null },
                  { time: 16.28, text: 'Sample lyrics line 2', words: null },
                  { time: 21.14, text: 'Sample lyrics line 3', words: null }
            ],
            enhanced: false
      };

      const enhancedLyricsData: LyricsData = {
            tags: {},
            lines: [
                  {
                        time: 12.46,
                        text: 'Sample lyrics line 1',
                        words: [
                              { time: 12.46, text: 'Sample' },
                              { time: 12.69, text: 'lyrics' },
                              { time: 13.02, text: 'line' },
                              { time: 13.78, text: '1' }
                        ]
                  },
                  {
                        time: 16.28,
                        text: 'Sample lyrics line 2',
                        words: [
                              { time: 16.28, text: 'Sample' },
                              { time: 16.56, text: 'lyrics' },
                              { time: 17.07, text: 'line' },
                              { time: 17.66, text: '2'}
                        ]
                  },
                  {
                        time: 21.14,
                        text: 'Sample lyrics line 3',
                        words: [
                              { time: 21.14, text: 'Sample' },
                              { time: 21.42, text: 'lyrics' },
                              { time: 21.69, text: 'line' },
                              { time: 22.2, text: '3' }
                        ]
                  }
            ],
            enhanced: true
      };

      test('sync simple lyrics data', () => {
            const result1 = syncer(simpleLyricsData, 0);

            expect(result1.line).toBeNull();
            expect(result1.word).toBeNull();

            const result2 = syncer(simpleLyricsData, 16.27);

            expect(result2.line?.index).toBe(0);
            expect(result2.line?.text).toBe('Sample lyrics line 1');
            expect(result2.word).toBeNull();

            const result3 = syncer(simpleLyricsData, 16.28);

            expect(result3.line?.index).toBe(1);
            expect(result3.line?.text).toBe('Sample lyrics line 2');
            expect(result3.word).toBeNull();

            const result4 = syncer(simpleLyricsData, 106.28);

            expect(result4.line?.index).toBe(2);
            expect(result4.line?.text).toBe('Sample lyrics line 3');
            expect(result4.word).toBeNull();
      });

      test('sync enhanced lyrics data', () => {
            const result1 = syncer(enhancedLyricsData, 0);

            expect(result1.line).toBeNull();
            expect(result1.word).toBeNull();

            const result2 = syncer(enhancedLyricsData, 12.50);

            expect(result2.line?.index).toBe(0);
            expect(result2.line?.text).toBe('Sample lyrics line 1');
            expect(result2.word?.index).toBe(0);
            expect(result2.word?.text).toBe('Sample');

            const result3 = syncer(enhancedLyricsData, 15.30);

            expect(result3.line?.index).toBe(0);
            expect(result3.line?.text).toBe('Sample lyrics line 1');
            expect(result3.word?.index).toBe(3);
            expect(result3.word?.text).toBe('1');

            const result4 = syncer(enhancedLyricsData, 21.52);

            expect(result4.line?.index).toBe(2);
            expect(result4.line?.text).toBe('Sample lyrics line 3');
            expect(result4.word?.index).toBe(1);
            expect(result4.word?.text).toBe('lyrics');
      });
});
