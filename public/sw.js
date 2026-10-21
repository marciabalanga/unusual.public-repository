// Wearing Unusual - Official Push Service Worker
// Compatible with Apple Safari (iOS 16.4+ Web Push PWA) & Modern Browsers

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let payload = {
    title: 'Wearing Unusual • Nova Encomenda',
    body: 'Foi registada uma nova encomenda na loja.',
    url: '/admin',
  };

  if (event.data) {
    try {
      const data = event.data.json();
      if (data && typeof data === 'object') {
        payload = {
          title: data.title || payload.title,
          body: data.body || payload.body,
          url: data.url || payload.url,
        };
      }
    } catch {
      const text = event.data.text();
      if (text) {
        payload.body = text;
      }
    }
  }

  const options = {
    body: payload.body,
    icon: '/apple-touch-icon.png',
    badge: '/brand-favicon.png',
    vibrate: [200, 100, 200],
    tag: payload.tag || ('wu-alert-' + Date.now()),
    renotify: true,
    data: {
      url: payload.url || '/admin',
      dateOfArrival: Date.now(),
    },
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) || '/admin';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open with the admin panel, notify it, navigate and focus
      for (const client of clientList) {
        if (client.url && client.url.includes('/admin')) {
          if ('postMessage' in client) {
            client.postMessage({
              type: 'WU_NAVIGATE_ADMIN',
              url: targetUrl,
            });
          }
          if ('navigate' in client && targetUrl) {
            try {
              client.navigate(targetUrl);
            } catch {}
          }
          if ('focus' in client) {
            return client.focus();
          }
        }
      }
      // Otherwise open a new window pointing to targetUrl
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
