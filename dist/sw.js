// ============================================================
// Anime Black V7 - Production PWA Service Worker (طبقات كاش مكتوبة يدوياً — بدون Workbox)
// ============================================================
const CACHE_VERSION = 'anime-black-v7.2-syncfix';
const STATIC_CACHE_NAME = `static-${CACHE_VERSION}`;
const MEDIA_CACHE_NAME = `media-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/apple-touch-icon.png',
  '/icon.svg',
  '/rtm.js',
  '/dist/anime-black-core.js',
  '/dist/anime-black-core.umd.cjs'
];

// Install Event - Pre-cache essential offline shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Offline pre-cache note:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up stale cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== STATIC_CACHE_NAME && key !== MEDIA_CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Safe layered routing
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // CRITICAL SECURITY RULE: NEVER cache private authenticated queries, Firebase Auth, Firestore writes, or live API endpoints
  if (
    req.method !== 'GET' ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('firebaseapp.com') ||
    url.hostname.includes('identitytoolkit') ||
    url.hostname.includes('securetoken') ||
    url.pathname.startsWith('/api/')
  ) {
    return;
  }

  // 1. Navigation / Document requests -> Network First with offline fallback
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const resClone = networkRes.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return networkRes;
        })
        .catch(() => caches.match('/index.html') || caches.match('/'))
    );
    return;
  }

  // 2. Static Assets (JS, CSS, SVGs, Fonts) -> Stale-While-Revalidate
  if (url.pathname.match(/\.(js|css|svg|woff2?|ttf|png|jpg|webp)$/i)) {
    event.respondWith(
      caches.match(req).then((cachedRes) => {
        const fetchPromise = fetch(req).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const resClone = networkRes.clone();
            const targetCache = url.pathname.match(/\.(png|jpg|webp)$/i) ? MEDIA_CACHE_NAME : STATIC_CACHE_NAME;
            caches.open(targetCache).then((cache) => cache.put(req, resClone));
          }
          return networkRes;
        }).catch(() => null);

        return cachedRes || fetchPromise;
      })
    );
    return;
  }
});

// Push Notifications Handling (FCM & Web Push)
self.addEventListener('push', (event) => {
  let data = { title: 'أنمي بلاك', body: 'لديك تنبيه جديد في أنمي بلاك' };
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    if (event.data) data.body = event.data.text();
  }

  const options = {
    body: data.body || 'لديك رسالة أو تفاعل جديد',
    icon: data.icon || '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    vibrate: [100, 50, 100],
    data: data.data || { url: '/' },
    dir: 'rtl',
    lang: 'ar',
    tag: data.tag || `ab-push-${Date.now()}`,
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'أنمي بلاك', options)
  );
});

// Notification Click Event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          client.postMessage({ type: 'NOTIFICATION_CLICKED', data: event.notification.data });
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Message Event from Client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
