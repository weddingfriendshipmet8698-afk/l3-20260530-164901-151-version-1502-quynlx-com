(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    if (!toggle) {
      return;
    }

    toggle.addEventListener('click', function () {
      document.body.classList.toggle('mobile-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function activate(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        activate(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        activate(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        activate(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        activate(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    activate(0);
    start();
  }

  function setupLocalFilters() {
    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
      var input = scope.querySelector('[data-local-search]');
      var buttons = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-value]'));
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-search-card]'));
      var count = scope.querySelector('[data-result-count]');
      var activeFilter = 'all';

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var visible = 0;

        cards.forEach(function (card) {
          var text = [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-type')
          ].join(' ').toLowerCase();
          var matchQuery = !query || text.indexOf(query) !== -1;
          var matchFilter = activeFilter === 'all' || text.indexOf(activeFilter.toLowerCase()) !== -1;
          var show = matchQuery && matchFilter;
          card.classList.toggle('is-hidden', !show);
          if (show) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = String(visible);
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }

      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          activeFilter = button.getAttribute('data-filter-value') || 'all';
          buttons.forEach(function (item) {
            item.classList.toggle('is-active', item === button);
          });
          apply();
        });
      });

      apply();
    });
  }

  function setupSearchPage() {
    var page = document.querySelector('[data-search-page]');
    if (!page) {
      return;
    }

    var input = document.querySelector('[data-search-input]');
    var results = page.querySelector('[data-search-results]');
    var title = document.querySelector('[data-search-title]');
    var count = document.querySelector('[data-search-count]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (input) {
      input.value = initialQuery;
    }

    function cardTemplate(movie) {
      return [
        '<a class="movie-card" href="movie/' + movie.id + '.html">',
        '  <figure class="movie-card__poster">',
        '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    <span class="movie-card__year">' + escapeHtml(movie.year) + '</span>',
        '  </figure>',
        '  <div class="movie-card__body">',
        '    <div class="movie-card__tags"><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
        '    <h3>' + escapeHtml(movie.title) + '</h3>',
        '    <p>' + escapeHtml(movie.oneLine) + '</p>',
        '    <div class="movie-card__meta"><span>' + escapeHtml(movie.genre) + '</span><span>' + escapeHtml(movie.channelLabel) + '</span></div>',
        '  </div>',
        '</a>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"']/g, function (character) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[character];
      });
    }

    function render(movies, query) {
      var normalized = query.trim().toLowerCase();
      var matched = movies.filter(function (movie) {
        if (!normalized) {
          return true;
        }
        return [movie.title, movie.region, movie.year, movie.genre, movie.type, movie.tags, movie.oneLine, movie.channelLabel]
          .join(' ')
          .toLowerCase()
          .indexOf(normalized) !== -1;
      }).slice(0, 120);

      if (results) {
        results.innerHTML = matched.map(cardTemplate).join('');
      }
      if (title) {
        title.textContent = normalized ? '搜索结果：' + query : '推荐内容';
      }
      if (count) {
        count.textContent = String(matched.length);
      }
    }

    fetch('assets/movies.json')
      .then(function (response) {
        return response.json();
      })
      .then(function (movies) {
        render(movies, initialQuery);
        if (input) {
          input.addEventListener('input', function () {
            render(movies, input.value);
          });
        }
      })
      .catch(function () {
        if (title) {
          title.textContent = '搜索数据加载失败';
        }
      });
  }

  function setupPlayers() {
    document.querySelectorAll('[data-video-shell]').forEach(function (shell) {
      var video = shell.querySelector('video');
      var overlay = shell.querySelector('[data-play-overlay]');
      var status = shell.querySelector('[data-player-status]');
      var source = shell.getAttribute('data-video-src');
      var started = false;

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function playNative() {
        video.src = source;
        video.play().catch(function () {
          setStatus('浏览器阻止了自动播放，请再次点击播放按钮。');
        });
      }

      function playWithHls() {
        if (!window.Hls || !window.Hls.isSupported()) {
          setStatus('当前浏览器不支持 HLS 播放，请使用 Safari、Chrome 或 Edge。');
          return;
        }

        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('播放源加载完成，正在播放。');
          video.play().catch(function () {
            setStatus('播放源已加载，请再次点击播放器播放。');
          });
        });
        hls.on(window.Hls.Events.ERROR, function () {
          setStatus('播放源加载异常，请检查网络或稍后重试。');
        });
      }

      function startPlayer() {
        if (started || !video || !source) {
          return;
        }
        started = true;
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        setStatus('正在加载 m3u8 播放源...');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          playNative();
        } else {
          playWithHls();
        }
      }

      if (overlay) {
        overlay.addEventListener('click', startPlayer);
      }

      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
    });
  }

  function setupScrollPlayer() {
    document.querySelectorAll('[data-scroll-player]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        var player = document.querySelector('[data-video-shell]');
        if (!player) {
          return;
        }
        event.preventDefault();
        player.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupLocalFilters();
    setupSearchPage();
    setupPlayers();
    setupScrollPlayer();
  });
})();
