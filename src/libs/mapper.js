import { timeToText, textToTime } from "./utils.js";

function mapper(input) {
    const timeline = input.timeline;
    const output = {};
    
    timeline.forEach((line, index) => {
        let start = line.time;
        let end = timeline[index + 1];
    
        if (!end) return;
    
        start = textToTime(start);
        end = textToTime(end.time);
    
        const diff = end - start;
    
        let i = 0;
    
        for (; i < diff;) {
            const time = timeToText(start + i);
            const text = line.text;
            
            output[time] = [index, text];
    
            i += 0.01;
        }
    });
    
    return output;
}

export default mapper;
