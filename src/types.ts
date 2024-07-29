export interface ParserOptions {
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

export type LoadOptions = LoadTextOptions | LoadUrlOptions;

export interface TagsData {
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

export interface WordData {
      index?: number;
      time : number;
      text : string;
}

export interface LineData {
      index?: number;
      time : number;
      text : string;
      words?: WordData[] | null;
}

export interface LyricsData {
      tags: TagsData;
      lines: LineData[];
      enhanced: boolean;
}

export interface SyncedData {
      line: LineData | null;
      word: WordData | null;
}

export type LoadEventCallback = (data: LyricsData) => any;
export type LoadErrorEventCallback = (error: Error) => any;
export type SyncEventCallback = (line: LineData | null, word: WordData | null) => any;

export type EventTypeMap = {
      load: LoadEventCallback;
      loaderror: LoadErrorEventCallback;
      sync: SyncEventCallback;
}
