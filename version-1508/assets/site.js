(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var showSlide = function (index) {
      current = index;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
      });
    });
    if (slides.length > 1) {
      setInterval(function () {
        showSlide((current + 1) % slides.length);
      }, 5200);
    }
  }

  var searchInput = document.querySelector('[data-search-input]');
  var yearSelect = document.querySelector('[data-filter-year]');
  var cardList = document.querySelector('[data-card-list]');
  if (cardList && (searchInput || yearSelect)) {
    var cards = Array.prototype.slice.call(cardList.querySelectorAll('[data-title]'));
    var applyFilter = function () {
      var q = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var y = yearSelect ? yearSelect.value : '';
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-category'),
          card.getAttribute('data-year'),
          card.textContent
        ].join(' ').toLowerCase();
        var okText = !q || haystack.indexOf(q) !== -1;
        var okYear = !y || card.getAttribute('data-year') === y;
        card.classList.toggle('is-hidden', !(okText && okYear));
      });
    };
    if (searchInput) {
      searchInput.addEventListener('input', applyFilter);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', applyFilter);
    }
  }

  var player = document.querySelector('[data-video-player]');
  if (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    var source = player.getAttribute('data-src');
    var started = false;
    var startVideo = function () {
      if (!video || !source) {
        return;
      }
      if (!started) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
        started = true;
      }
      if (button) {
        button.classList.add('hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (button) {
            button.classList.remove('hidden');
          }
        });
      }
    };
    if (button) {
      button.addEventListener('click', startVideo);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        startVideo();
      }
    });
  }
})();
