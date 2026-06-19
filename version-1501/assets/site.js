(function () {
    var navToggle = document.querySelector('.nav-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (navToggle && mobileNav) {
        navToggle.addEventListener('click', function () {
            var opened = mobileNav.classList.toggle('is-open');
            navToggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var index = 0;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot') || 0));
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
    });

    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
        var section = panel.nextElementSibling;
        var list = section ? section.querySelector('[data-movie-list]') : document.querySelector('[data-movie-list]');
        var cards = list ? Array.prototype.slice.call(list.querySelectorAll('.movie-card')) : [];
        var keywordInput = panel.querySelector('.filter-keyword');
        var yearSelect = panel.querySelector('.filter-year');
        var regionSelect = panel.querySelector('.filter-region');
        var typeSelect = panel.querySelector('.filter-type');
        var categorySelect = panel.querySelector('.filter-category');
        var emptyState = section ? section.querySelector('.empty-state') : null;

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function apply() {
            var keyword = normalize(keywordInput && keywordInput.value);
            var year = normalize(yearSelect && yearSelect.value);
            var region = normalize(regionSelect && regionSelect.value);
            var type = normalize(typeSelect && typeSelect.value);
            var category = normalize(categorySelect && categorySelect.value);
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-search'));
                var matched = true;

                if (keyword && text.indexOf(keyword) === -1) {
                    matched = false;
                }

                if (year && normalize(card.getAttribute('data-year')) !== year) {
                    matched = false;
                }

                if (region && normalize(card.getAttribute('data-region')) !== region) {
                    matched = false;
                }

                if (type && normalize(card.getAttribute('data-type')) !== type) {
                    matched = false;
                }

                if (category && normalize(card.getAttribute('data-category')) !== category) {
                    matched = false;
                }

                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.hidden = visible !== 0;
            }
        }

        [keywordInput, yearSelect, regionSelect, typeSelect, categorySelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
    });
})();
