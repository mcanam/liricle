import Liricle from '../liricle';
import { LyricsData } from '../types';

describe('Liricle', () => {
      const sampleLrc = `
      [00:12.46] Sample lyrics line 1
      [00:16.28] Sample lyrics line 2
      [00:21.14] Sample lyrics line 3`;

      const sampleLyricsData: LyricsData = {
            tags: {},
            lines: [
                  { time: 12.46, text: 'Sample lyrics line 1', words: null },
                  { time: 16.28, text: 'Sample lyrics line 2', words: null },
                  { time: 21.14, text: 'Sample lyrics line 3', words: null }
            ],
            enhanced: false
      };

      let liricle: Liricle;

      beforeEach(() => {
            liricle = new Liricle();
      });

      afterEach(() => {
            jest.clearAllMocks();
      });

      test('throws error if both text and url are provided', () => {
            // @ts-ignore
            expect(() => liricle.load({ text: sampleLrc, url: 'http://example.com' })).toThrow('[Liricle]: text and url options cant be used together.');
      });

      test('throws error if no text or url are provided', () => {
            // @ts-ignore
            expect(() => liricle.load({ })).toThrow('[Liricle]: text or url options required.');
      });

      test('loads lyrics from text', () => {
            liricle.on('load', data => {
                  expect(data).toEqual(sampleLyricsData);
            });

            liricle.load({ text: sampleLrc });
      });

      test('loads lyrics from url', () => {
            const mockResponse = {
                  ok: true,
                  text: jest.fn().mockResolvedValue(sampleLrc),
            };

            global.fetch = jest.fn().mockResolvedValue(mockResponse);

            liricle.on('load', data => {
                  expect(data).toEqual(sampleLyricsData);
            });

            liricle.load({ url: 'http://example.com/sample.lrc' });
      });

      test('handle fetch error correctly',  () => {
            const mockResponse = {
                  ok: false,
                  status: 404,
                  statusText: 'Not Found'
            };

            global.fetch = jest.fn().mockResolvedValue(mockResponse);

            liricle.on('loaderror', error => {
                  expect(error.message).toEqual('Network error with status 404');
            });

            liricle.load({ url: 'http://example.com/sample.lrc' });
      });

      test('synchronizes lyrics correctly', () => {
            liricle.on('sync', (line, word) => {
                  expect(line?.text).toBe('Sample lyrics line 2');
                  expect(line?.time).toBe(16.28);
                  expect(word).toBeNull();
            });

            liricle.load({ text: sampleLrc });
            liricle.sync(16.28);
      });

      test('handles offset correctly', () => {
            liricle.on('sync', (line, word) => {
                  expect(line?.text).toBe('Sample lyrics line 3');
                  expect(line?.time).toBe(21.14);
                  expect(word).toBeNull();
            });

            liricle.offset = 1000; // 1000 ms = 1 second
            expect(liricle.offset).toBe(1);

            liricle.load({ text: sampleLrc });
            liricle.sync(20.14); // With offset 1 second, it should sync at 21.14
      });
});
