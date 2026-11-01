// Daiippo Nihongo — service worker: aplikasi tetap bisa dibuka tanpa internet.
// Naikkan angka VERSI setiap kali index.html diperbarui agar pengguna mendapat versi baru.
const VERSI='daiippo-v2';
const INTI=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./apple-touch-icon.png','./favicon-48.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSI).then(c=>c.addAll(INTI)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSI).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  const font=url.hostname==='fonts.googleapis.com'||url.hostname==='fonts.gstatic.com';
  if(url.origin!==location.origin&&!font)return; // analitik dan situs lain tidak disimpan
  // Ambil dari cache dulu (cepat & offline), sambil memperbarui cache di belakang layar
  e.respondWith(caches.open(VERSI).then(async c=>{
    const hit=await c.match(req,{ignoreSearch:url.origin===location.origin});
    const net=fetch(req).then(r=>{if(r&&(r.ok||r.type==='opaque'))c.put(req,r.clone());return r;}).catch(()=>hit||(req.mode==='navigate'?c.match('./index.html'):undefined));
    return hit||net;
  }));
});
