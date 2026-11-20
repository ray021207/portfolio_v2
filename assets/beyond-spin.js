/* Six-photo Spin Gallery — native JavaScript, original assets only.
   No scrolling interception or external animation dependency. */
(() => {
  'use strict';
  const gallery = document.querySelector('[data-spin-gallery]');
  if (!gallery) return;
  const stage = gallery.querySelector('[data-spin-stage]');
  const cards = [...gallery.querySelectorAll('[data-spin-card]')];
  const dialog = document.querySelector('[data-spin-dialog]');
  const preview = dialog?.querySelector('[data-spin-dialog-image]');
  const caption = dialog?.querySelector('[data-spin-dialog-caption]');
  const closeButton = dialog?.querySelector('[data-spin-close]');
  const prevButton = gallery.querySelector('[data-spin-prev]');
  const nextButton = gallery.querySelector('[data-spin-next]');
  const toggleButton = gallery.querySelector('[data-spin-toggle]');
  const motion = window.matchMedia('(min-width: 920px) and (prefers-reduced-motion: no-preference)');
  if (cards.length !== 6 || !stage) return;

  let phase = 0;
  let targetPhase = 0;
  let autoPaused = false;
  let hovered = false;
  let focused = false;
  let inView = true;
  let drag = null;
  let justDragged = false;
  let frame = 0;
  let lastFrame = 0;
  let geometry = { width: 218, height: 218, imageHeight: 146, radiusX: 420, radiusY: 120 };
  const TAU = Math.PI * 2;
  const SPACING = TAU / cards.length;
  const orbitalSpeed = .10; // radians per second: ~63 seconds per revolution

  function photoTitle(card) {
    return card.querySelector('figcaption strong')?.textContent?.trim() || 'Photo';
  }

  // Photo buttons open the user's original full-resolution photographs.
  cards.forEach((card) => {
    const button = card.querySelector('[data-spin-open]');
    if (!button) return;
    button.addEventListener('click', (event) => {
      if (justDragged) {
        event.preventDefault();
        return;
      }
      if (!dialog || !preview || !caption || typeof dialog.showModal !== 'function') return;
      const image = button.querySelector('img');
      if (!image) return;
      const currentSrc = image.getAttribute('src');
      if (!currentSrc) return;
      preview.setAttribute('src', currentSrc);
      preview.setAttribute('alt', image.getAttribute('alt') || photoTitle(card));
      caption.textContent = photoTitle(card);
      dialog.showModal();
    });
  });
  closeButton?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog?.addEventListener('close', () => {
    preview?.removeAttribute('src');
  });

  function measure() {
    const width = stage.clientWidth || window.innerWidth;
    const height = stage.clientHeight || 480;
    const cardWidth = Math.min(232, Math.max(178, width * .19));
    const cardHeight = Math.min(230, Math.max(184, height * .435));
    const imageHeight = cardHeight * .67;
    geometry = {
      width: cardWidth,
      height: cardHeight,
      imageHeight,
      radiusX: Math.max(90, width / 2 - cardWidth / 2 - 20),
      radiusY: Math.max(75, (height - cardHeight) / 2 - 17)
    };
    stage.style.setProperty('--orbit-card-width', cardWidth.toFixed(1) + 'px');
    stage.style.setProperty('--orbit-card-height', cardHeight.toFixed(1) + 'px');
    stage.style.setProperty('--orbit-image-height', imageHeight.toFixed(1) + 'px');
  }

  function positionCards() {
    if (!stage.classList.contains('is-orbiting')) return;
    const { radiusX, radiusY } = geometry;
    cards.forEach((card, i) => {
      const angle = phase + i * SPACING;
      const sin = Math.sin(angle);
      const cos = Math.cos(angle);
      // Front/back depth + a shallow elliptic track makes every photo visible
      // without six cards piling directly on top of one another.
      const x = cos * radiusX;
      const y = sin * radiusY;
      const z = sin * 85;
      const yaw = -cos * 18;
      card.style.setProperty('--orbit-x', x.toFixed(2) + 'px');
      card.style.setProperty('--orbit-y', y.toFixed(2) + 'px');
      card.style.setProperty('--orbit-z', z.toFixed(2) + 'px');
      card.style.setProperty('--orbit-ry', yaw.toFixed(2) + 'deg');
      card.style.setProperty('--orbit-layer', String(Math.round((sin + 1) * 60) + 1));
    });
  }

  function tick(time) {
    if (!motion.matches) return;
    const dt = lastFrame ? Math.min(.05, (time - lastFrame) / 1000) : .016;
    lastFrame = time;
    if (inView && !autoPaused && !hovered && !focused && !dialog?.open && !drag) {
      targetPhase += dt * orbitalSpeed;
    }
    phase += (targetPhase - phase) * Math.min(1, dt * 10);
    if (inView) positionCards();
    frame = requestAnimationFrame(tick);
  }

  function activate() {
    if (!motion.matches) {
      stop();
      return;
    }
    if (stage.classList.contains('is-orbiting')) return;
    stage.classList.add('is-orbiting');
    gallery.classList.add('is-enhanced');
    measure();
    positionCards();
    lastFrame = 0;
    frame = requestAnimationFrame(tick);
  }
  function stop() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    stage.classList.remove('is-orbiting');
    gallery.classList.remove('is-enhanced');
    cards.forEach(card => {
      for (const key of ['--orbit-x','--orbit-y','--orbit-z','--orbit-ry','--orbit-layer'])
        card.style.removeProperty(key);
    });
  }

  function turn(direction) {
    if (!motion.matches) return;
    targetPhase += direction * SPACING;
  }
  prevButton?.addEventListener('click', () => turn(-1));
  nextButton?.addEventListener('click', () => turn(1));
  toggleButton?.addEventListener('click', () => {
    autoPaused = !autoPaused;
    toggleButton.textContent = autoPaused ? 'Resume rotation' : 'Pause rotation';
    toggleButton.setAttribute('aria-pressed', String(autoPaused));
  });

  // Pausing on hover/focus makes the photographs easy to actually inspect.
  stage.addEventListener('pointerenter', () => { hovered = true; });
  stage.addEventListener('pointerleave', () => { hovered = false; });
  stage.addEventListener('focusin', () => { focused = true; });
  stage.addEventListener('focusout', () => {
    focused = stage.contains(document.activeElement);
  });

  // Horizontal drag turns the orbit. Vertical finger scrolling stays native.
  stage.addEventListener('pointerdown', event => {
    if (!motion.matches || event.button !== 0) return;
    drag = { id:event.pointerId, x:event.clientX, y:event.clientY, lastX:event.clientX, moved:false };
  });
  stage.addEventListener('pointermove', event => {
    if (!drag || drag.id !== event.pointerId || !motion.matches) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.moved && Math.abs(dx) > 9 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      drag.moved = true;
      justDragged = true;
      try { stage.setPointerCapture(event.pointerId); } catch (_) {}
    }
    if (drag.moved) {
      const step = (event.clientX - drag.lastX) / Math.max(240, stage.clientWidth) * 5.4;
      targetPhase += step;
      phase = targetPhase;
      positionCards();
    }
    drag.lastX = event.clientX;
  });
  function endDrag() {
    if (!drag) return;
    const moved = drag.moved;
    drag = null;
    if (moved) window.setTimeout(() => { justDragged = false; }, 240);
  }
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);
  stage.addEventListener('lostpointercapture', endDrag);

  gallery.setAttribute('tabindex', '0');
  gallery.addEventListener('keydown', event => {
    if (!motion.matches || dialog?.open) return;
    if (event.key === 'ArrowLeft') { event.preventDefault(); turn(-1); }
    else if (event.key === 'ArrowRight') { event.preventDefault(); turn(1); }
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      for (const entry of entries) {
        inView = entry.isIntersecting;
        if (inView) { lastFrame = 0; measure(); positionCards(); }
      }
    }, { threshold:.02 }).observe(gallery);
  }
  window.addEventListener('resize', () => { if (motion.matches) { measure(); positionCards(); } }, {passive:true});
  if (typeof motion.addEventListener === 'function') {
    motion.addEventListener('change', () => {
      if (motion.matches) activate();
      else stop();
    });
  }
  activate();
})();
