// ============================================================
// יומן משימות — Service Worker
// גרסה 1.0 — אופליין + התראות ברקע
// ============================================================

const CACHE_NAME = 'yoman-v1';

// Assets to cache for offline use
const CACHE_ASSETS = [
  './',
  './יומן-משימות.html',
  'https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800;900&family=Frank+Ruhl+Libre:wght@300;400;500;700;900&display=swap'
];

// ============================================================
// INSTALL — cache assets
// ============================================================
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CACHE_ASSETS).catch(() => {
        // Silently ignore failed cache entries (e.g. fonts need network)
        return cache.add('./יומן-משימות.html');
      });
    })
  );
  self.skipWaiting();
});

// ============================================================
// ACTIVATE — clean old caches
// ============================================================
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ============================================================
// FETCH — serve from cache, fall back to network
// ============================================================
self.addEventListener('fetch', event => {
  // Skip non-GET and chrome-extension requests
  if (event.request.method !== 'GET') return;
  if (event.request.url.startsWith('chrome-extension')) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Cache successful responses
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // If offline and not cached, return the main HTML
        if (event.request.destination === 'document') {
          return caches.match('./יומן-משימות.html');
        }
      });
    })
  );
});

// ============================================================
// MESSAGES — receive alarm schedule from app
// ============================================================
let scheduledAlarms = []; // { taskId, title, time, date, alarmKey }
let alarmCheckInterval = null;

self.addEventListener('message', event => {
  if (event.data?.type === 'SCHEDULE_ALARMS') {
    const { tasks, date } = event.data;
    scheduledAlarms = tasks.map(t => ({
      taskId: t.id,
      title: t.title,
      time: t.time,
      date: t.date,
      alarmKey: `${t.id}-${date}-${t.time}`
    }));

    // Start checking every minute
    if (alarmCheckInterval) clearInterval(alarmCheckInterval);
    alarmCheckInterval = setInterval(checkAlarms, 60000);
    checkAlarms(); // check immediately
  }
});

// ============================================================
// ALARM CHECK — runs every minute in SW
// ============================================================
const firedAlarms = new Set();

function checkAlarms() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const currentTime = `${h}:${m}`;
  const todayStr = toDateStr(now);

  scheduledAlarms.forEach(alarm => {
    if (alarm.date !== todayStr) return;
    if (alarm.time !== currentTime) return;
    if (firedAlarms.has(alarm.alarmKey)) return;

    firedAlarms.add(alarm.alarmKey);
    fireNotification(alarm);
  });
}

function fireNotification(alarm) {
  self.registration.showNotification('⏰ ' + alarm.title, {
    body: `${alarm.time} — הגיע הזמן!`,
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%23a07828"/><text y="72" x="50" text-anchor="middle" font-size="60">✦</text></svg>',
    badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%23a07828"/><text y="72" x="50" text-anchor="middle" font-size="60">✦</text></svg>',
    tag: alarm.alarmKey,
    renotify: true,
    requireInteraction: true,
    dir: 'rtl',
    lang: 'he',
    vibrate: [200, 100, 200],
    actions: [
      { action: 'open', title: 'פתח יומן' },
      { action: 'dismiss', title: 'סגור' }
    ]
  });
}

// ============================================================
// NOTIFICATION CLICK — open app
// ============================================================
self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      for (const client of clients) {
        if ('focus' in client) return client.focus();
      }
      return self.clients.openWindow('./יומן-משימות.html');
    })
  );
});

// ============================================================
// HELPER
// ============================================================
function toDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
