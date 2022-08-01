(() => {
      const $audio = document.querySelector(".player__audio");
      const $button = document.querySelector(".player__button[data-menu]");
      const $menu = document.querySelector(".menu");
      const $menu_inputs = $menu.querySelectorAll(".menu__input");

      let isShow = false;

      $menu_inputs.forEach($input => {
            const action = $input.dataset.action;

            if (action == "lyric") {
                  $input.addEventListener("click", () => {
                        if (!("liricle" in window)) return;
                        loadFile(url => liricle.init({ url }));
                  });
            }

            if (action == "audio") {
                  $input.addEventListener("click", () => {
                        loadFile(url => ($audio.src = url));
                  });
            }

            if (action == "offset") {
                  $input.addEventListener("blur", () => {
                        const value = parseFloat($input.value);
                        window.liricle_offset = value;
                  });
            }
      });

      $button.addEventListener("click", () => {
            const rect = $button.getBoundingClientRect();

            $menu.style.top = rect.y - $menu.offsetHeight - 20 + "px";
            $menu.style.left = rect.x - $menu.offsetWidth + 50 + "px";
            $menu.classList[isShow ? "remove" : "add"]("show");

            isShow = !isShow;
      });

      window.addEventListener("click", e => {
            if (!isShow) return;
            if (e.target.closest(".menu")) return;
            if (e.target == $button) return;

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
})();
