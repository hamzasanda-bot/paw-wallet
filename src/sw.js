import { precacheAndRoute } from 'workbox-precaching'

// vite-plugin-pwa bu satırı build sırasında otomatik doldurur
precacheAndRoute(self.__WB_MANIFEST)

// --- Push bildirimi geldiğinde ---
self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { title: 'Paw Wallet', body: event.data ? event.data.text() : '' }
  }

  const title = data.title || 'Paw Wallet'
  const options = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { url: data.url || '/' },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// --- Bildirime tıklanınca uygulamayı aç ve ilgili sayfaya götür ---
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  const targetUrl = new URL(url, self.location.origin).href

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          await client.focus()
          if ('navigate' in client) {
            try {
              await client.navigate(targetUrl)
            } catch {
              /* bazı tarayıcılar navigate'i desteklemeyebilir, focus yeterli */
            }
          }
          return
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl)
    })
  )
})

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))
