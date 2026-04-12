// ═══════════════════════════════════════════════
// יומן משימות — Service Worker v2.0
// Handles: offline caching, background sync, push notifications
// ═══════════════════════════════════════════════

const CACHE_NAME = 'yoman-v2';
const ASSETS = ['./', './index.html', './manifest.json'];

// ── Install: cache all assets ──────────────────
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// ── Activate: clean old caches ─────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch: serve from cache, fallback to network ──
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return res;
      });
      return cached || network;
    })
  );
});

// ── Push Notifications ─────────────────────────
self.addEventListener('push', e => {
  const data = e.data?.json() || {};
  e.waitUntil(
    self.registration.showNotification(data.title || 'יומן משימות', {
      body: data.body || '',
      icon: './icons/icon-192.png',
      badge: './icons/icon-72.png',
      tag: data.tag || 'yoman',
      data: data,
      requireInteraction: true,
      actions: [
        { action: 'done', title: '✓ בוצע' },
        { action: 'snooze', title: '⏰ +10 דק' }
      ]
    })
  );
});

// ── Notification click handler ─────────────────
self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'snooze') {
    const task = e.notification.data;
    if (task) {
      // Send snooze message to all clients
      self.clients.matchAll().then(clients => {
        clients.forEach(c => c.postMessage({ type: 'SNOOZE', task }));
      });
    }
    return;
  }
  if (e.action === 'done') {
    const task = e.notification.data;
    self.clients.matchAll().then(clients => {
      clients.forEach(c => c.postMessage({ type: 'MARK_DONE', taskId: task?.id }));
    });
    return;
  }
  // Default: focus app
  e.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      if (clients.length) return clients[0].focus();
      return self.clients.openWindow('./');
    })
  );
});

// ── Background Sync (for deferred saves) ──────
self.addEventListener('sync', e => {
  if (e.tag === 'sync-tasks') {
    e.waitUntil(syncTasks());
  }
});

async function syncTasks() {
  // In a real app, this would sync to a server
  // Here we just ensure local storage is consistent
  console.log('[SW] Background sync triggered');
}

// ── Periodic Background Sync (alarm checks) ───
// This fires even when the app is closed on supported Android browsers
self.addEventListener('periodicsync', e => {
  if (e.tag === 'check-alarms') {
    e.waitUntil(checkAlarms());
  }
});

async function checkAlarms() {
  const cache = await caches.open(CACHE_NAME);
  // Try to get tasks from IndexedDB via a message to clients
  const clients = await self.clients.matchAll();
  if (clients.length > 0) {
    // App is open, let it handle alarms
    return;
  }
  
  // App is closed — check IndexedDB directly
  try {
    const db = await openDB();
    const tasks = await getAllTasks(db);
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${h}:${m}`;
    const todayStr = formatDate(now);

    for (const task of tasks) {
      if (task.done || !task.time || task.date !== todayStr) continue;
      if (task.time === currentTime) {
        await self.registration.showNotification('⏰ ' + task.title, {
          body: `${task.time} — הגיע הזמן!`,
          icon: './icons/icon-192.png',
          badge: './icons/icon-72.png',
          tag: `alarm-${task.id}`,
          data: task,
          requireInteraction: true,
          actions: [
            { action: 'done', title: '✓ בוצע' },
            { action: 'snooze', title: '⏰ +10 דק' }
          ]
        });
      }
    }
  } catch(err) {
    console.warn('[SW] Alarm check failed:', err);
  }
}

// ── IndexedDB helpers ──────────────────────────
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('YomanDB', 1);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('tasks')) {
        db.createObjectStore('tasks', { keyPath: 'id' });
      }
    };
    req.onsuccess = e => resolve(e.target.result);
    req.onerror = () => reject(req.error);
  });
}

function getAllTasks(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('tasks', 'readonly');
    const req = tx.objectStore('tasks').getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
