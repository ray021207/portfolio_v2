(() => {
  const section = document.querySelector('.skills-section');
  if (!section) return;

  const canvas = section.querySelector('canvas');
  const context = canvas.getContext('2d');
  const art = section.querySelector('.skills-art');
  const controls = section.querySelector('.skills-controls');
  const buttons = [...controls.querySelectorAll('button')];
  const inventories = [...section.querySelectorAll('.skill-inventory')];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let active = 'technical';
  let visible = false;
  let frame = 0;

  function draw(animate = false) {
    if (!context) return;
    cancelAnimationFrame(frame);
    const { clientWidth: width, clientHeight: height } = art;
    if (!width || !height) return;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    // Parallel rows of words trace the strokes of R, A and Y.
    const strokes = [
      [26, 29, 26, 215], [40, 39, 113, 39], [128, 38, 128, 118],
      [40, 117, 113, 117], [67, 132, 144, 215],
      [177, 215, 235, 33], [235, 33, 293, 215], [204, 150, 266, 150],
      [320, 32, 386, 126], [452, 32, 386, 126], [386, 137, 386, 215],
    ];
    const rows = strokes.flatMap(([x, y, endX, endY]) => {
      const angle = Math.atan2(endY - y, endX - x);
      const length = Math.hypot(endX - x, endY - y);
      return [-6, 6].map(offset => ({
        x: x - Math.sin(angle) * offset,
        y: y + Math.cos(angle) * offset,
        angle, length, labels: [], used: 0,
      }));
    });
    const scale = Math.min(width / 476, height / 246);
    const left = (width - 476 * scale) / 2;
    const top = (height - 246 * scale) / 2;
    const inventory = inventories.find(item => item.dataset.skills === active);
    context.font = '700 12px "DM Sans", sans-serif';
    const labels = [...inventory.querySelectorAll('li')].map(item => {
      const word = item.textContent.trim();
      return { word, span: context.measureText(word).width + 4 };
    });
    if (!labels.length) return;

    // Give each row a word, then balance the remaining words by row length.
    // Repeats fill the strokes in the shorter Soft skills category.
    for (let i = 0; i < Math.max(62, labels.length); i++) {
      const label = labels[i % labels.length];
      const row = rows[i] ?? rows.reduce((best, candidate) =>
        (candidate.used + label.span) / candidate.length < (best.used + label.span) / best.length
          ? candidate : best
      );
      row.labels.push(label);
      row.used += label.span;
    }

    const particles = rows.flatMap(row => {
      let cursor = 0;
      return row.labels.map(({ word, span }) => {
        const slot = span * row.length / row.used;
        const position = cursor + slot / 2;
        cursor += slot;
        return {
          word,
          x: left + (row.x + Math.cos(row.angle) * position) * scale,
          y: top + (row.y + Math.sin(row.angle) * position) * scale,
          angle: Math.cos(row.angle) < -0.001 ? row.angle + Math.PI : row.angle,
          maxWidth: (slot - 1.5) * scale,
          fromX: Math.random() * width,
          fromY: Math.random() * height,
        };
      });
    });
    art.querySelector('.skills-fallback').hidden = true;
    context.font = `700 ${12 * scale}px "DM Sans", sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    const start = performance.now();
    function paint(now) {
      const progress = animate && !motion.matches ? Math.min((now - start) / 1150, 1) : 1;
      const eased = 1 - (1 - progress) ** 3;
      context.clearRect(0, 0, width, height);
      particles.forEach(({ word, x, y, angle, maxWidth, fromX, fromY }, index) => {
        context.fillStyle = index % 4 === 0 ? '#e5b383' : '#ffeac6';
        context.save();
        context.translate(fromX + (x - fromX) * eased, fromY + (y - fromY) * eased);
        context.rotate(angle * eased);
        context.fillText(word, 0, 0, maxWidth);
        context.restore();
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
  document.fonts.ready.then(() => { if (!visible) draw(); });
  motion.addEventListener('change', () => draw());
})();
