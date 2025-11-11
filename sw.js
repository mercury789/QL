self.addEventListener("install", () => self.skipWaiting())
self.addEventListener("activate", () => self.clients.claim())

const local = false


self.addEventListener("notificationclick", event => {

   event.notification.close();

   if (local) {

      event.waitUntil(
         clients.openWindow('http://127.0.0.1:5501/') 
      )

   } else {

      event.waitUntil(
         clients.openWindow('https://mercury789.github.io/ql/') 
      )

   }

   
})


