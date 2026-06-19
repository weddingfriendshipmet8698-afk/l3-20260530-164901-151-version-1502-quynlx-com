(function () {
  var toggle = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
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

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });

    setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var listing = document.querySelector("[data-listing]");
  if (listing) {
    var input = listing.querySelector("[data-search]");
    var typeFilter = listing.querySelector("[data-type-filter]");
    var yearFilter = listing.querySelector("[data-year-filter]");
    var categoryFilter = listing.querySelector("[data-category-filter]");
    var cards = Array.prototype.slice.call(listing.querySelectorAll("[data-card]"));
    var empty = listing.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function applyFilters() {
      var query = normalize(input && input.value);
      var type = normalize(typeFilter && typeFilter.value);
      var year = normalize(yearFilter && yearFilter.value);
      var category = normalize(categoryFilter && categoryFilter.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-tags")
        ].join(" "));
        var cardType = normalize(card.getAttribute("data-type"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var link = card.querySelector(".category-pill");
        var cardCategory = normalize(link ? link.getAttribute("href") : "");
        var matched = true;

        if (query && haystack.indexOf(query) === -1) {
          matched = false;
        }
        if (type && cardType !== type) {
          matched = false;
        }
        if (year && cardYear !== year) {
          matched = false;
        }
        if (category && cardCategory.indexOf("category-" + category + ".html") === -1) {
          matched = false;
        }

        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [input, typeFilter, yearFilter, categoryFilter].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });

    applyFilters();
  }
})();
