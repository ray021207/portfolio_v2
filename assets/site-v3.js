(() => {
  'use strict';
  const header = document.querySelector('.site-nav');
  const menu = document.querySelector('.nav-links');
  const toggle = document.querySelector('.menu-toggle');
  function updateHeader() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 24);
  }
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (menu && toggle) {
    toggle.addEventListener('click', () => {
      const opened = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(opened));
      toggle.textContent = opened ? 'Close ×' : 'Menu ☰';
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = 'Menu ☰';
    }));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.classList.contains('is-open')) {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = 'Menu ☰';
        toggle.focus();
      }
    });
  }

  // Reveal only once, as content enters the viewport. No wheel or scroll-speed manipulation.
  const animated = document.querySelectorAll('.reveal');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    animated.forEach(el => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .08, rootMargin: '0px 0px -30px 0px' });
    animated.forEach(el => observer.observe(el));
  }

  const filters = Array.from(document.querySelectorAll('[data-filter-button]'));
  const entries = Array.from(document.querySelectorAll('[data-work-category]'));
  function filterProjects(category) {
    filters.forEach(btn => btn.setAttribute('aria-pressed', String(btn.dataset.filterButton === category)));
    entries.forEach(el => {
      const categories = (el.dataset.workCategory || '').split(' ');
      el.hidden = category !== 'all' && !categories.includes(category);
    });
  }
  filters.forEach(btn => btn.addEventListener('click', () => filterProjects(btn.dataset.filterButton)));
  if (filters.length) filterProjects('all');

  // Interactive hero icons are ordinary links so mouse, keyboard and touch all navigate.
  // We will update their exact destinations after the user provides the project mapping.
})();