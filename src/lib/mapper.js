import { timeToText, textToTime } from "./utils.js";

function mapper(container, map, data) {
    const nodes = container.children;
    
    data.forEach((item, index) => {
        let start = item.time;
        let end = data[index + 1];
    
        if (!end) return;
    
        start = textToTime(start);
        end = textToTime(end.time);
    
        const diff = end - start;
        const node = nodes[index];
    
        let i = 0;
    
        for (; i < diff;) {
            const time = timeToText(start + i);
            map[time] = node;
    
            i += 0.01;
        }
    });
}

export default mapper;
