'use strict';

const API_BASE = 'https://119.91.95.42';
const byId = id => document.getElementById(id);
const pendingKey = 'pdcat2026-poster-upload-code';
const fields = byId('poster-fields'), fileInput = byId('poster'), form = byId('poster-form');
let uploadCode = '', saved = null;
try { uploadCode = sessionStorage.getItem(pendingKey) || ''; } catch (_) { /* Retries also work when session storage is unavailable. */ }
function newCode() { return Array.from(crypto.getRandomValues(new Uint8Array(32)), byte => byte.toString(16).padStart(2, '0')).join(''); }
const submittedAt = value => new Date(value).toLocaleString('en-GB', {timeZone:'Asia/Shanghai', hour12:false});
fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  byId('poster-filename').textContent = file ? file.name + ' · ' + (file.size / 1024 / 1024).toFixed(2) + ' MB' : 'No file selected';
  fileInput.setCustomValidity(file && (!/\.pdf$/i.test(file.name) || !file.size || file.size > 10 * 1024 * 1024) ? 'Choose a nonempty PDF file no larger than 10 MB.' : '');
});
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (saved || !form.reportValidity()) return;
  if (!uploadCode) uploadCode = newCode();
  try { sessionStorage.setItem(pendingKey, uploadCode); } catch (_) {}
  const body = new FormData(form);
  body.set('upload_code', uploadCode);
  fields.disabled = true;
  byId('form-status').textContent = 'Uploading your poster… Please keep this page open.';
  const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 90000);
  try {
    const response = await fetch(API_BASE + '/api/posters', {method:'POST', body, credentials:'omit', cache:'no-store', signal:controller.signal});
    const data = await response.json().catch(() => ({error:'The server could not process the upload. Please retry.'}));
    if (!response.ok) {
      if (response.status === 409) {
        uploadCode = '';
        try { sessionStorage.removeItem(pendingKey); } catch (_) {}
      }
      throw new Error(data.error || 'Upload failed. Please retry.');
    }
    saved = data;
    try { sessionStorage.removeItem(pendingKey); } catch (_) {}
    byId('saved-id').textContent = saved.id;
    byId('saved-paper-id').textContent = saved.paper_id;
    byId('saved-filename').textContent = saved.filename;
    byId('saved-created-at').textContent = submittedAt(saved.created_at);
    byId('form-status').textContent = '';
    byId('submission-result').hidden = false;
    byId('submission-result').scrollIntoView({behavior:'smooth', block:'start'});
  } catch (error) {
    byId('form-status').textContent = error instanceof TypeError || error.name === 'AbortError'
      ? 'Connection interrupted. Your upload may have reached the server. Keep the same details and PDF, then click Upload poster again to retry safely.' : error.message;
    fields.disabled = false;
  } finally { clearTimeout(timeout); }
});
byId('save-confirmation').addEventListener('click', () => {
  if (!saved) return;
  const receipt = `PDCAT 2026 poster upload confirmation\nSubmission ID: ${saved.id}\nPaper ID: ${saved.paper_id}\nFile: ${saved.filename}\nSubmitted at (UTC+8): ${submittedAt(saved.created_at)}\nPoster received by the organizing committee.\n`;
  const url = URL.createObjectURL(new Blob([receipt], {type:'text/plain;charset=utf-8'}));
  const link = document.createElement('a');
  link.href = url; link.download = saved.id + '-confirmation.txt';
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
byId('new-upload').addEventListener('click', () => {
  saved = null; uploadCode = ''; form.reset(); fields.disabled = false;
  fileInput.setCustomValidity(''); byId('poster-filename').textContent = 'No file selected';
  byId('submission-result').hidden = true; byId('form-status').textContent = '';
  try { sessionStorage.removeItem(pendingKey); } catch (_) {}
  byId('paper-id').focus();
});
fields.disabled = false;
