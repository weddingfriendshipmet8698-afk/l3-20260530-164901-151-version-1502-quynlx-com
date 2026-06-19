(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });

  function setupMenu() {
    var button = document.querySelector('[data-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        restart();
      });
    });
    show(0);
    restart();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
      var targetSelector = panel.getAttribute('data-target') || '#movieGrid';
      var target = document.querySelector(targetSelector);
      if (!target) {
        return;
      }
      var cards = Array.prototype.slice.call(target.querySelectorAll('[data-movie-card]'));
      var search = panel.querySelector('[data-filter-search]');
      var genre = panel.querySelector('[data-filter-genre]');
      var year = panel.querySelector('[data-filter-year]');
      var empty = document.querySelector('[data-no-results]');

      function apply() {
        var q = search ? search.value.trim().toLowerCase() : '';
        var g = genre ? genre.value : '';
        var y = year ? year.value : '';
        var shown = 0;
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-region'),
            card.getAttribute('data-category'),
            card.getAttribute('data-tags')
          ].join(' ').toLowerCase();
          var okSearch = !q || haystack.indexOf(q) !== -1;
          var okGenre = !g || (card.getAttribute('data-genre') || '').indexOf(g) !== -1 || (card.getAttribute('data-tags') || '').indexOf(g) !== -1;
          var okYear = !y || card.getAttribute('data-year') === y;
          var visible = okSearch && okGenre && okYear;
          card.style.display = visible ? '' : 'none';
          if (visible) {
            shown += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', shown === 0);
        }
      }

      [search, genre, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function setupPlayers() {
    var blocks = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    blocks.forEach(function (block) {
      var video = block.querySelector('video');
      var button = block.querySelector('.play-layer');
      if (!video || !button) {
        return;
      }
      var src = video.getAttribute('data-video');
      var loaded = false;
      var hls = null;

      function start() {
        if (!src) {
          return;
        }
        button.classList.add('hidden');
        if (!loaded) {
          loaded = true;
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
            video.addEventListener('loadedmetadata', function () {
              video.play().catch(function () {});
            }, { once: true });
          } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true });
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {});
            });
          } else {
            video.src = src;
          }
        }
        video.play().catch(function () {});
      }

      button.addEventListener('click', start);
      video.addEventListener('click', function () {
        if (!loaded || video.paused) {
          start();
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }
})();
