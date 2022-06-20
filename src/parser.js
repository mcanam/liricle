const TAGS_REGEX = /\[([a-z]+):(.+)\]/i;
const TIME_REGEX = /\[\d{2}:\d{2}(.\d{2,})?\]{1,}/g;

/**
 * 
 * Parse LRC text
 * 
 * @param {String} text - LRC text
 * @return {Object} 
 * 
 */
function parser(text) {
    let info = {};
    let data = [];
    
    const lines = text.split(/\r|\n/);
    
    lines.forEach(line => {
        parseTags(line);
        parseTime(line);
    });
    
    function parseTags(line) {
        const match = line.match(TAGS_REGEX);
        
        if (match == null) return;
        
        const name  = match[1];
        const value = match[2];
        
        info[name] = value;
    }
    
    function parseTime(line) {
        const match = line.match(TIME_REGEX);
        
        if (match == null) return;
        
        match.forEach(value => {
            data.push({
                time: convertTime(value),
                text: extractText(line)
            });
        });
    }
    
    function convertTime(time) {
        time = time.replace(/\[|\]/g, "");
        time = time.split(":");
        
        let [min, sec] = time;
        
        min = parseInt(min) * 60;
        sec = parseFloat(sec);
        
        return min + sec;
    }
    
    function extractText(text) {
        text = text.replace(TIME_REGEX, "");
        return text.trim();
    }
    
    function sortData(data) {
        return data.sort((a, b) => a.time - b.time);
    }
    
    return { info, data: sortData(data) };
}

export default parser;
