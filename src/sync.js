// TODO: sync both words and lines

function sync(data, time) {
    const lineScores = [];
    
    data.lines.forEach(line => {
        // get gap or time distance
        const lineScore = time - line.time;
        if (lineScore >= 0) lineScores.push(lineScore);
    });
    
    if (lineScores.length == 0) return null;
    
    // get the smallest value from scores
    const closestLine = Math.min(...lineScores);
    const lineIndex = lineScores.indexOf(closestLine);
    const line = data.lines[lineIndex];

    const wordScores = [];
    line.words.forEach(word => {
        // get gap or time distance
        const wordScore = time - word.time;
        if (wordScore >= 0) wordScores.push(wordScore);
    });
    const closestWord = Math.min(...wordScores);
    const wordIndex = wordScores.indexOf(closestWord);
    
    // return the index of closest lyric
    return {lineIndex, wordIndex};
}

export default sync;
