(() => {
  const section = document.querySelector('.skills-section');
  if (!section) return;

  const art = section.querySelector('.skills-art');
  const labels = art.querySelector('.skills-path-labels');
  const controls = section.querySelector('.skills-controls');
  const buttons = [...controls.querySelectorAll('button')];
  const inventories = [...section.querySelectorAll('.skill-inventory')];
  const scroll = section.querySelector('.skills-scroll');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const svgNS = 'http://www.w3.org/2000/svg';
  const fontSize = 10.5;
  const gap = 9;
  const edge = 7;
  const measure = document.createElement('canvas').getContext('2d');
  if (measure) measure.font = `650 ${fontSize}px system-ui`;

  const strokes = [
    ['r-stem', [-13, 0, 13]], ['r-bowl', [-12, 0, 12]], ['r-cross', [-8, 6]],
    ['r-leg', [-12, 0, 12]], ['a-arch', [-9, 3]], ['a-right', [-8, 6]],
    ['a-cross', [-6, 6]], ['a-loop', [-8, 5]], ['y-left', [-12, 0, 12]],
    ['y-right', [-12, 0, 12]], ['y-tail', [-8, 5]],
  ];
  const lanes = strokes.flatMap(([name, offsets]) => {
    const id = `ray-${name}`;
    const length = art.querySelector(`#${id}`).getTotalLength();
    return offsets.map(offset => ({ id, length, offset }));
  });

  function fillLetters(inventory) {
    labels.replaceChildren();
    const skills = [...inventory.querySelectorAll('li')].map(item => {
      const word = item.textContent.trim();
      const width = measure?.measureText(word).width ?? word.length * fontSize * .55;
      return { word, width };
    }).sort((a, b) => b.width - a.width);

    // Balance the total label width across the available strokes.
    const rows = lanes.map(lane => ({ ...lane, skills: [], used: 0 }));
    for (const skill of skills) {
      const row = rows.reduce((best, candidate) => {
        const load = row => (row.used + skill.width + gap) / row.length + Math.abs(row.offset) / 250;
        return load(candidate) < load(best) ? candidate : best;
      });
      row.skills.push(skill);
      row.used += skill.width + gap;
    }

    for (const row of rows) {
      if (!row.skills.length) continue;
      const scale = Math.min(1, (row.length - edge * 2) / (row.used - gap));
      const textWidth = row.used - row.skills.length * gap;
      const freeSpace = row.length - textWidth * scale;
      const spacing = (freeSpace - edge * 2) / Math.max(1, row.skills.length - 1);
      let cursor = row.skills.length === 1 ? freeSpace / 2 : edge;
      for (const { word, width } of row.skills) {
        const label = document.createElementNS(svgNS, 'text');
        const path = document.createElementNS(svgNS, 'textPath');
        label.setAttribute('dy', row.offset);
        if (row.offset < 0) label.classList.add('skills-label-olive');
        if (row.offset > 0) label.classList.add('skills-label-rust');
        label.setAttribute('textLength', width * scale);
        label.setAttribute('lengthAdjust', 'spacingAndGlyphs');
        path.setAttribute('href', `#${row.id}`);
        path.setAttribute('startOffset', cursor + width * scale / 2);
        path.textContent = word;
        label.append(path);
        labels.append(label);
        cursor += width * scale + spacing;
      }
    }
  }

  let generation = 0;
  function flyIn() {
    const sequence = ++generation;
    if (motion.matches || !labels.firstChild?.animate) {
      labels.setAttribute('clip-path', 'url(#ray-letter-boundaries)');
      return;
    }
    labels.removeAttribute('clip-path');
    const animations = [...labels.children].map((label, index) =>
      label.animate([
        { opacity: 0, transform: `translate(180px, ${(index % 9 - 4) * 14}px)` },
        { opacity: 1, offset: .42 },
        { opacity: 1, transform: 'translate(0, 0)' },
      ], { duration: 950, delay: index % 18 * 32, fill: 'backwards', easing: 'cubic-bezier(.22,.75,.3,1)' })
    );
    Promise.allSettled(animations.map(animation => animation.finished)).then(() => {
      if (sequence === generation) labels.setAttribute('clip-path', 'url(#ray-letter-boundaries)');
    });
  }

  let entered = false;
  function select(category) {
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
    const inventory = inventories.find(item => item.dataset.skills === category);
    inventories.forEach(item => { item.hidden = item !== inventory; });
    scroll.scrollTop = 0;
    fillLetters(inventory);
    if (entered) flyIn();
  }

  select('technical');
  controls.hidden = false;
  buttons.forEach(button => button.addEventListener('click', () => select(button.dataset.filter)));
  motion.addEventListener('change', () => {
    if (!motion.matches) return;
    for (const label of labels.children) {
      label.getAnimations().forEach(animation => animation.cancel());
    }
    labels.setAttribute('clip-path', 'url(#ray-letter-boundaries)');
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      entered = true;
      flyIn();
      observer.disconnect();
    }, { threshold: .25 });
    observer.observe(art);
  }
})();
