/**
 * Formulários Lulo's (/contato): validação, máscara de telefone, upload de PDF,
 * anti-spam (honeypot + tempo mínimo) e envio real para o endpoint de js/forms-config.js.
 * Nunca mostra confirmação sem resposta de sucesso do serviço.
 */
import { FORMS, MIN_FILL_MS } from '../forms-config.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const MSG = {
  required: 'Preencha este campo.',
  choice: 'Escolha uma opção.',
  consent: 'Para enviar, precisamos da sua autorização.',
  email: 'Confira o e-mail — parece que falta alguma coisa.',
  phone: 'Confira o número com DDD.',
  pdf: 'Envie o currículo em PDF.',
  size: (mb) => `O arquivo passa de ${mb} MB. Envie um PDF menor.`,
  invalid: 'Faltou alguma coisa. Confira os campos destacados.',
  sending: 'Enviando…',
  notReady: 'O envio por aqui ainda não está ativo, então nada foi enviado. Tente novamente em breve.',
  tooFast: 'Foi rápido demais! Confira os dados e envie de novo.',
  failed: 'Não conseguimos enviar agora. Verifique sua conexão e tente de novo.',
  rejected: 'O envio não foi aceito. Confira os dados e tente de novo.',
};

/* ---------- phone mask: (41) 99999-9999 / (41) 3333-3333 ---------- */
export function formatPhone(v) {
  const d = String(v).replace(/\D/g, '').slice(0, 11);
  if (!d) return '';
  if (d.length < 3) return `(${d}`;
  const ddd = d.slice(0, 2), rest = d.slice(2);
  if (rest.length <= 4) return `(${ddd}) ${rest}`;
  const cut = rest.length === 9 ? 5 : 4;
  return `(${ddd}) ${rest.slice(0, cut)}-${rest.slice(cut)}`;
}
const phoneOk = (v) => { const n = v.replace(/\D/g, '').length; return n === 10 || n === 11; };

function bindPhone(input) {
  input.addEventListener('input', () => {
    const atEnd = input.selectionStart === input.value.length;
    input.value = formatPhone(input.value);
    if (atEnd) input.setSelectionRange(input.value.length, input.value.length);
  });
}

/* ---------- file input (PDF + size limit) ---------- */
function bindFile(field) {
  const input = field.querySelector('input[type=file]');
  const name = field.querySelector('[data-file-name]');
  const clear = field.querySelector('[data-file-clear]');
  const empty = name.textContent;
  const sync = () => {
    const f = input.files[0];
    name.textContent = f ? f.name : empty;
    field.classList.toggle('has-file', !!f);
    clear.hidden = !f;
  };
  input.addEventListener('change', () => { sync(); validateField(field); });
  clear.addEventListener('click', () => { input.value = ''; sync(); clearError(field); input.focus(); });
  field._resetFile = () => { input.value = ''; sync(); };
}

/* ---------- errors ---------- */
let uid = 0;
function errEl(field) {
  const el = field.querySelector('.lfield__error');
  if (!el.id) el.id = `lerr-${++uid}`;
  return el;
}
function controlsOf(field) { return [...field.querySelectorAll('input:not([type=hidden]), textarea')]; }
function setError(field, msg) {
  const el = errEl(field);
  el.textContent = msg;
  field.classList.add('is-invalid');
  const ctrls = controlsOf(field);
  ctrls.forEach((c) => {
    c.setAttribute('aria-invalid', 'true');
    const ids = new Set((c.getAttribute('aria-describedby') || '').split(' ').filter(Boolean));
    ids.add(el.id);
    c.setAttribute('aria-describedby', [...ids].join(' '));
  });
  return false;
}
function clearError(field) {
  const el = field.querySelector('.lfield__error');
  if (el) el.textContent = '';
  field.classList.remove('is-invalid');
  controlsOf(field).forEach((c) => c.removeAttribute('aria-invalid'));
  return true;
}

/* ---------- field validation ---------- */
function validateField(field) {
  if (field.classList.contains('lfield--choices')) {
    const checked = field.querySelector('input:checked');
    return field.hasAttribute('data-required') && !checked ? setError(field, MSG.choice) : clearError(field);
  }
  if (field.classList.contains('lfield--consent')) {
    return field.querySelector('input').checked ? clearError(field) : setError(field, MSG.consent);
  }
  if (field.classList.contains('lfield--file')) {
    const input = field.querySelector('input[type=file]');
    const f = input.files[0];
    if (!f) return input.required ? setError(field, MSG.required) : clearError(field);
    const isPdf = f.type === 'application/pdf' || /\.pdf$/i.test(f.name);
    if (!isPdf) return setError(field, MSG.pdf);
    const max = parseFloat(input.dataset.maxMb || 5);
    if (f.size > max * 1024 * 1024) return setError(field, MSG.size(max));
    return clearError(field);
  }
  const c = field.querySelector('input, textarea');
  if (!c) return true;
  const v = c.value.trim();
  if (!v) return c.required ? setError(field, MSG.required) : clearError(field);
  if (c.type === 'email' && !EMAIL_RE.test(v)) return setError(field, MSG.email);
  if (c.hasAttribute('data-phone') && !phoneOk(v)) return setError(field, MSG.phone);
  return clearError(field);
}

/* ---------- submit ---------- */
function setStatus(form, msg, kind = '') {
  const s = form.querySelector('.lform__status');
  s.textContent = msg;
  s.dataset.kind = kind;
}

function setBusy(form, busy) {
  const btn = form.querySelector('.lform__submit');
  btn.disabled = busy;
  btn.classList.toggle('is-loading', busy);
  form.setAttribute('aria-busy', String(busy));
}

async function send(form, cfg) {
  const data = new FormData(form);
  // tidy values sent to the service
  for (const [k, v] of [...data.entries()]) if (typeof v === 'string') data.set(k, v.trim());
  const nome = data.get('nome'); const assunto = data.get('assunto') || data.get('area');
  if (assunto) data.set('_subject', `${data.get('_subject')} — ${assunto}${nome ? ` — ${nome}` : ''}`);
  if (data.get('email')) data.set('_replyto', data.get('email'));
  const file = data.get('curriculo');
  if (file instanceof File && !file.size) data.delete('curriculo');   // no file chosen

  const res = await fetch(cfg.endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res;
}

function showDone(form) {
  const wrap = form.closest('.lform-wrap');
  const done = wrap.querySelector('.lform-done');
  form.hidden = true;
  done.hidden = false;
  requestAnimationFrame(() => {
    done.classList.add('is-in');
    done.focus({ preventScroll: true });
    const r = wrap.getBoundingClientRect();
    if (r.top < 80 || r.top > innerHeight * 0.6) wrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

function resetForm(form) {
  const wrap = form.closest('.lform-wrap');
  const done = wrap.querySelector('.lform-done');
  form.reset();
  form.querySelectorAll('.lfield').forEach((f) => { clearError(f); f._resetFile?.(); });
  setStatus(form, '');
  done.classList.remove('is-in');
  done.hidden = true;
  form.hidden = false;
  form._openedAt = Date.now();
  form.querySelector('.lfield__input')?.focus();
}

export function initForms(root = document) {
  root.querySelectorAll('form[data-form]').forEach((form) => {
    const key = form.dataset.form;
    const cfg = FORMS[key] || {};
    const fields = [...form.querySelectorAll('.lfield')];
    form._openedAt = Date.now();

    form.querySelectorAll('[data-phone]').forEach(bindPhone);
    form.querySelectorAll('.lfield--file').forEach(bindFile);

    // validate on blur once touched; re-validate live after a first error
    fields.forEach((field) => {
      field.addEventListener('focusout', (e) => {
        if (field.contains(e.relatedTarget)) return;
        const c = field.querySelector('.lfield__input');
        if (c && !c.value.trim() && !field.classList.contains('is-invalid')) return;   // don't nag on empty first pass
        validateField(field);
      });
      field.addEventListener('input', () => { if (field.classList.contains('is-invalid')) validateField(field); });
      field.addEventListener('change', () => { if (field.classList.contains('is-invalid') || field.matches('.lfield--choices, .lfield--consent')) validateField(field); });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (form.getAttribute('aria-busy') === 'true') return;

      const results = fields.map(validateField);
      const firstBad = fields[results.indexOf(false)];
      if (firstBad) {
        setStatus(form, MSG.invalid, 'error');
        (firstBad.querySelector('input:not([type=hidden]), textarea'))?.focus();
        return;
      }

      // honeypot filled → robot: stop silently, nothing is sent
      if (form.querySelector('[name=_gotcha]')?.value) { setStatus(form, ''); return; }
      if (Date.now() - form._openedAt < MIN_FILL_MS) { setStatus(form, MSG.tooFast, 'error'); return; }

      if (!cfg.endpoint) {
        console.warn(`[Lulo's] Formulário "${key}" sem endpoint: configure js/forms-config.js. Nada foi enviado.`);
        setStatus(form, MSG.notReady, 'error');
        return;
      }

      setBusy(form, true);
      setStatus(form, MSG.sending, 'busy');
      try {
        await send(form, cfg);
        setStatus(form, '');
        showDone(form);
      } catch (err) {
        console.error(err);
        setStatus(form, err.status && err.status < 500 ? MSG.rejected : MSG.failed, 'error');
      } finally {
        setBusy(form, false);
      }
    });

    form.closest('.lform-wrap')?.querySelector('[data-form-reset]')?.addEventListener('click', () => resetForm(form));
  });
}
