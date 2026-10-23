/* Omega Service: guarda o app no aparelho para abrir sem internet. O Supabase (dados, login e fotos) nunca passa por aqui. */
const C='omega-v1',SHELL=['./','./omega-service.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>Promise.all(SHELL.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==C).map(n=>caches.delete(n)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 const r=e.request,u=new URL(r.url);
 if(r.method!=='GET'||!u.protocol.startsWith('http')||u.hostname.endsWith('.supabase.co'))return;
 if(r.mode==='navigate'){ /* página: rede primeiro (pega versão nova), cópia guardada se estiver sem internet */
  e.respondWith(fetch(r).then(x=>{if(x.ok){const cp=x.clone();caches.open(C).then(c=>c.put(r,cp))}return x}).catch(()=>caches.match(r).then(m=>m||caches.match('./omega-service.html'))));return}
 /* demais arquivos (ícones, fontes, supabase-js): usa a cópia e atualiza em segundo plano */
 e.respondWith(caches.match(r).then(m=>{const net=fetch(r).then(x=>{if(x&&(x.ok||x.type==='opaque')){const cp=x.clone();caches.open(C).then(c=>c.put(r,cp))}return x}).catch(()=>m);return m||net}))});
