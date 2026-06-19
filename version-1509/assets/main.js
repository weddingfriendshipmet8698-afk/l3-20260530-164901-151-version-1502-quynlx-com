(function () {
  var navButton = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-main-nav]');

  if (navButton && nav) {
    navButton.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var index = 0;
  var timer = null;

  function showHero(nextIndex) {
    if (!slides.length) {
      return;
    }
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === index);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === index);
    });
  }

  function startHero() {
    if (timer || slides.length < 2) {
      return;
    }
    timer = window.setInterval(function () {
      showHero(index + 1);
    }, 5200);
  }

  function resetHero() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
    startHero();
  }

  if (slides.length) {
    showHero(0);
    startHero();
  }

  if (prev) {
    prev.addEventListener('click', function () {
      showHero(index - 1);
      resetHero();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showHero(index + 1);
      resetHero();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var target = Number(dot.getAttribute('data-hero-dot')) || 0;
      showHero(target);
      resetHero();
    });
  });

  var searchInput = document.querySelector('[data-search-input]');
  var regionFilter = document.querySelector('[data-filter-region]');
  var yearFilter = document.querySelector('[data-filter-year]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilters() {
    var query = normalize(searchInput && searchInput.value);
    var region = regionFilter ? regionFilter.value : 'all';
    var year = yearFilter ? yearFilter.value : 'all';

    cards.forEach(function (card) {
      var title = normalize(card.getAttribute('data-title'));
      var cardRegion = card.getAttribute('data-region') || '';
      var cardYear = card.getAttribute('data-year') || '';
      var genre = normalize(card.getAttribute('data-genre'));
      var tags = normalize(card.getAttribute('data-tags'));
      var text = title + ' ' + normalize(cardRegion) + ' ' + normalize(cardYear) + ' ' + genre + ' ' + tags;
      var matchQuery = !query || text.indexOf(query) !== -1;
      var matchRegion = region === 'all' || cardRegion === region;
      var matchYear = year === 'all' || cardYear === year;
      card.classList.toggle('is-hidden', !(matchQuery && matchRegion && matchYear));
    });
  }

  [searchInput, regionFilter, yearFilter].forEach(function (node) {
    if (node) {
      node.addEventListener('input', applyFilters);
      node.addEventListener('change', applyFilters);
    }
  });
})();
