const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const origin='https://test.invalid', handlers={},stored=new Map(),deleted=[];
const cache={async addAll(paths){for(const p of paths){const f=p==='./'?'docs/index.html':'docs/'+p.slice(2);assert.ok(fs.existsSync(f),`Falta ${f}`);stored.set(new URL(p,origin+'/').href,{ok:true,file:f});}},async match(request){return stored.get(new URL(typeof request==='string'?request:request.url,origin+'/').href.split('?')[0]);}};
const context={URL,caches:{async open(){return cache;},async keys(){return ['massa-facil-v0','massa-facil-v1','outra-aplicacao'];},async delete(n){deleted.push(n);}},self:{location:{origin},clients:{async claim(){}},async skipWaiting(){},addEventListener(n,fn){handlers[n]=fn;}},fetch:async()=>{throw Error('Rede indisponível');}};
vm.runInNewContext(fs.readFileSync('docs/sw.js','utf8'),context);
(async()=>{
 let pending;handlers.install({waitUntil:p=>pending=p});await pending;
 handlers.activate({waitUntil:p=>pending=p});await pending;assert.deepEqual(deleted,['massa-facil-v0']);
 for(const [path,mode] of [['/','navigate'],['/index.html','navigate'],['/app.js','cors'],['/styles.css','cors'],['/qualquer-rota','navigate']]){let response;handlers.fetch({request:{url:origin+path,method:'GET',mode},respondWith:p=>response=p});assert.ok((await response).ok,`Offline: ${path}`);}
 let ready;handlers.message({data:{type:'CHECK_OFFLINE'},ports:[{postMessage:data=>ready=data.offlineReady}],waitUntil:p=>pending=p});await pending;assert.equal(ready,true);
 const m=JSON.parse(fs.readFileSync('docs/manifest.webmanifest','utf8'));assert.equal(m.display,'standalone');assert.equal(m.scope,'./');for(const icon of m.icons)assert.ok(fs.existsSync('docs/'+icon.src.slice(2)));
 for(const f of ['app.js','chemistry.js'])new vm.Script(fs.readFileSync('docs/'+f,'utf8'));
 console.log('Modo offline: 10 arquivos disponíveis, navegação e recursos sem rede, limpeza de cache antigo e manifesto válidos.');
})().catch(e=>{console.error(e);process.exitCode=1;});
