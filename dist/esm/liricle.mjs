
/*!
 * liricle v4.2.0
 * Lyrics Synchronizer
 * https://github.com/mcanam/liricle#readme
 * MIT license by mcanam
 */

// will match: "[tag:value]"
const TAG_REGEX = /\[(ar|ti|al|au|by|length|offset|re|ve):(.*)\]/i;
// will match: "[00:00.00]"
const LINE_TIME_REGEX = /\[\d{2}:\d{2}(.\d{2,})?\]/g;
// will match: "<00:00.00>"
const WORD_TIME_REGEX = /<\d{2}:\d{2}(.\d{2,})?>/g;
// will match: "<00:00.00> blablabla"
const ENHANCED_REGEX = /<\d{2}:\d{2}(.\d{2,})?>\s*[^\s|<]*/g;

/**
 * Parse lrc string to lyrics data.
 * @param { string } input - The lrc string.
 * @param { ParserOptions } options - The parser options.
 * @returns { LyricsData } - The parsed lyrics data.
 */
function parser(input, options) {
    const lines = input.split(/\r?\n/).map(line => line.trim());
    const skipBlankLine = options?.skipBlankLine ?? true;
    const output = {
        tags: {},
        lines: [],
        enhanced: isEnhanced(input)
    };
    lines.forEach(line => {
        if (!line)
            return;
        const tag = parseTag(line);
        const lines = parseLines(line, skipBlankLine);
        if (tag)
            Object.assign(output.tags, tag);
        if (lines)
            output.lines.push(...lines);
    });
    output.lines = output.lines.sort((a, b) => a.time - b.time);
    return output;
}
/**
 * Parse tag from the given line.
 * @param { string } line - The line to parse.
 * @returns { TagsData | null } - The parsed tag or null.
 */
function parseTag(line) {
    const match = line.match(TAG_REGEX);
    const key = match?.[1];
    const value = match?.[2];
    if (!key || !value)
        return null;
    return { [key]: value.trim() };
}
/**
 * Parses time, text and words from the given line.
 * @param { string } line - The line to parse.
 * @param { boolean } skipBlankLine - Skip blank line.
 * @returns { LineData[] | null } - The parsed lines or undefined.
 */
function parseLines(line, skipBlankLine) {
    const output = [];
    const timestamps = line.match(LINE_TIME_REGEX);
    if (!timestamps)
        return null;
    // lrc can have multiple timestamps [mm:ss.xx] on the same line.
    timestamps.forEach(timestamp => {
        const text = extractText(line);
        if (!text && skipBlankLine)
            return;
        const time = extractTime(timestamp);
        const words = extractWords(line);
        output.push({ time, text, words });
    });
    return output;
}
/**
 * Extracts the time from a timestamp.
 * @param { string } timestamp - The timestamp string [mm:ss.xx].
 * @returns { number } - The extracted time in seconds.
 */
function extractTime(timestamp) {
    const time = timestamp.replace(/\[|\]|<|>/g, '');
    return converTime(time);
}
/**
 * Extracts the text from a line, removing timestamps.
 * @param { string } line - The line to extract text from.
 * @returns { string } - The extracted text.
 */
function extractText(line) {
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
function extractWords(line) {
    const output = [];
    const words = line.match(ENHANCED_REGEX);
    if (!words)
        return null;
    words.forEach(word => {
        const timestamp = word.match(WORD_TIME_REGEX)?.[0];
        if (!timestamp)
            return;
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
function converTime(time) {
    let [min, sec] = time.split(":");
    min = parseFloat(min) * 60;
    sec = parseFloat(sec);
    return min + sec;
}
/**
 * Checks if the lrc string contains enhanced lyrics.
 * @param { string } input - The input string.
 * @returns { boolean } - True if the input contains enhanced lyrics, otherwise false.
 */
function isEnhanced(input) {
    return ENHANCED_REGEX.test(input);
}

/**
 * Find the closest word and line from the given time.
 * @param { LyricsData } data - Lyrics data.
 * @param { number } time - The current time from the audio player or another source.
 * @returns { SyncedData } - The closest line and word.
 */
function syncer(data, time) {
    let line = findLine(data.lines, time);
    let word = null;
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
function findLine(lines, time) {
    const index = getClosestIndex(lines, time);
    return index !== null ? { index, ...lines[index] } : null;
}
/**
 * Find the closest lyrics word.
 * @param { WordData[] } words - The array of word data.
 * @param { number } time - The current time from the audio player or another source.
 * @returns { WordData | null } - The closest lyrics word or null.
 */
function findWord(words, time) {
    if (!words)
        return null;
    const index = getClosestIndex(words, time);
    return index !== null ? { index, ...words[index] } : null;
}
/**
 * Get the closest index of lyrics.
 * @param { Array<LineData | WordData> } data - The array that contains word or line data.
 * @param { number } time - The current time from the audio player or another source.
 * @returns { number | null } - The closest index of lyrics or null.
 */
function getClosestIndex(data, time) {
    const gaps = [];
    data.forEach(item => {
        const gap = time - item.time;
        if (gap >= 0)
            gaps.push(gap);
    });
    if (gaps.length === 0)
        return null;
    const smallest = Math.min(...gaps);
    const index = gaps.indexOf(smallest);
    return index;
}

class Liricle {
    /* private */ #data = null;
    /* private */ #offset = 0;
    /* private */ #activeLine = null;
    /* private */ #activeWord = null;
    /* private */ #isLoaded = false;
    /* private */ #onLoad = () => { };
    /* private */ #onLoadError = () => { };
    /* private */ #onSync = () => { };
    /**
     * Gets the currently loaded lyrics data.
     * @returns { LyricsData | null } Lyrics data or null.
     */
    get data() {
        return this.#data;
    }
    /**
     * Gets current offset in seconds.
     * @returns { number } Lyric offset in seconds.
     */
    get offset() {
        return this.#offset;
    }
    /**
     * Sets the lyric offset in milliseconds.
     * @param { number } value - Lyric offset in milliseconds
     */
    set offset(value) {
        this.#offset = value / 1000;
    }
    /**
     * Load lyrics from either text or url.
     * @param { LoadOptions } options - Load options.
     */
    load(options) {
        const text = options?.text;
        const url = options?.url;
        const skipBlankLine = options?.skipBlankLine ?? true;
        this.#isLoaded = false;
        this.#activeLine = null;
        this.#activeWord = null;
        if (!text?.trim() && !url?.trim()) {
            throw Error('[Liricle]: text or url options required.');
        }
        if (text && url) {
            throw Error('[Liricle]: text and url options cant be used together.');
        }
        if (text) {
            this.#data = parser(text, { skipBlankLine });
            this.#isLoaded = true;
            this.#onLoad(this.#data);
        }
        if (url) {
            fetch(url)
                .then(res => {
                if (!res.ok)
                    throw Error('Network error with status ' + res.status);
                return res.text();
            })
                .then(text => {
                this.#data = parser(text, { skipBlankLine });
                this.#isLoaded = true;
                this.#onLoad(this.#data);
            })
                .catch(error => {
                this.#onLoadError(error);
            });
        }
    }
    /**
     * Synchronize the lyrics based on the given time.
     * @param { number } time - Time in seconds.
     * @param { boolean } [continuous=false] - Whether to call the sync callback continuously.
     */
    sync(time, continuous = false) {
        if (!this.#isLoaded || !this.#data) {
            return console.warn('[Liricle]: lyrics not loaded yet.');
        }
        const { enhanced } = this.#data;
        const { line, word } = syncer(this.#data, time + this.#offset);
        if (!line && !word)
            return;
        if (continuous)
            return this.#onSync(line, word);
        const isSameLine = line !== null && line.index === this.#activeLine;
        const isSameWord = word !== null && word.index === this.#activeWord;
        if (enhanced && word && isSameLine && isSameWord)
            return;
        if (!enhanced && isSameLine)
            return;
        this.#onSync(line, word);
        this.#activeLine = line?.index ?? null;
        this.#activeWord = word?.index ?? null;
    }
    /**
     * Listen liricle event.
     * @param { K } type - The type of event ('load', 'loaderror' or 'sync').
     * @param { EventTypeMap[K] } callback - The callback function to handle the event.
     */
    on(type, callback) {
        switch (type) {
            case 'load':
                this.#onLoad = callback;
                break;
            case 'loaderror':
                this.#onLoadError = callback;
                break;
            case 'sync':
                this.#onSync = callback;
                break;
        }
    }
}

export { Liricle as default };
//# sourceMappingURL=liricle.mjs.map
