const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const elements={};
function element(id){return elements[id]||=( {value:'',files:[],disabled:id==='registration-fields',handlers:{},addEventListener(event,fn){this.handlers[event]=fn;},setCustomValidity(s){this.validationMessage=s;}} );}
vm.runInNewContext(fs.readFileSync(path.join(root,'2026/js/registration-form.js'),'utf8'),{document:{getElementById:element},sessionStorage:{getItem(){return null;}}});
assert.equal(element('registration-fields').disabled,false);
for(const [value,author]of [['author',true],['attendee',false]]){element('category').value=value;element('category').handlers.change();assert.equal(element('paper-id').required,author);assert.equal(element('paper-title').required,author);assert.equal(element('extra-pages').disabled,!author);}
for(const [name,size,valid]of [['x.PDF',10*1024*1024,true],['x.jpg',0,false],['x.png',10*1024*1024+1,false],['x.exe',100,false],['x.jpg',100,true]]){element('receipt').files=[{name,size}];element('receipt').handlers.change();assert.equal(element('receipt').validationMessage==='',valid);}
element('receipt').files=[];element('receipt').handlers.change();assert.equal(element('receipt').validationMessage,'');
const html=fs.readFileSync(path.join(root,'2026/registration-form.html'),'utf8');
assert.match(html,/id="registration-fields" disabled/);assert.match(html,/name="consent"[^>]*required/);assert.match(html,/id="query-code"[^>]*type="password"/);assert.doesNotMatch(html,/Preview only/);
console.log('PASS: category requirements, upload limits, consent, query privacy and no-JS guard');
