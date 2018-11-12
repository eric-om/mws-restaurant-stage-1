// referenced https://developers.google.com/web/ilt/pwa/lab-caching-files-with-service-worker

const filesToCache = [
  '/index.html',
  '/restaurant.html',
  '/css/styles.css',
  '/js/db_helper.js',
  '/js/main.js',
  '/js/restaurant_info.js',
  '/js/dbpromise.js',
  '/data/restaurants.json',
  '/img/1.jpg',
  '/img/2.jpg',
  '/img/3.jpg',
  '/img/4.jpg',
  '/img/5.jpg',
  '/img/6.jpg',
  '/img/7.jpg',
  '/img/8.jpg',
  '/img/9.jpg',
  '/img/10.jpg'
];

const staticCacheName = 'pages-cache-v1';

self.addEventListener('install', event => {
  console.log('Attempting to install service worker and cache static assets');
  event.waitUntil(
    caches.open(staticCacheName)
    .then(cache => {
      console.log('Adding files to cache');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('fetch', function (event) {
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request).then(function (cache_response) {
        return cache_response || fetch(event.request).then(function (response) {
          if(response.status === 200) {
            caches.open(staticCacheName).then(function (cache) {
              cache.put(event.request, response.clone());
            });
          }
          return response;
        });
      })
    );
  }
});
