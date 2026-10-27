'use strict';

const API_BASE = 'https://101.37.245.203';
const registrationForm = document.getElementById('registration-form');
const category = document.getElementById('category');
const receipt = document.getElementById('receipt');
const formStatus = document.getElementById('form-status');
const fields = document.getElementById('registration-fields');
const byId = id => document.getElementById(id);
let queryCode = '', saved = null;
try { queryCode=sessionStorage.getItem('pdcat2026-pending-code')||''; } catch (_) { /* The random key prevents duplicates on retry; it is not used for email lookup. */ }

function updateRegistrationCategory() {
  const author = category.value === 'author';
  byId('paper-id').required = author; byId('paper-title').required = author; byId('extra-pages').disabled = !author;
}
category.addEventListener('change', updateRegistrationCategory);
receipt.addEventListener('change', () => {
  const file = receipt.files[0];
  receipt.setCustomValidity(file && (!/\.(jpe?g|png|pdf)$/i.test(file.name) || file.size > 10 * 1024 * 1024 || file.size === 0)
    ? 'Choose a nonempty JPG, PNG or PDF file no larger than 10 MB. / 请选择不超过10 MB的非空 JPG、PNG 或 PDF 文件。' : '');
});

async function request(path, body, json=false) {
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),90000);
  try{
    const response=await fetch(API_BASE+path,{method:'POST',body:json?JSON.stringify(body):body,headers:json?{'Content-Type':'application/json'}:undefined,credentials:'omit',cache:'no-store',signal:controller.signal});
    const data=await response.json().catch(()=>({error:'Service unavailable. Please retry. / 服务暂不可用，请重试。'}));
    if(!response.ok){const error=new Error(data.error||'Request failed / 请求失败');error.registrationId=data.id;throw error;}
    return data;
  }catch(error){
    if(error instanceof TypeError || error.name==='AbortError')throw new Error('Connection interrupted. The submission may have reached the server; retry without changing the form. / 连接中断，服务端可能已收到，请保持表单内容不变并重试。');
    throw error;
  }finally{clearTimeout(timeout);}
}

registrationForm.addEventListener('submit', async event => {
  event.preventDefault();
  if(saved)return;
  if(!queryCode){const bytes=crypto.getRandomValues(new Uint8Array(32));queryCode=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');}
  try{sessionStorage.setItem('pdcat2026-pending-code',queryCode);}catch(_){}
  const body=new FormData(registrationForm);body.set('query_code',queryCode);
  fields.disabled=true;formStatus.textContent='Submitting… / 正在提交…';
  try{
    saved=await request('/api/registrations',body);
    byId('saved-id').textContent=saved.id;saved.email=body.get('email');
    byId('submission-result').hidden=false;
    formStatus.textContent=saved.message;
    try{sessionStorage.removeItem('pdcat2026-pending-code');}catch(_){}
    byId('submission-result').scrollIntoView({behavior:'smooth',block:'center'});
  }catch(error){formStatus.textContent=error.message;fields.disabled=false;updateRegistrationCategory();}
});

byId('save-confirmation').addEventListener('click',()=>{
  const content=`PDCAT 2026 registration receipt / 注册回执\nRegistration ID / 注册编号: ${saved.id}\nRegistration email / 登记邮箱: ${saved.email}\nQuery page / 查询页面: https://pdcat2026.github.io/pdcatconf-site/2026/registration-query.html\nReceived; payment awaits review / 已收到，付款待审核\n`;
  const url=URL.createObjectURL(new Blob([content],{type:'text/plain;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download=saved.id+'.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
byId('new-registration').addEventListener('click',()=>{
  saved=null;queryCode='';registrationForm.reset();fields.disabled=false;receipt.setCustomValidity('');updateRegistrationCategory();formStatus.textContent='';byId('submission-result').hidden=true;
  try{sessionStorage.removeItem('pdcat2026-pending-code');}catch(_){}
});
fields.disabled=false;
updateRegistrationCategory();
