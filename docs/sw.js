'use strict';
const CACHE='massa-facil-v1';
const ASSETS=['./','./index.html','./styles.css','./chemistry.js','./app.js','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/maskable-512.png','./icons/apple-touch-icon.png'];
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);await cache.addAll(ASSETS);await self.skipWaiting();})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{const names=await caches.keys();await Promise.all(names.filter(name=>name.startsWith('massa-facil-')&&name!==CACHE).map(name=>caches.delete(name)));await self.clients.claim();})()));
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin)return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  const cached=await cache.match(request,{ignoreSearch:true});if(cached)return cached;
  if(request.mode==='navigate')return await cache.match('./index.html');
  return fetch(request);
 })());
});
self.addEventListener('message',event=>{if(event.data?.type!=='CHECK_OFFLINE')return;event.waitUntil((async()=>{const cache=await caches.open(CACHE);const complete=(await Promise.all(ASSETS.map(path=>cache.match(path)))).every(Boolean);event.ports[0]?.postMessage({offlineReady:complete});})());});
