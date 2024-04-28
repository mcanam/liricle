import Liricle from "../src/liricle.js";
import { assert } from 'chai';

import {
      SIMPLE_LYRICS_TEXT,
      ENHANCED_LYRICS_TEXT,
      SIMPLE_LYRICS_DATA,
      ENHANCED_LYRICS_DATA
} from './_data.js';

describe('Liricle Test', () => {
      let liricle;

      beforeEach(() => {
            liricle = new Liricle();
      });

      describe('#load', () => {
            it('should load lyrics from text (simple)', done => {
                  liricle.on('load', data => {
                        assert.deepEqual(data, SIMPLE_LYRICS_DATA);
                        done();
                  });

                  liricle.load({ text: SIMPLE_LYRICS_TEXT });
            });

            it('should load lyrics from text (enhanced)', done => {
                  liricle.on('load', data => {
                        assert.deepEqual(data, ENHANCED_LYRICS_DATA);
                        done();
                  });

                  liricle.load({ text: ENHANCED_LYRICS_TEXT });
            });

            it('should load lyrics from url (simple)', done => {
                  global.fetch = async () => ({
                        text: async () => SIMPLE_LYRICS_TEXT
                  });

                  liricle.on('load', data => {
                        assert.deepEqual(data, SIMPLE_LYRICS_DATA);
                        done();
                  });

                  liricle.load({ url: 'https://example.com/lyrics.lrc' });
            });

            it('should load lyrics from url (enhanced)', done => {
                  global.fetch = async () => ({
                        text: async () => ENHANCED_LYRICS_TEXT
                  });

                  liricle.on('load', data => {
                        assert.deepEqual(data, ENHANCED_LYRICS_DATA);
                        done();
                  });

                  liricle.load({ url: 'https://example.com/lyrics.lrc' });
            });
      });

      describe('#sync', () => {
            it('should sync lyrics (simple)', done => {
                  liricle.on('load', () => {
                        liricle.sync(12.50);
                  });

                  liricle.on('sync', (line, word) => {
                        assert.deepEqual(line, {
                              index: 0,
                              time: 12.46,
                              text: "I would like to leave this city"
                        });
                        assert.isNull(word);
                        done();
                  });

                  liricle.load({ text: SIMPLE_LYRICS_TEXT });
            });

            it('should sync lyrics (enhanced)', done => {
                  liricle.on('load', () => {
                        liricle.sync(12.50);
                  });

                  liricle.on('sync', (line, word) => {
                        assert.deepEqual(line, {
                              index: 0,
                              time: 12.46,
                              text: "I would like to leave this city"
                        });

                        assert.deepEqual(word, {
                              index: 0,
                              time: 12.46,
                              text: "I"
                        });

                        done();
                  });

                  liricle.load({ text: ENHANCED_LYRICS_TEXT });
            });
      });
});
