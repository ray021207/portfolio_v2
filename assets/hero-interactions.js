/* The approved artwork is preserved; interactive controls sit over its illustrated objects. */
(() => {
  'use strict';
  const hero = document.querySelector('.approved-hero');
  if (!hero) return;
  const panel = document.getElementById('artProjectsPanel');
  const heading = document.getElementById('artPanelHeading');
  const desc = document.getElementById('artPanelDescription');
  const kicker = document.getElementById('artPanelKicker');
  const links = document.getElementById('artPanelLinks');
  const note = document.getElementById('artPanelFootnote');
  const closeButton = document.getElementById('artPanelClose');
  const controls = Array.from(hero.querySelectorAll('[data-explore-topic]'));
  const isDesktopHover = window.matchMedia('(hover:hover) and (pointer:fine)');
  const topics = {
    robotics: {
      title: 'Robotics & embodied AI',
      eyebrow: '01 / Follow the robot dog',
      description: 'Perception, semantic mapping, and decision-making for machines that navigate the physical world.',
      note: 'Explore engineering methods, simulations, and evaluation.',
      projects: [
        { name: 'GraphEQA — Semantic Navigation', url: '#project-grapheqa' },
        { name: 'GPS-Denied Semantic Mapping', url: '#work' },
        { name: 'Autonomous TurtleBot', url: 'https://ray021207.github.io/projects/turtlebot-autonomy.html', external: true }
      ]
    },
    conservation: {
      title: 'Conservation & wildlife AI',
      eyebrow: '02 / Follow the wildlife',
      description: 'Building and evaluating computer vision systems for real environments—not just familiar test sets.',
      note: 'Camera traps, native and invasive species, and field reliability.',
      projects: [
        { name: 'Native vs. Invasive Species', url: '#project-conservation' },
        { name: 'Explore the generalization gap', url: 'projects/explore.html' }
      ]
    },
    climate: {
      title: 'Earth observation & climate',
      eyebrow: '03 / Follow the mountains',
      description: 'Data-rich, public-facing tools that make environmental change easier to understand.',
      note: 'The NASA Space Apps site is a team hackathon project, not an official NASA product.',
      projects: [
        { name: 'Sinkronized — NASA Space Apps', url: 'https://sinkronized.vercel.app/web/', external: true },
        { name: 'Glacious — Climate Intelligence', url: 'https://glacious.streamlit.app/', external: true },
        { name: 'See the featured NASA project', url: '#project-nasa' }
      ]
    }
  };
  if (!panel || !heading || !desc || !links) return;
  let selected = null;
  let pinned = false;
  let hideTimer = null;
  let lastSource = null;

  function cancelHide() { if (hideTimer !== null) { clearTimeout(hideTimer); hideTimer = null; } }
  function updateControls() {
    controls.forEach(control => {
      const active = hero.dataset.open === 'true' && control.dataset.exploreTopic === selected;
      if (control.classList.contains('art-hit')) control.setAttribute('aria-expanded', String(active));
      else control.setAttribute('aria-pressed', String(active));
    });
  }
  function open(topic, source, pin = false) {
    const item = topics[topic];
    if (!item) return;
    cancelHide();
    selected = topic;
    pinned = pin;
    lastSource = source || lastSource;
    kicker.textContent = item.eyebrow;
    heading.textContent = item.title;
    desc.textContent = item.description;
    note.textContent = item.note;
    const entries = item.projects.map(project => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      const text = document.createElement('span');
      const arrow = document.createElement('span');
      text.textContent = project.name;
      arrow.textContent = project.external ? '↗' : '→';
      arrow.setAttribute('aria-hidden','true');
      a.href = project.url;
      if (project.external) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
      a.append(text, arrow);
      li.append(a);
      return li;
    });
    links.replaceChildren(...entries);
    hero.dataset.open = 'true';
    hero.dataset.active = topic;
    const position = source?.dataset?.side || 'left';
    hero.dataset.side = position;
    panel.inert = false;
    panel.setAttribute('aria-hidden', 'false');
    updateControls();
  }
  function close(restoreFocus = false) {
    cancelHide();
    hero.dataset.open = 'false';
    hero.dataset.active = '';
    panel.inert = true;
    panel.setAttribute('aria-hidden', 'true');
    selected = null;
    pinned = false;
    updateControls();
    if (restoreFocus && lastSource) lastSource.focus({ preventScroll: true });
  }
  function deferClose() {
    if (pinned || !isDesktopHover.matches) return;
    cancelHide();
    hideTimer = setTimeout(() => {
      const el = document.activeElement;
      if (!panel.contains(el) && !controls.includes(el)) close();
    }, 520);
  }
  controls.forEach(control => {
    const topic = control.dataset.exploreTopic;
    if (control.classList.contains('art-hit')) {
      control.addEventListener('pointerenter', event => {
        if (event.pointerType === 'mouse' || event.pointerType === 'pen') open(topic, control, false);
      });
      control.addEventListener('pointerleave', deferClose);
      control.addEventListener('focus', () => open(topic, control, false));
    }
    control.addEventListener('click', () => {
      if (hero.dataset.open === 'true' && selected === topic && pinned) close(false);
      else open(topic, control, true);
    });
  });
  panel.addEventListener('pointerenter', cancelHide);
  panel.addEventListener('pointerleave', deferClose);
  panel.addEventListener('focusin', cancelHide);
  panel.addEventListener('focusout', e => {
    if (!e.relatedTarget || !panel.contains(e.relatedTarget)) deferClose();
  });
  closeButton.addEventListener('click', () => close(true));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && hero.dataset.open === 'true') close(true); });
  document.addEventListener('pointerdown', e => {
    if (hero.dataset.open === 'true' && !panel.contains(e.target) && !e.target.closest('[data-explore-topic]')) close();
  });
  panel.querySelectorAll('a').forEach(a => a.addEventListener('click', () => close()));
  links.addEventListener('click', e => { if (e.target.closest('a')) close(); });
  close();
})();