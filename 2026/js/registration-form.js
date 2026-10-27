'use strict';

const registrationForm = document.getElementById('registration-form');
const category = document.getElementById('category');
const receipt = document.getElementById('receipt');
const formStatus = document.getElementById('form-status');

function updateRegistrationCategory() {
  const author = category.value === 'author';
  document.getElementById('paper-id').required = author;
  document.getElementById('paper-title').required = author;
  document.getElementById('extra-pages').disabled = !author;
}

category.addEventListener('change', updateRegistrationCategory);
receipt.addEventListener('change', () => {
  const file = receipt.files[0];
  receipt.setCustomValidity(file && (!/\.(jpe?g|png|pdf)$/i.test(file.name) || file.size > 10 * 1024 * 1024)
    ? 'Choose a JPG, PNG or PDF file no larger than 10 MB. / 请选择不超过 10 MB 的 JPG、PNG 或 PDF 文件。' : '');
});
registrationForm.addEventListener('input', () => { formStatus.textContent = ''; });
registrationForm.addEventListener('change', () => { formStatus.textContent = ''; });
registrationForm.addEventListener('submit', event => {
  event.preventDefault();
  formStatus.textContent = 'Required fields are complete. Nothing has been submitted or saved; online submission is not yet available. / 必填项已填写完整，但尚未提交或保存，在线提交暂未开放。';
});

// Keep fields disabled until the submit guard is installed, including when JavaScript fails to load.
document.getElementById('registration-fields').disabled = false;
updateRegistrationCategory();
