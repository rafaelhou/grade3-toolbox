/* 離線快取：先拿快取的版本秒開，同時在背景抓新版存起來，下次打開就是新版。
   改了檔案不用動這裡；要整個清掉舊快取才把 CACHE 的版本號加一。 */
const CACHE = 'diet-v1';
const ASSETS = ['./', 'style.css', 'app.js', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('diet-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const font = /(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (url.origin !== location.origin && !font) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const key = req.mode === 'navigate' ? './' : req;
    const hit = await c.match(key, { ignoreSearch: true });
    const net = fetch(req).then(r => {
      if ((r.ok && !r.redirected) || r.type === 'opaque') c.put(key, r.clone());
      return r;
    }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    return (await net) || Response.error();
  }));
});
