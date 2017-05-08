self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Received.');
  console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);
  const data = event.data.json();
  console.log(event.data.json());

  const title = data.title;
  const options = {
    body : data.body,
    icon: data.icon,
    data: {
      link_to: data.link
    }
  }
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click Received.');
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.link_to)
  );
});


