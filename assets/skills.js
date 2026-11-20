(() => {
  const section = document.querySelector('.skills-section');
  if (!section) return;

  const art = section.querySelector('.skills-art');
  const controls = section.querySelector('.skills-controls');
  const buttons = [...controls.querySelectorAll('button')];
  const inventories = [...section.querySelectorAll('.skill-inventory')];

  function select(category) {
    art.dataset.active = category;
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
    inventories.forEach(inventory => { inventory.hidden = inventory.dataset.skills !== category; });
    section.querySelector('.skills-scroll').scrollTop = 0;
  }

  select('technical');
  controls.hidden = false;
  buttons.forEach(button => button.addEventListener('click', () => select(button.dataset.filter)));

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      art.classList.add('skills-art-entered');
      observer.disconnect();
    }, { threshold: .25 });
    observer.observe(art);
  }
})();
