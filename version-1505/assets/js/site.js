(function () {
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const mobilePanel = document.querySelector('.mobile-panel');

  function updateHeader() {
    if (!header) {
      return;
    }
    header.classList.toggle('is-scrolled', window.scrollY > 20);
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dots button'));
  let slideIndex = 0;
  let slideTimer = null;

  function showSlide(nextIndex) {
    if (!slides.length) {
      return;
    }
    slideIndex = (nextIndex + slides.length) % slides.length;
    slides.forEach(function (slide, index) {
      slide.classList.toggle('is-active', index === slideIndex);
    });
    dots.forEach(function (dot, index) {
      dot.classList.toggle('is-active', index === slideIndex);
    });
  }

  function startSlider() {
    if (slides.length <= 1) {
      return;
    }
    slideTimer = window.setInterval(function () {
      showSlide(slideIndex + 1);
    }, 5800);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      if (slideTimer) {
        window.clearInterval(slideTimer);
      }
      showSlide(index);
      startSlider();
    });
  });

  showSlide(0);
  startSlider();

  const filterInput = document.querySelector('[data-filter-input]');
  const emptyState = document.querySelector('[data-empty-state]');

  if (filterInput) {
    filterInput.addEventListener('input', function () {
      const keyword = filterInput.value.trim().toLowerCase();
      const cards = Array.from(document.querySelectorAll('[data-title]'));
      let visibleCount = 0;

      cards.forEach(function (card) {
        const text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre')
        ].join(' ').toLowerCase();
        const matched = !keyword || text.indexOf(keyword) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.style.display = visibleCount ? 'none' : 'block';
      }
    });
  }

  function getQueryValue(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  function buildSearchCard(movie) {
    const tags = movie.tags.slice(0, 4).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '" data-year="' + escapeHtml(movie.year) + '" data-region="' + escapeHtml(movie.region) + '" data-genre="' + escapeHtml(movie.genre) + '">' +
      '<a class="poster" href="movies/' + movie.file + '">' +
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<span class="poster-badge">' + escapeHtml(movie.category) + '</span>' +
      '</a>' +
      '<div class="card-body">' +
      '<div class="card-meta"><a href="categories/' + movie.categorySlug + '.html">' + escapeHtml(movie.category) + '</a><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>' +
      '<h3><a href="movies/' + movie.file + '">' + escapeHtml(movie.title) + '</a></h3>' +
      '<p>' + escapeHtml(movie.oneLine) + '</p>' +
      '<div class="tag-row">' + tags + '</div>' +
      '</div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  const searchBox = document.querySelector('[data-site-search]');
  const searchResults = document.querySelector('[data-search-results]');
  const searchEmpty = document.querySelector('[data-search-empty]');

  function runSearch(keyword) {
    if (!searchResults || !Array.isArray(window.SITE_MOVIES)) {
      return;
    }

    const normalized = keyword.trim().toLowerCase();
    const source = window.SITE_MOVIES;
    const matched = normalized
      ? source.filter(function (movie) {
        return [movie.title, movie.region, movie.year, movie.genre, movie.oneLine, movie.tags.join(' ')].join(' ').toLowerCase().indexOf(normalized) !== -1;
      })
      : source.slice(0, 80);

    searchResults.innerHTML = matched.slice(0, 120).map(buildSearchCard).join('');
    if (searchEmpty) {
      searchEmpty.style.display = matched.length ? 'none' : 'block';
    }
  }

  if (searchBox && searchResults) {
    const q = getQueryValue('q');
    searchBox.value = q;
    runSearch(q);
    const form = searchBox.closest('form');
    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        const keyword = searchBox.value.trim();
        const url = keyword ? 'search.html?q=' + encodeURIComponent(keyword) : 'search.html';
        history.replaceState(null, '', url);
        runSearch(keyword);
      });
    }
  }

  window.initMoviePlayer = function (streamUrl) {
    const video = document.querySelector('[data-movie-video]');
    const overlay = document.querySelector('[data-video-overlay]');
    let loaded = false;
    let hls = null;

    if (!video || !streamUrl) {
      return;
    }

    function loadStream() {
      if (loaded) {
        return;
      }
      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function begin() {
      loadStream();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      const action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', begin);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        begin();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
