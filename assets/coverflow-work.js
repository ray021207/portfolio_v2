(() => {
  'use strict';

  const shell = document.querySelector('[data-coverflow]');
  if (!shell) return;

  const stage = shell.querySelector('[data-coverflow-stage]');
  const cards = [...stage.querySelectorAll('[data-coverflow-card]')];
  const dots = [...document.querySelectorAll('[data-coverflow-dot]')];
  const prev = document.querySelector('[data-coverflow-prev]');
  const next = document.querySelector('[data-coverflow-next]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (cards.length !== 4) return;

  // Keep a fully navigable four-card grid when JavaScript or motion is disabled.
  if (reduceMotion.matches) {
    cards.forEach(card => card.dataset.position = 'active');
    prev?.setAttribute('hidden', '');
    next?.setAttribute('hidden', '');
    return;
  }

  let active = 1; // Computer Vision starts in the center; all four remain visible.
  let swiping = null;
  let suppressClick = false;
  let resizeFrame = 0;

  function shortestOffset(index) {
    const raw = (index - active + cards.length) % cards.length;
    return raw === cards.length - 1 ? -1 : raw;
  }

  function updatePositions(announce = true) {
    const w = stage.clientWidth || window.innerWidth;
    const h = stage.clientHeight || window.innerHeight;
    const narrow = w < 600;
    const medium = w < 890;
    // Avoid any offscreen negative-margin gallery that would induce horizontal scroll.
    const cardWidth = narrow
      ? Math.min(290, Math.max(226, w * .73))
      : medium
        ? Math.min(316, Math.max(270, w * .37))
        : Math.min(356, Math.max(292, w * .27));
    const cardHeight = Math.max(narrow ? 300 : 318,
      Math.min(narrow ? 430 : 466, h - 27));
    // The farthest fourth card must stay inside the available laptop width.
    // Reserve its projected half-width, then divide the remaining space by two.
    const baseStep = narrow ? cardWidth * .86 : medium ? cardWidth * .87 : cardWidth * .9;
    const maxInFrame = Math.max(cardWidth * .49, (w / 2 - cardWidth * .33 - 12) / 2);
    const step = narrow ? baseStep : Math.min(baseStep, maxInFrame);
    stage.style.setProperty('--card-width', cardWidth.toFixed(1) + 'px');
    stage.style.setProperty('--card-height', cardHeight.toFixed(1) + 'px');

    cards.forEach((card, index) => {
      const offset = shortestOffset(index);
      const abs = Math.abs(offset);
      const far = abs > 1;
      const side = abs === 1;
      const angle = offset === 0 ? 0 : (offset < 0 ? 48 : -48);
      card.style.setProperty('--tx', (offset * step).toFixed(1) + 'px');
      card.style.setProperty('--ty', (abs * (narrow ? 13 : 9)).toFixed(1) + 'px');
      card.style.setProperty('--tz', (offset === 0 ? 76 : far ? -220 : -110) + 'px');
      card.style.setProperty('--ry', angle + 'deg');
      card.style.setProperty('--card-scale', offset === 0 ? '1' : far ? '.77' : '.86');
      card.style.setProperty('--card-opacity', offset === 0 ? '1' : far ? '.72' : '.92');
      card.style.setProperty('--stack', offset === 0 ? '10' : far ? '4' : '7');
      card.dataset.position = offset === 0 ? 'active' : side ? 'side' : 'far';
      const name = card.querySelector('.coverflow-card-title')?.textContent?.trim() || 'Projects';
      card.setAttribute('aria-label', offset === 0
        ? 'Open ' + name + ' projects'
        : 'Select ' + name + ' in the gallery');
      if (offset === 0) card.setAttribute('aria-current', 'true');
      else card.removeAttribute('aria-current');
    });

    dots.forEach((dot, index) => {
      dot.setAttribute('aria-current', String(index === active));
      dot.setAttribute('aria-pressed', String(index === active));
    });
    shell.setAttribute('aria-label', 'Project categories, ' + (active + 1) + ' of ' + cards.length +
      ': ' + (cards[active].querySelector('.coverflow-card-title')?.textContent?.trim() || ''));
  }

  function select(index) {
    active = (index + cards.length) % cards.length;
    updatePositions();
  }

  // Inactive cards rotate into focus on click; the centered card is a real link.
  cards.forEach((card, index) => {
    card.addEventListener('click', event => {
      if (suppressClick) {
        event.preventDefault();
        return;
      }
      if (index !== active) {
        event.preventDefault();
        select(index);
      }
    });
    card.addEventListener('keydown', event => {
      if (event.key === ' ' && index !== active) {
        event.preventDefault();
        select(index);
      }
    });
  });

  prev?.addEventListener('click', () => select(active - 1));
  next?.addEventListener('click', () => select(active + 1));
  dots.forEach((dot, index) => dot.addEventListener('click', () => select(index)));

  shell.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      select(active - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      select(active + 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      select(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      select(cards.length - 1);
    }
  });

  // Drag / swipe uses pointer events only; vertical touch scrolling stays native.
  stage.addEventListener('pointerdown', event => {
    if (event.button !== 0 || event.target.closest('button')) return;
    swiping = { x:event.clientX, y:event.clientY, id:event.pointerId };
  });
  stage.addEventListener('pointerup', event => {
    if (!swiping || swiping.id !== event.pointerId) return;
    const dx = event.clientX - swiping.x;
    const dy = event.clientY - swiping.y;
    swiping = null;
    if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
    // The browser emits click after pointerup: prevent unintended navigation.
    suppressClick = true;
    select(active + (dx < 0 ? 1 : -1));
    window.setTimeout(() => { suppressClick = false; }, 90);
  });
  stage.addEventListener('pointercancel', () => { swiping = null; });

  function scheduleLayout() {
    if (resizeFrame) cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = 0;
      updatePositions(false);
    });
  }

  updatePositions(false);
  shell.classList.add('coverflow-ready');
  window.addEventListener('resize', scheduleLayout, {passive:true});
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(scheduleLayout);
    observer.observe(stage);
  }
})();
