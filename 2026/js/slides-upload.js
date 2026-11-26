'use strict';

const endpoint = 'https://101.37.245.203/api/slides';
const byId = id => document.getElementById(id);
const pendingKey = 'pdcat2026-slides-upload-code';
const form = byId('slides-form'), fields = byId('slides-fields'), fileInput = byId('slides');
let uploadCode = '';
try { uploadCode = sessionStorage.getItem(pendingKey) || ''; } catch (_) {}

function clearCode() {
  uploadCode = '';
  try { sessionStorage.removeItem(pendingKey); } catch (_) {}
}

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  fileInput.setCustomValidity(file && (!/\.(pptx?|pdf)$/i.test(file.name) || !file.size || file.size > 15 * 1024 * 1024)
    ? 'Choose a nonempty PPT, PPTX, or PDF file no larger than 15 MB.' : '');
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (fields.disabled || !form.reportValidity()) return;
  if (!uploadCode) uploadCode = Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('');
  try { sessionStorage.setItem(pendingKey, uploadCode); } catch (_) {}
  const body = new FormData(form);
  body.set('upload_code', uploadCode);
  fields.disabled = true;
  byId('form-status').textContent = 'Uploading your presentation file… Keep this page open.';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 180000);
  try {
    const response = await fetch(endpoint, {method:'POST', body, credentials:'omit', signal:controller.signal});
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.id) {
      if (response.status === 409) clearCode();
      const message = response.status === 413 ? 'The file exceeds 15 MB.' : 'The server could not confirm your upload. Please retry.';
      throw new Error(data.error || message);
    }
    clearCode();
    const time = new Date(data.created_at).toLocaleString('en-GB', {timeZone:'Asia/Shanghai', hour12:false});
    byId('confirmation').textContent = `Paper ${data.paper_id} · Session ${data.session} · ${data.filename} · ${time} (Beijing time). Confirmation ID ${data.id}.`;
    byId('form-status').textContent = '';
    form.hidden = true;
    byId('submission-result').hidden = false;
    byId('submission-result').focus();
  } catch (error) {
    byId('form-status').textContent = error instanceof TypeError || error.name === 'AbortError'
      ? 'Connection interrupted. The server may have received your file. Keep the same details and file, then click Upload slides again to retry safely.' : error.message;
    fields.disabled = false;
  } finally { clearTimeout(timer); }
});

byId('new-upload').addEventListener('click', () => {
  form.reset();
  fileInput.setCustomValidity('');
  fields.disabled = form.hidden = byId('form-status').hidden = false;
  byId('submission-result').hidden = true;
  byId('paper-id').focus();
});
fields.disabled = false;
