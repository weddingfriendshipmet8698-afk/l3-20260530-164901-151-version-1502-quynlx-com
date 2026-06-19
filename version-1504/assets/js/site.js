(function () {
    var mobileButton = document.querySelector(".mobile-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (mobileButton && mobileNav) {
        mobileButton.addEventListener("click", function () {
            var isHidden = mobileNav.hasAttribute("hidden");
            if (isHidden) {
                mobileNav.removeAttribute("hidden");
                mobileButton.setAttribute("aria-expanded", "true");
            } else {
                mobileNav.setAttribute("hidden", "");
                mobileButton.setAttribute("aria-expanded", "false");
            }
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === current);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        showSlide(0);
        setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var movieSearch = document.querySelector("[data-movie-search]");
    var yearFilter = document.querySelector("[data-year-filter]");
    var typeFilter = document.querySelector("[data-type-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var noResult = document.querySelector(".no-result");

    function getQueryValue() {
        var params = new URLSearchParams(window.location.search);
        return params.get("q") || "";
    }

    if (movieSearch && !movieSearch.value) {
        movieSearch.value = getQueryValue();
    }

    function filterCards() {
        var keyword = movieSearch ? movieSearch.value.trim().toLowerCase() : "";
        var year = yearFilter ? yearFilter.value : "";
        var type = typeFilter ? typeFilter.value : "";
        var visibleCount = 0;

        cards.forEach(function (card) {
            var haystack = [
                card.getAttribute("data-title") || "",
                card.getAttribute("data-year") || "",
                card.getAttribute("data-region") || "",
                card.getAttribute("data-genre") || ""
            ].join(" ").toLowerCase();
            var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            var matchYear = !year || (card.getAttribute("data-year") || "") === year;
            var matchType = !type || haystack.indexOf(type.toLowerCase()) !== -1;
            var isVisible = matchKeyword && matchYear && matchType;
            card.style.display = isVisible ? "" : "none";
            if (isVisible) {
                visibleCount += 1;
            }
        });

        if (noResult) {
            noResult.hidden = visibleCount !== 0;
        }
    }

    [movieSearch, yearFilter, typeFilter].forEach(function (input) {
        if (input) {
            input.addEventListener("input", filterCards);
            input.addEventListener("change", filterCards);
        }
    });

    if (cards.length) {
        filterCards();
    }
})();
