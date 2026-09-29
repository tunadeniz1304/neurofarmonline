/** Mobile disclosure menu in the sticky header. */
export function initNavMenu() {
  const button = document.querySelector<HTMLButtonElement>('[data-menu-button]');
  const menu = document.querySelector<HTMLElement>('[data-menu]');
  if (!button || !menu) return;

  const setOpen = (open: boolean) => {
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.dataset.open = String(open);
  };

  button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => {
    if ((e.target as Element).closest('a')) setOpen(false);
  });
  [button, menu].forEach((el) =>
    el.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      button.focus();
    }),
  );
  window.matchMedia('(min-width: 1001px)').addEventListener('change', (e) => {
    if (e.matches) setOpen(false);
  });
}
