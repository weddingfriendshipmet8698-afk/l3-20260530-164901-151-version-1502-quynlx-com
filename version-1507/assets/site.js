(function () {
    const header = document.querySelector("[data-header]");
    const toggle = document.querySelector("[data-menu-toggle]");
    const panel = document.querySelector("[data-mobile-panel]");

    function updateHeader() {
        if (!header) {
            return;
        }
        header.classList.toggle("is-scrolled", window.scrollY > 18);
    }

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    if (toggle && panel && header) {
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
            header.classList.toggle("is-open", panel.classList.contains("is-open"));
        });
    }

    const hero = document.querySelector("[data-hero]");
    if (hero) {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        const prev = hero.querySelector("[data-hero-prev]");
        const next = hero.querySelector("[data-hero-next]");
        let index = 0;
        let timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                showSlide(dotIndex);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(index + 1);
                restart();
            });
        }

        showSlide(0);
        restart();
    }

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
        const keyword = scope.querySelector("[data-filter-keyword]");
        const region = scope.querySelector("[data-filter-region]");
        const type = scope.querySelector("[data-filter-type]");
        const year = scope.querySelector("[data-filter-year]");
        const empty = scope.querySelector("[data-empty-result]");
        const cards = Array.from(document.querySelectorAll(".movie-card[data-title]"));
        const params = new URLSearchParams(window.location.search);
        const q = params.get("q") || "";

        if (keyword && q) {
            keyword.value = q;
        }

        function contains(value, target) {
            return String(value || "").toLowerCase().includes(String(target || "").toLowerCase());
        }

        function apply() {
            const key = keyword ? keyword.value.trim() : "";
            const selectedRegion = region ? region.value : "";
            const selectedType = type ? type.value : "";
            const selectedYear = year ? year.value : "";
            let visible = 0;

            cards.forEach(function (card) {
                const haystack = [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.genre
                ].join(" ");
                const matched = (!key || contains(haystack, key)) &&
                    (!selectedRegion || card.dataset.region === selectedRegion) &&
                    (!selectedType || card.dataset.type === selectedType) &&
                    (!selectedYear || card.dataset.year === selectedYear);

                card.classList.toggle("is-hidden", !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        [keyword, region, type, year].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });

        apply();
    });
})();

function initMoviePlayer(sourceUrl) {
    const video = document.getElementById("movie-player");
    const overlay = document.querySelector("[data-player-overlay]");
    const button = document.querySelector("[data-player-button]");
    const status = document.querySelector("[data-player-status]");
    let attached = false;
    let hls = null;

    if (!video || !sourceUrl) {
        return;
    }

    function setStatus(text) {
        if (status) {
            status.textContent = text || "";
        }
    }

    function requestPlay() {
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
                if (overlay) {
                    overlay.classList.remove("is-hidden");
                }
                setStatus("点击播放按钮开始观看");
            });
        }
    }

    function attachSource() {
        if (attached) {
            return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                if (video.dataset.playRequested === "true") {
                    requestPlay();
                }
            });
        } else {
            setStatus("播放暂时不可用，请稍后再试");
        }
    }

    function startPlayback() {
        video.dataset.playRequested = "true";
        attachSource();
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        requestPlay();
    }

    if (button) {
        button.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            startPlayback();
        });
    }

    if (overlay) {
        overlay.addEventListener("click", startPlayback);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            startPlayback();
        } else {
            video.pause();
        }
    });

    video.addEventListener("play", function () {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        setStatus("");
    });

    video.addEventListener("error", function () {
        setStatus("播放暂时不可用，请稍后再试");
        if (overlay) {
            overlay.classList.remove("is-hidden");
        }
    });

    window.addEventListener("beforeunload", function () {
        if (hls) {
            hls.destroy();
        }
    });
}
