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

    // Slanted stems and Bézier curves give the three letters an italic silhouette.
    const strokes = [
      'M 60 35 C 48 96 39 168 20 213',
      'M 63 39 C 111 24 157 32 149 73 C 143 109 105 123 49 117',
      'M 73 120 C 109 129 110 198 148 211',
      'M 161 212 C 187 172 218 86 272 34',
      'M 272 36 C 254 88 258 183 286 212',
      'M 195 149 Q 227 141 265 148',
      'M 314 32 C 337 52 331 105 371 126',
      'M 463 32 C 444 76 413 110 373 127',
      'M 373 127 C 362 158 354 198 331 213',
    ];
    const rows = strokes.flatMap(stroke => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', stroke);
      const length = path.getTotalLength();
      return [-6, 6].map(offset => ({ path, offset, length, labels: [], used: 0 }));
    });
    const scale = Math.min(width / 476, height / 246);
    const left = (width - 476 * scale) / 2;
    const top = (height - 246 * scale) / 2;
    const inventory = inventories.find(item => item.dataset.skills === active);
    const codeFont = '"DM Mono", ui-monospace, monospace';
    context.font = `italic 700 12px ${codeFont}`;
    const labels = [...inventory.querySelectorAll('li')].map(item => {
      const word = `• ${item.textContent.trim()}`;
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
        const point = row.path.getPointAtLength(position);
        const before = row.path.getPointAtLength(Math.max(0, position - 2));
        const after = row.path.getPointAtLength(Math.min(row.length, position + 2));
        const tangent = Math.atan2(after.y - before.y, after.x - before.x);
        const angle = tangent > Math.PI / 2 ? tangent - Math.PI
          : tangent < -Math.PI / 2 ? tangent + Math.PI : tangent;
        return {
          word,
          x: left + (point.x - Math.sin(tangent) * row.offset) * scale,
          y: top + (point.y + Math.cos(tangent) * row.offset) * scale,
          angle,
          maxWidth: (slot - 1.5) * scale,
          fromX: Math.random() * width,
          fromY: Math.random() * height,
        };
      });
    });
    art.querySelector('.skills-fallback').hidden = true;
    context.font = `italic 700 ${12 * scale}px ${codeFont}`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    const start = performance.now();
    function paint(now) {
      const progress = animate && !motion.matches ? Math.min((now - start) / 1150, 1) : 1;
      const eased = 1 - (1 - progress) ** 3;
      context.clearRect(0, 0, width, height);
      particles.forEach(({ word, x, y, angle, maxWidth, fromX, fromY }, index) => {
        const copper = index % 4 === 0;
        context.fillStyle = copper ? '#ffd19e' : '#fff4d9';
        context.shadowColor = copper ? '#e5a45b88' : '#ffeac655';
        context.shadowBlur = progress === 1 ? 3 * scale * ratio : 0;
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
