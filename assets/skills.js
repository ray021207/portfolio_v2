(() => {
  const section = document.querySelector('.skills-section');
  if (!section) return;

  const canvas = section.querySelector('canvas');
  const context = canvas.getContext('2d');
  const mask = document.createElement('canvas');
  const stencil = mask.getContext('2d', { willReadFrequently: true });
  const art = section.querySelector('.skills-art');
  const controls = section.querySelector('.skills-controls');
  const buttons = [...controls.querySelectorAll('button')];
  const inventories = [...section.querySelectorAll('.skill-inventory')];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let active = 'technical';
  let visible = false;
  let frame = 0;

  function draw(animate = false) {
    if (!context || !stencil) return;
    cancelAnimationFrame(frame);
    const { clientWidth: width, clientHeight: height } = art;
    if (!width || !height) return;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    mask.width = width;
    mask.height = height;
    const typeface = '"Fraunces", Georgia, serif';
    stencil.font = `600 100px ${typeface}`;
    const measure = stencil.measureText('RAY');
    const fontSize = Math.min(
      width * 90 / measure.width,
      height * 76 / ((measure.actualBoundingBoxAscent || 72) + measure.actualBoundingBoxDescent)
    );
    stencil.font = `600 ${fontSize}px ${typeface}`;
    const bounds = stencil.measureText('RAY');
    stencil.textAlign = 'center';
    stencil.fillText('RAY', width / 2, (height + bounds.actualBoundingBoxAscent - bounds.actualBoundingBoxDescent) / 2);
    const pixels = stencil.getImageData(0, 0, width, height).data;
    const words = [...inventories.find(item => item.dataset.skills === active).querySelectorAll('li')].map(item => item.textContent);
    const size = Math.max(5, Math.min(10, width / 82));
    context.font = `600 ${size}px "DM Sans", sans-serif`;
    context.textBaseline = 'middle';
    const particles = [];
    const inside = (x, y) => pixels[(Math.floor(y) * width + Math.floor(x)) * 4 + 3] > 180;

    for (let y = size; y < height - size; y += size * 1.45) {
      for (let x = size; x < width - size;) {
        if (!inside(x, y)) {
          x += 2;
          continue;
        }
        const word = words[particles.length % words.length];
        const span = context.measureText(word).width;
        let fits = x + span < width;
        for (let offset = 0; fits && offset <= span; offset += 2) {
          fits = inside(x + offset, y - size / 2) && inside(x + offset, y + size / 2);
        }
        if (!fits) {
          x += 2;
          continue;
        }
        particles.push({ word, x, y, fromX: Math.random() * width, fromY: Math.random() * height });
        x += span + size * .55;
      }
    }
    art.querySelector('.skills-fallback').hidden = particles.length > 0;
    if (!particles.length) return;

    const start = performance.now();
    function paint(now) {
      const progress = animate && !motion.matches ? Math.min((now - start) / 1150, 1) : 1;
      const eased = 1 - (1 - progress) ** 3;
      context.clearRect(0, 0, width, height);
      particles.forEach(({ word, x, y, fromX, fromY }, index) => {
        context.fillStyle = index % 4 === 0 ? '#e5b383' : '#ffeac6';
        context.fillText(word, fromX + (x - fromX) * eased, fromY + (y - fromY) * eased);
      });
      if (progress < 1 && visible) frame = requestAnimationFrame(paint);
    }
    paint(start);
  }

  function select(category, animate) {
    active = category;
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === active)));
    inventories.forEach(item => { item.hidden = item.dataset.skills !== active; });
    section.querySelector('.skills-scroll').scrollTop = 0;
    draw(animate);
  }

  controls.hidden = false;
  buttons.forEach(button => button.addEventListener('click', () => select(button.dataset.filter, visible)));
  select(active, false);
  new ResizeObserver(() => draw()).observe(art);
  new IntersectionObserver(([entry]) => {
    const entering = entry.isIntersecting && !visible;
    visible = entry.isIntersecting;
    if (entering) draw(true);
  }, { threshold: .3 }).observe(art);
  document.fonts.ready.then(() => draw());
  motion.addEventListener('change', () => draw());
})();
