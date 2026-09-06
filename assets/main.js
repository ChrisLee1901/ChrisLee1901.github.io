const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const loader = document.querySelector('.loader');
const loaderCount = document.querySelector('.loader__count');
document.body.classList.add('is-loading');

if (reduceMotion) {
  loader?.remove();
  document.body.classList.remove('is-loading');
} else {
  const started = performance.now();
  const tick = (now) => {
    const progress = Math.min(100, Math.floor(((now - started) / 820) * 100));
    loaderCount.textContent = String(progress).padStart(2, '0');
    if (progress < 100) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  window.addEventListener('load', () => setTimeout(() => {
    loader.classList.add('is-done');
    document.body.classList.remove('is-loading');
  }, 900));
}

const header = document.querySelector('.site-header');
const progressBar = document.querySelector('.scroll-progress');
const parallaxItems = [...document.querySelectorAll('[data-speed]')];

const onScroll = () => {
  const top = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  header.classList.toggle('scrolled', top > 24);
  progressBar.style.transform = `scaleX(${max > 0 ? top / max : 0})`;
  if (!reduceMotion) parallaxItems.forEach((item) => item.style.translate = `0 ${top * Number(item.dataset.speed)}px`);
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

if (window.matchMedia('(pointer:fine)').matches && !reduceMotion) {
  const glow = document.querySelector('.cursor-glow');
  window.addEventListener('pointermove', (event) => {
    glow.style.left = `${event.clientX}px`;
    glow.style.top = `${event.clientY}px`;
    glow.style.opacity = '1';
  });

  document.querySelectorAll('.magnetic').forEach((item) => {
    item.addEventListener('pointermove', (event) => {
      const rect = item.getBoundingClientRect();
      item.style.transform = `translate(${(event.clientX - rect.left - rect.width / 2) * .14}px, ${(event.clientY - rect.top - rect.height / 2) * .14}px)`;
    });
    item.addEventListener('pointerleave', () => item.style.transform = '');
  });

  document.querySelectorAll('[data-tilt]').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateY = ((x / rect.width) - .5) * 2.2;
      const rotateX = ((y / rect.height) - .5) * -2.2;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    card.addEventListener('pointerleave', () => card.style.transform = '');
  });
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
document.querySelectorAll('.reveal').forEach((item) => revealObserver.observe(item));

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const counter = entry.target;
    const target = Number(counter.dataset.target);
    const decimals = Number(counter.dataset.decimals || 0);
    if (reduceMotion) {
      counter.textContent = target.toFixed(decimals);
    } else {
      const start = performance.now();
      const animate = (now) => {
        const elapsed = Math.min(1, (now - start) / 1200);
        const eased = 1 - Math.pow(1 - elapsed, 3);
        counter.textContent = (target * eased).toFixed(decimals);
        if (elapsed < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }
    counterObserver.unobserve(counter);
  });
}, { threshold: .7 });
document.querySelectorAll('.counter').forEach((item) => counterObserver.observe(item));
document.querySelector('#year').textContent = new Date().getFullYear();
