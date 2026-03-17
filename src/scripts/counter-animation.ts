export function initCounterAnimations() {
  const counters = document.querySelectorAll('[data-counter]');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((el) => observer.observe(el));
}

function animateCounter(el: HTMLElement) {
  const target = el.dataset.counter || '0';
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const duration = 1500;
  const start = performance.now();

  // Handle special non-numeric values
  if (target === '~mW' || target === '<1') {
    el.textContent = prefix + target + suffix;
    el.classList.add('visible');
    return;
  }

  const numericTarget = parseFloat(target);
  const isFloat = target.includes('.');

  function update(now: number) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current = numericTarget * eased;

    el.textContent = prefix + (isFloat ? current.toFixed(1) : Math.round(current).toString()) + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}
