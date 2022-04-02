function parser(input) {
    const lines = input.split("\n");
    const output = [];
    
    lines.forEach(line => {
        if (!line) return;
    
        const regex = /\[(?<time>.*)\]((?<text>.*))?/;
        const match = line.match(regex);
    
        if (!match || !match.groups) {
            return console.warn("invalid line: '" + line + "'");
        }
    
        const { time, text } = match.groups;
        const isTime = /\d+:\d\d\.\d+/.test(time);
    
        if (!isTime) return;
    
        output.push({ time, text });
    });
    
    return output;
}

export default parser;