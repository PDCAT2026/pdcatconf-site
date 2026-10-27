const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const ids = ['registration-form', 'category', 'receipt', 'form-status', 'paper-id', 'paper-title', 'extra-pages', 'registration-fields'];
const elements = Object.fromEntries(ids.map(id => [id, {
  value: '', files: [], disabled: id === 'registration-fields', handlers: {},
  addEventListener(event, handler) { this.handlers[event] = handler; },
  setCustomValidity(message) { this.validationMessage = message; }
}]));
vm.runInNewContext(fs.readFileSync(path.join(root, '2026/js/registration-form.js'), 'utf8'), {
  document: { getElementById: id => elements[id] }
});
assert.equal(elements['registration-fields'].disabled, false);
assert.equal(elements['extra-pages'].disabled, true);
elements.category.value = 'author';
elements.category.handlers.change();
assert.equal(elements['paper-id'].required, true);
assert.equal(elements['paper-title'].required, true);
assert.equal(elements['extra-pages'].disabled, false);
elements.category.value = 'attendee';
elements.category.handlers.change();
assert.equal(elements['paper-id'].required, false);
assert.equal(elements['paper-title'].required, false);
assert.equal(elements['extra-pages'].disabled, true);
for (const [name, size, valid] of [
  ['receipt.PDF', 10 * 1024 * 1024, true],
  ['receipt.png', 10 * 1024 * 1024 + 1, false],
  ['receipt.exe', 1, false],
  ['receipt.jpg', 100, true]
]) {
  elements.receipt.files = [{ name, size }];
  elements.receipt.handlers.change();
  assert.equal(elements.receipt.validationMessage === '', valid, name);
}
elements.receipt.files = [];
elements.receipt.handlers.change();
assert.equal(elements.receipt.validationMessage, '');
let prevented = false;
elements['registration-form'].handlers.submit({ preventDefault() { prevented = true; } });
assert.equal(prevented, true);
assert.match(elements['form-status'].textContent, /Nothing has been submitted or saved/);
elements['registration-form'].handlers.input();
assert.equal(elements['form-status'].textContent, '');
const html = fs.readFileSync(path.join(root, '2026/registration-form.html'), 'utf8');
assert.match(html, /id="registration-fields" disabled/);
assert.match(html, /type="email"[^>]*required/);
assert.match(html, /type="file"[^>]*required/);
console.log('PASS: author/attendee requirements, file type and size boundaries, submit prevention, status reset and no-JS guard');
