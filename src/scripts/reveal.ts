/** Fades `.reveal` elements in as they scroll into view (CSS skips it under reduced motion). */
export function initReveal() {
  const elements = document.querySelectorAll<HTMLElement>('.reveal');
  if (!('IntersectionObserver' in window)) {
    elements.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px' },
  );
  elements.forEach((el) => observer.observe(el));
}
