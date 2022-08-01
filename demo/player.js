(() => {
      const $audio = document.querySelector(".player__audio");
      const $play = document.querySelector(".player__button[data-play]");
      const $slider = document.querySelector(".player__slider");
      const $time_current = document.querySelector(".player__time--current");
      const $time_total = document.querySelector(".player__time--total");

      let sliding = false;

      noUiSlider.create($slider, {
            start: 0,
            connect: "lower",
            range: { min: 0, max: 100 },
      });

      $slider.noUiSlider.on("slide", () => {
            const value = parseFloat($slider.noUiSlider.get());
            sliding = true;

            $audio.currentTime = value;
      });

      $slider.noUiSlider.on("change", () => {
            sliding = false;
      });

      $play.addEventListener("click", () => {
            if (isNaN($audio.duration)) return;

            if ($play.dataset.play == "false") {
                  $audio.play();
                  $play.dataset.play = "true";
            } else {
                  $audio.pause();
                  $play.dataset.play = "false";
            }
      });

      $audio.src = "https://raw.githubusercontent.com/mcanam/assets/main/liricle-demo/audio.mp3";

      $audio.addEventListener("canplaythrough", () => {
            const duration = $audio.duration;

            $slider.noUiSlider.updateOptions({
                  range: { min: 0, max: duration },
            });

            $time_total.innerText = timeToText(duration);
      });

      $audio.addEventListener("timeupdate", () => {
            const time = $audio.currentTime;

            if (!sliding) $slider.noUiSlider.set(time);
            $time_current.innerText = timeToText(time);
      });

      $audio.addEventListener("ended", () => {
            $play.dataset.play = "false";
      });

      function timeToText(time) {
            let min = Math.floor(time / 60);
            let sec = (time % 60).toFixed(2);

            min = min < 10 ? "0" + min : min;
            // sec = sec < 10 ? "0" + sec : sec;

            return min + ":" + sec;
      }
})();
