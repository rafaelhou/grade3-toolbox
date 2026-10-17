/* 離線快取：有網路時一律先抓最新版（略過瀏覽器的 HTTP 快取），順便存一份；
   沒網路或 4 秒內沒回應，才拿存著的那份。所以推上新版後，下次打開就是新版。
   要整個清掉舊快取時才把 CACHE 的版本號加一。 */
const CACHE = 'diet-v2';
const ASSETS = ['./', 'style.css', 'app.js', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => c.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('diet-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

const timeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const font = /(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (url.origin !== location.origin && !font) return;
  const nav = req.mode === 'navigate';
  const key = nav ? './' : req;

  if (font) {
    // 字型不會變，有存就直接用
    e.respondWith(caches.open(CACHE).then(async c => (await c.match(req)) || fetch(req).then(r => { c.put(req, r.clone()); return r; })));
    return;
  }
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    try {
      const r = await timeout(fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }), 4000);
      if (r.redirected) return nav ? Response.redirect(r.url, 302) : r;
      if (r.ok) c.put(key, r.clone());
      return r;
    } catch (err) {
      return (await c.match(key, { ignoreSearch: true })) || Response.error();
    }
  })());
});
