// 같이보기 서비스워커 — 앱 셸만 캐시. supabase·실시간 통신은 전혀 손대지 않음
const CACHE = 'share-v1';
const SHELL = ['/share/', '/share/index.html', '/share/manifest.json', '/share/questions.json', '/share/icon-192.png', '/share/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('share-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || !u.pathname.startsWith('/share/')) return;
  // 네트워크 우선, 실패하면 캐시 (항상 최신 index.html 을 받기 위함)
  e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); return r; }).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
