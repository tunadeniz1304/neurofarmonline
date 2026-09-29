/**
 * Submits the brief form to Formspree without leaving the page.
 * Without JS the form still posts normally (progressive enhancement).
 */
export function initContactForm(form: HTMLFormElement) {
  const status = form.querySelector<HTMLElement>('[data-form-status]');
  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const email = form.dataset.fallbackEmail ?? '';
  if (!status || !submit) return;

  const show = (state: '' | 'ok' | 'err', message: string) => {
    status.dataset.state = state;
    status.textContent = message;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    submit.disabled = true;
    show('', 'Sending…');
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error(`Formspree responded ${response.status}`);
      form.reset();
      show('ok', `Thank you — your request is in. We’ll reply personally from ${email}.`);
    } catch {
      show('err', `Something went wrong sending the form. Please email ${email} directly.`);
    } finally {
      submit.disabled = false;
    }
  });
}
