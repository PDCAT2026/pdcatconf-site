'use strict';

const API_BASE = 'https://101.37.245.203';
const registrationForm = document.getElementById('registration-form');
const category = document.getElementById('category');
const receipt = document.getElementById('receipt');
const formStatus = document.getElementById('form-status');
const fields = document.getElementById('registration-fields');
const queryStatus = document.getElementById('query-status');
const byId = id => document.getElementById(id);
const statusLabels = {pending:'Pending review / 待审核',confirmed:'Confirmed / 已确认',needs_info:'More information needed / 需补充材料'};
const fieldLabels = {full_name:'Name / 姓名',email:'Email / 邮箱',affiliation:'Affiliation / 单位',country_region:'Country / 国家或地区',phone:'Phone / 电话',category:'Category / 类别',paper_id:'Paper ID / 论文编号',paper_title:'Paper title / 论文题目',extra_pages:'Extra pages / 超页数',payment_method:'Payment method / 付款方式',payer:'Payer / 付款人',amount_rmb:'Amount paid (RMB) / 实付金额',payment_date:'Payment date / 付款日期',transaction_reference:'Transaction reference / 交易流水号',invoice_title:'Invoice title / 发票抬头',tax_id:'Tax ID / 税号',notes:'Notes / 备注'};
let queryCode = '', saved = null;
try { queryCode=sessionStorage.getItem('pdcat2026-pending-code')||''; } catch (_) { /* Storage is optional; the code is also shown before upload. */ }

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
  byId('pending-code').textContent=queryCode;byId('recovery-notice').hidden=false;
  const body=new FormData(registrationForm);body.set('query_code',queryCode);
  fields.disabled=true;formStatus.textContent='Submitting… / 正在提交…';
  try{
    saved=await request('/api/registrations',body);
    byId('saved-id').textContent=saved.id;byId('saved-code').textContent=saved.query_code;
    byId('query-id').value=saved.id;byId('query-code').value=saved.query_code;
    byId('submission-result').hidden=false;byId('recovery-notice').hidden=true;
    formStatus.textContent=saved.message;
    try{sessionStorage.removeItem('pdcat2026-pending-code');}catch(_){}
    byId('submission-result').scrollIntoView({behavior:'smooth',block:'center'});
  }catch(error){formStatus.textContent=error.message;fields.disabled=false;updateRegistrationCategory();if(error.registrationId){byId('query-id').value=error.registrationId;byId('query-code').value=queryCode;}}
});

byId('save-confirmation').addEventListener('click',()=>{
  const content=`PDCAT 2026 registration receipt / 注册回执\nRegistration ID / 注册编号: ${saved.id}\nQuery code / 查询码: ${saved.query_code}\nQuery page / 查询页面: https://pdcat2026.github.io/pdcatconf-site/2026/registration-form.html\nReceived; payment awaits review / 已收到，付款待审核\nKeep the query code private / 请妥善保管查询码，不要转发。\n`;
  const url=URL.createObjectURL(new Blob([content],{type:'text/plain;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download=saved.id+'.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
byId('new-registration').addEventListener('click',()=>{
  saved=null;queryCode='';registrationForm.reset();fields.disabled=false;receipt.setCustomValidity('');updateRegistrationCategory();formStatus.textContent='';byId('submission-result').hidden=true;byId('recovery-notice').hidden=true;
  try{sessionStorage.removeItem('pdcat2026-pending-code');}catch(_){}
});
byId('query-form').addEventListener('submit',async event=>{
  event.preventDefault();const button=byId('query-button');button.disabled=true;queryStatus.textContent='Loading… / 正在查询…';byId('query-result').replaceChildren();
  try{
    const data=await request('/api/query',{id:byId('query-id').value.trim(),query_code:byId('query-code').value.trim()},true);
    const add=(label,value)=>{const row=document.createElement('div');row.className='result-row';const key=document.createElement('strong');key.textContent=label;const val=document.createElement('span');val.textContent=value||'—';row.append(key,val);byId('query-result').append(row);};
    add('Status / 审核状态',statusLabels[data.status]);add('Review note / 审核说明',data.review_note);add('Amount due (RMB) / 应付金额',(data.expected_cents/100).toFixed(2));
    for(const [key,label]of Object.entries(fieldLabels))add(label,data.fields[key]);
    queryStatus.textContent='Record found / 已找到登记信息';
  }catch(error){queryStatus.textContent=error.message;}finally{button.disabled=false;}
});

fields.disabled=false;
updateRegistrationCategory();
