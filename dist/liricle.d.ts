interface ParserOptions {
    skipBlankLine?: boolean;
}
interface LoadTextOptions extends ParserOptions {
    text: string;
    url?: never;
}
interface LoadUrlOptions extends ParserOptions {
    url: string;
    text?: never;
}
type LoadOptions = LoadTextOptions | LoadUrlOptions;
interface TagsData {
    ar?: string;
    ti?: string;
    al?: string;
    au?: string;
    by?: string;
    length?: string;
    offset?: string;
    re?: string;
    ve?: string;
}
interface WordData {
    index?: number;
    time: number;
    text: string;
}
interface LineData {
    index?: number;
    time: number;
    text: string;
    words?: WordData[] | null;
}
interface LyricsData {
    tags: TagsData;
    lines: LineData[];
    enhanced: boolean;
}
type LoadEventCallback = (data: LyricsData) => any;
type LoadErrorEventCallback = (error: Error) => any;
type SyncEventCallback = (line: LineData | null, word: WordData | null) => any;
type EventTypeMap = {
    load: LoadEventCallback;
    loaderror: LoadErrorEventCallback;
    sync: SyncEventCallback;
};

declare class Liricle {
    #private;
    /**
     * Gets the currently loaded lyrics data.
     * @returns { LyricsData | null } Lyrics data or null.
     */
    get data(): LyricsData | null;
    /**
     * Gets current offset in seconds.
     * @returns { number } Lyric offset in seconds.
     */
    get offset(): number;
    /**
     * Sets the lyric offset in milliseconds.
     * @param { number } value - Lyric offset in milliseconds
     */
    set offset(value: number);
    /**
     * Load lyrics from either text or url.
     * @param { LoadOptions } options - Load options.
     */
    load(options: LoadOptions): void;
    /**
     * Synchronize the lyrics based on the given time.
     * @param { number } time - Time in seconds.
     * @param { boolean } [continuous=false] - Whether to call the sync callback continuously.
     */
    sync(time: number, continuous?: boolean): any;
    /**
     * Listen liricle event.
     * @param { K } type - The type of event ('load', 'loaderror' or 'sync').
     * @param { EventTypeMap[K] } callback - The callback function to handle the event.
     */
    on<K extends keyof EventTypeMap>(type: K, callback: EventTypeMap[K]): void;
}

export { Liricle as default };
