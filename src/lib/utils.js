export function timeToText(time) {
    let min = Math.floor(time / 60);
    let sec = (time % 60).toFixed(2);

    min = min < 10 ? "0" + min : min;
    sec = sec < 10 ? "0" + sec : sec;

    return min + ":" + sec;
}

export function textToTime(text) {
    const times = text.split(":");
    const min = parseInt(times[0]) * 60;
    const sec = parseFloat(times[1]);

    return parseFloat((min + sec).toFixed(2));
}
