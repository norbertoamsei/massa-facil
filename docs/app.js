'use strict';
const {calculate,displayFormula,formatNumber:fmt}=window.Chemistry;
const $=id=>document.getElementById(id);
const input=$('formula');
let result=calculate('H2O'), precision=3, history=[], installPrompt=null;
function toggleResult(show){$('result-area').hidden=!show;$('empty').hidden=show;}
function message(id,text){$(id).textContent=text;$(id).hidden=!text;}
function edit(){const a=input.selectionStart,b=input.selectionEnd;input.value=displayFormula(input.value);input.setSelectionRange(a,b);result=null;toggleResult(false);message('error','');message('notice','');}
function render(){
 if(!result)return;toggleResult(true);
 $('pretty-formula').textContent=result.pretty;$('mass').textContent=fmt(result.mass,precision);$('molar').textContent=fmt(result.mass,precision)+' g/mol';$('total').textContent=fmt(result.mass,precision)+' u';
 $('atom-count').textContent=`${result.rows.length} elementos · ${result.atomCount} átomos por unidade de fórmula`;
 $('rows').replaceChildren();
 for(const r of result.rows){
  const row=document.createElement('div');row.className='element-row';
  const symbol=document.createElement('div');symbol.className='symbol';symbol.textContent=r.symbol;
  const info=document.createElement('div');info.className='element-info';
  const name=document.createElement('div');name.className='element-name';name.textContent=r.name;
  const calc=document.createElement('p');calc.className='calculation';calc.textContent=`${r.count} × ${fmt(r.mass,4)} u`;
  const track=document.createElement('div');track.className='track';track.setAttribute('aria-hidden','true');const bar=document.createElement('div');bar.className='bar';bar.style.width=r.percentage+'%';track.append(bar);info.append(name,calc,track);
  const contribution=document.createElement('div');contribution.className='contribution';const amount=document.createElement('strong');amount.textContent=fmt(r.contribution,precision)+' u';const percentage=document.createElement('span');percentage.className='percentage';percentage.textContent=fmt(r.percentage,2)+'%';contribution.append(amount,percentage);row.append(symbol,info,contribution);$('rows').append(row);
 }
}
function calculateVisible(value=input.value,remember=true){
 input.value=displayFormula(value);message('error','');message('notice','');
 try{result=calculate(value);render();if(remember){history=[result.formula,...history.filter(x=>x!==result.formula)].slice(0,6);renderHistory();}return result;}
 catch(e){result=null;toggleResult(false);message('error',e.message);return null;}
}
function chip(formula){const b=document.createElement('button');b.type='button';b.textContent=displayFormula(formula);b.addEventListener('click',()=>calculateVisible(formula));return b;}
function renderHistory(){ $('history').replaceChildren(...history.map(chip));$('history-section').hidden=!history.length; }
$('examples').append(...['H2O','CO2','NaCl','Ca(OH)2','C6H12O6','CuSO4·5H2O'].map(chip));
input.addEventListener('input',edit);
$('calculator').addEventListener('submit',e=>{e.preventDefault();calculateVisible();input.blur();});
$('clear').addEventListener('click',()=>{input.value='';edit();input.focus();});
document.querySelectorAll('[data-insert]').forEach(b=>b.addEventListener('click',()=>{const start=input.selectionStart??input.value.length,end=input.selectionEnd??start;input.value=input.value.slice(0,start)+b.dataset.insert+input.value.slice(end);input.focus();input.setSelectionRange(start+1,start+1);edit();}));
document.querySelectorAll('[data-precision]').forEach(b=>b.addEventListener('click',()=>{precision=Number(b.dataset.precision);document.querySelectorAll('[data-precision]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));render();}));
$('clear-history').addEventListener('click',()=>{history=[];renderHistory();});
$('help-button').addEventListener('click',()=>{$('help').hidden=!$('help').hidden;$('help-button').setAttribute('aria-expanded',String(!$('help').hidden));if(!$('help').hidden)$('help').scrollIntoView({behavior:'auto',block:'start'});});
$('share').addEventListener('click',async()=>{
 if(!result)return;
 const text=`${result.pretty}\nMassa molecular / da unidade de fórmula: ${fmt(result.mass,precision)} u\nMassa molar: ${fmt(result.mass,precision)} g/mol\n\n${result.rows.map(r=>`${r.symbol}: ${r.count} × ${fmt(r.mass,4)} = ${fmt(r.contribution,precision)} u (${fmt(r.percentage,2)}%)`).join('\n')}\n\nMassa Fácil · CIAAW 2024 · valores aproximados.`;
 try{
  if(navigator.share){await navigator.share({title:'Massa Fácil',text});return;}
  let copied=false;
  if(navigator.clipboard){try{await navigator.clipboard.writeText(text);copied=true;}catch{}}
  if(!copied){const area=document.createElement('textarea');area.value=text;area.style.position='fixed';area.style.opacity='0';document.body.append(area);area.select();copied=document.execCommand('copy');area.remove();}
  message('notice',copied?'Resultado copiado. Cole onde desejar.':'Não foi possível copiar. Use o compartilhamento do navegador.');
 }catch(e){if(e.name!=='AbortError')message('notice','Não foi possível compartilhar. Tente novamente.');}
});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;});
$('install-button').addEventListener('click',async()=>{
 if(installPrompt){const prompt=installPrompt;installPrompt=null;try{await prompt.prompt();await prompt.userChoice;}catch{$('install-guide').hidden=false;}}
 else $('install-guide').hidden=!$('install-guide').hidden;
});
$('close-install').addEventListener('click',()=>{$('install-guide').hidden=true;});
function installed(){return matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;}
if(installed())$('install-button').hidden=true;
window.addEventListener('appinstalled',()=>{$('install-button').hidden=true;$('install-guide').hidden=true;});
$('update-button').addEventListener('click',()=>location.reload());
async function prepareOffline(){
 if(!('serviceWorker' in navigator)){message('offline-status','Use um navegador atualizado para ativar o modo offline.');return;}
 try{
  const alreadyControlled=!!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{
   if(alreadyControlled){$('update-button').hidden=false;message('offline-status','Nova versão disponível. Toque em Atualizar aplicativo.');}
  });
  const registration=await navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'});
  const ready=await Promise.race([navigator.serviceWorker.ready,new Promise(resolve=>setTimeout(()=>resolve(null),10000))]);
  if(!ready?.active)throw new Error('Modo offline ainda indisponível');
  const channel=new MessageChannel();
  const state=await new Promise(resolve=>{const timer=setTimeout(()=>resolve(false),6000);channel.port1.onmessage=e=>{clearTimeout(timer);resolve(e.data?.offlineReady===true);};ready.active.postMessage({type:'CHECK_OFFLINE'},[channel.port2]);});
  message('offline-status',state?'Pronto para usar offline':'Conecte-se à internet e reabra para preparar o modo offline.');
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&navigator.onLine)void registration.update().catch(()=>{});});
  void registration.update().catch(()=>{});
  registration.addEventListener('updatefound',()=>{const worker=registration.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='activated'&&!alreadyControlled)message('offline-status','Pronto para usar offline');});});
 }catch{message('offline-status','O cálculo funciona. Reabra com internet para preparar o modo offline.');}
}
render();void prepareOffline();
const webContext=document.modelContext;
if(webContext?.registerTool){
 try{void Promise.resolve(webContext.registerTool({name:'calculate_formula_mass',title:'Calcular massa pela fórmula',description:'Calcula a fórmula e atualiza o resultado visível e o histórico desta sessão.',inputSchema:{type:'object',properties:{formula:{type:'string',maxLength:300}},required:['formula'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(data){if(!data||typeof data.formula!=='string'||Object.keys(data).some(k=>k!=='formula'))throw new Error('Informe apenas formula como texto.');const r=calculateVisible(data.formula);if(!r)throw new Error($('error').textContent);return {formula:r.pretty,mass_u:r.mass,molar_mass_g_mol:r.mass,elements:r.rows.map(x=>({symbol:x.symbol,count:x.count,mass_percentage:x.percentage}))};}})).catch(()=>{});}catch{}
}
