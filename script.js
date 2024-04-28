fetch("https://raw.githubusercontent.com/mcanam/liricle/main/package.json").then(async res => {
      const { version } = await res.json();
      const script = document.createElement("script");

      script.src = `https://cdn.jsdelivr.net/npm/liricle@${version}/dist/liricle.js`;
      script.onload = () => main(window.Liricle);

      document.body.append(script);
});

function main(Liricle) {
      window.liricle = new Liricle();

      ////////////////////// PLAYER //////////////////////////////

      let sliding = false;

      noUiSlider.create($player_slider, {
            start: 0,
            connect: "lower",
            range: { min: 0, max: 100 },
      });

      $player_slider.noUiSlider.on("slide", () => {
            const value = parseFloat($player_slider.noUiSlider.get());
            sliding = true;
            $player_audio.currentTime = value;
      });

      $player_slider.noUiSlider.on("change", () => {
            sliding = false;
      });

      $player_play_button.addEventListener("click", () => {
            if (isNaN($player_audio.duration)) return;

            if ($player_play_button.dataset.play == "false") {
                  $player_audio.play();
                  $player_play_button.dataset.play = "true";
            } else {
                  $player_audio.pause();
                  $player_play_button.dataset.play = "false";
            }
      });

      $player_audio.src = "https://raw.githubusercontent.com/mcanam/assets/main/liricle-demo/audio.mp3";

      $player_audio.addEventListener("canplaythrough", () => {
            const duration = $player_audio.duration;

            $player_slider.noUiSlider.updateOptions({
                  range: { min: 0, max: duration },
            });

            $player_time_total.innerText = timeToText(duration);
      });

      $player_audio.addEventListener("timeupdate", () => {
            const time = $player_audio.currentTime;

            if (!sliding) $player_slider.noUiSlider.set(time);
            $player_time_current.innerText = timeToText(time);
      });

      $player_audio.addEventListener("ended", () => {
            $player_play_button.dataset.play = "false";
      });

      function timeToText(time) {
            let min = Math.floor(time / 60);
            let sec = (time % 60).toFixed(2);
            min = min < 10 ? "0" + min : min;
            return min + ":" + sec;
      }

      ////////////////////// MENU //////////////////////////////

      let isShow = false;

      $menu_load_lyric.addEventListener("click", () => {
            loadFile(dataURL => liricle.load({ url: dataURL }));
      });

      $menu_load_audio.addEventListener("click", () => {
            loadFile(dataURL => ($player_audio.src = dataURL));
      });

      $menu_lyric_offset.addEventListener("blur", () => {
            liricle.offset = $menu_lyric_offset.value;
      });

      $menu_button.addEventListener("click", () => {
            const rect = $menu_button.getBoundingClientRect();

            $menu.style.top = rect.y - $menu.offsetHeight - 20 + "px";
            $menu.style.left = rect.x - $menu.offsetWidth + 50 + "px";
            $menu.classList[isShow ? "remove" : "add"]("show");

            isShow = !isShow;
      });

      window.addEventListener("click", e => {
            if (!isShow) return;
            if (e.target.closest(".menu")) return;
            if (e.target == $menu_button) return;

            $menu.classList.remove("show");
            isShow = !isShow;
      });

      function loadFile(callback) {
            const input = document.createElement("input");
            const reader = new FileReader();

            input.type = "file";
            input.multiple = false;

            input.onchange = () => {
                  const file = input.files[0];
                  reader.readAsDataURL(file);
            };

            reader.onload = () => {
                  callback(reader.result);
            };

            input.click();
      }

      ////////////////////// LYRIC //////////////////////////////

      let $lines = [];
      let $activeLine = null;

      liricle.load({
            url: "https://raw.githubusercontent.com/mcanam/assets/main/liricle-demo/lyric-enhanced.lrc"
      });

      liricle.on("load", ({ tags, lines, enhanced }) => {
            $lines = [];
            $activeLine = null;
            $lyric_content.innerHTML = "";

            // set default offset
            if ("offset" in tags) {
                  liricle.offset = tags.offset;
                  $menu_lyric_offset.value = tags.offset;
            }

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
                  $lyric_content.append(...$lines);
            });

            if (enhanced) $lyric_cursor.style.display = "block";
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

                  $lyric_cursor.style.width = $word.offsetWidth + "px";
                  $lyric_cursor.style.top = ($word.offsetTop + $word.offsetHeight) + "px";
                  $lyric_cursor.style.left = $word.offsetLeft + "px";
            }
      });

      $player_audio.addEventListener("timeupdate", () => {
            const time = $player_audio.currentTime;
            liricle.sync(time);
      });
}
