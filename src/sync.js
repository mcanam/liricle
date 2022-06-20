/**
 * 
 * Find lyric line index closest to given time
 * 
 * @param {Array} data - output data from parser.
 * @param {Number} time - current time from audio player.
 * @return {Number} index of lyric line
 * 
 */
function sync(data, time) {
    const scores = [];
    
    data.forEach(line => {
        // get gap or distance
        const score = time - line.time;
        
        if (score >= 0) scores.push(score);
    });
    
    if (scores.length == 0) return null;
    
    // get the smallest value from scores
    const closest = Math.min(...scores);
    
    // return the index of closest lyric
    return scores.indexOf(closest);
}

export default sync;
