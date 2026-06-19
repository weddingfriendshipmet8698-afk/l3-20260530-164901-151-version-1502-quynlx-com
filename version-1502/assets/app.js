(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let activeSlide = 0;
  let heroTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, currentIndex) {
      slide.classList.toggle('active', currentIndex === activeSlide);
    });
    dots.forEach(function (dot, currentIndex) {
      dot.classList.toggle('active', currentIndex === activeSlide);
    });
  }

  function startHeroTimer() {
    if (heroTimer || slides.length < 2) {
      return;
    }

    heroTimer = window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
      if (heroTimer) {
        window.clearInterval(heroTimer);
        heroTimer = null;
      }
      startHeroTimer();
    });
  });

  showSlide(0);
  startHeroTimer();

  const searchInput = document.querySelector('[data-search-input]');
  const clearButton = document.querySelector('[data-search-clear]');
  const cards = Array.from(document.querySelectorAll('[data-search]'));
  const emptyState = document.querySelector('[data-empty-state]');

  function filterCards() {
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    let visibleCount = 0;

    cards.forEach(function (card) {
      const content = card.getAttribute('data-search') || '';
      const matched = !query || content.indexOf(query) !== -1;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('visible', visibleCount === 0);
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterCards);
  }

  if (clearButton && searchInput) {
    clearButton.addEventListener('click', function () {
      searchInput.value = '';
      filterCards();
      searchInput.focus();
    });
  }
})();
