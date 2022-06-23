function sync(data, time) {
    const scores = [];
    
    data.forEach(line => {
        // get gap or time distance
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
