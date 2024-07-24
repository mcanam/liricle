// will match: "[tag:value]"
export const TAG_REGEX = /\[(ar|ti|al|au|by|length|offset|re|ve):(.*)\]/i;

// will match: "[00:00.00]"
export const LINE_TIME_REGEX = /\[\d{2}:\d{2}(.\d{2,})?\]/g;

// will match: "<00:00.00>"
export const WORD_TIME_REGEX = /<\d{2}:\d{2}(.\d{2,})?>/g;

// will match: "<00:00.00> blablabla"
export const ENHANCED_REGEX = /<\d{2}:\d{2}(.\d{2,})?>\s*[^\s|<]*/g;
