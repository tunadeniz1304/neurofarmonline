/** Reveal [data-reveal] elements on scroll and count up [data-count] numbers once. */
export function initScrollAnimations() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
  );
  document.querySelectorAll('[data-reveal]').forEach((el) => revealObserver.observe(el));

  if (reduced) return;

  const countObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);
        countUp(entry.target as HTMLElement);
      });
    },
    { threshold: 0.6 },
  );
  document.querySelectorAll('[data-count]').forEach((el) => countObserver.observe(el));
}

function countUp(el: HTMLElement) {
  const raw = el.dataset.count ?? '';
  const match = raw.match(/^([^\d]*)([\d,]+)(.*)$/);
  if (!match) return;
  const [, prefix, digits, suffix] = match;
  const target = Number(digits.replace(/,/g, ''));
  const useComma = digits.includes(',');
  const duration = 1400;
  const start = performance.now();

  const frame = (now: number) => {
    const p = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - p, 4);
    const value = Math.round(target * eased);
    el.textContent = prefix + (useComma ? value.toLocaleString('en-US') : String(value)) + suffix;
    if (p < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
