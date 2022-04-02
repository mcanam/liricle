function parser(input) {
    const lines = input.split("\n");
    const output = { info: {}, timeline: [] };
    
    lines.forEach(line => {
        if (!line) return;
    
        const regex = /\[(?<meta>.*)\]((?<text>.*))?/;
        const match = line.match(regex);
    
        if (!match || !match.groups) {
            return console.warn("invalid line: '" + line + "'");
        }
    
        const { meta, text } = match.groups;
        const isTime = /\d+:\d\d\.\d+/.test(meta);
    
        if (isTime) {
            output.timeline.push({ 
                time: meta, 
                text: text || ""
            });
        }
        
        else {
            const props = meta.split(":");
            const name  = props[0];
            const value = props[1];
            
            output.info[name] = value;
        }
    });
    
    return output;
}

export default parser;
