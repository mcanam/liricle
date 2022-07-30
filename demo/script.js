const $audio = document.querySelector(".player__audio");
const $lyric = document.querySelector(".lyric");
const $content = $lyric.querySelector(".lyric__content");
const $cursor = $lyric.querySelector(".lyric__cursor");

let $lines = [];
let $activeLine = null;

window.liricle = null;
window.liricle_offset = 0.2;

function main(Liricle) {
    liricle = new Liricle();
    
    liricle.init({
        url: "https://raw.githubusercontent.com/mcanam/assets/main/liricle-demo/lyric-enhanced.lrc"
    });

    liricle.on("init", ({ tags, lines, enhanced }) => {
        $lines = [];
        $activeLine = null;
        $content.innerHTML = "";

        lines.forEach(line => {
            const $line = document.createElement("div");
            $line.className = "lyric__line";
            $line.innerHTML = line.words ? "" : line.text;

            if (enhanced && line.words) {
                line.words.forEach(word => {
                    const $word = document.createElement("span");
                    $word.className = "lyric__word";
                    $word.innerHTML = word.text + " ";

                    $line.append($word);
                });
            }

            $lines.push($line);
            $content.append(...$lines);
        });

        if (enhanced) $cursor.style.display = "block";
    });

    liricle.on("sync", (line, word) => {
        if ($activeLine) {
            $activeLine.classList.remove("active");
        }

        $activeLine = $lines[line.index];
        $activeLine.classList.add("active");

        const oh1 = $lyric.offsetHeight / 2;
        const oh2 = $activeLine.offsetHeight / 2;

        $lyric.scrollTop = $activeLine.offsetTop - (oh1 - oh2);

        if (word) {
            const $word = $activeLine.children[word.index];

            $cursor.style.width = $word.offsetWidth + "px";
            $cursor.style.top = ($word.offsetTop + $word.offsetHeight) + "px";
            $cursor.style.left = $word.offsetLeft + "px";
        }
    });

    $audio.addEventListener("timeupdate", () => {
        const time = $audio.currentTime;
        liricle.sync(time, liricle_offset);
    });
}

(() => {

    const search = location.search;
    const params = new URLSearchParams(search);

    if (params.get("dev") === "true") {
        import("../src/liricle.js").then(m => main(m.default));
    }

    else {
        const script = document.createElement("script");

        script.src = "dist/liricle.js";
        script.onload = () => main(window.Liricle);

        document.body.append(script);
    }

})();
