
var CACHE_NAME = 'Neighbourhood-map-cache-v1';
// Adding all files to cache array needed for the website to function
var urlsToCache = [
  '/',
  '/src/App.css',
  '/src/App.js',
  '/src/App.test.js',
  '/src/index.css',
  '/src/index.js',
  '/src/InfoWindow.js',
  'src/logo.svg'
];

// When the service worker is installed after registration, open cache and add all resources to it.
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

//Handle fetch event by servicing the request and adding the response to the cache.

self.addEventListener('fetch', function(event) {
  console.log('WORKER: fetch event in progress.');
  if (event.request.method !== 'GET') {
    console.log('WORKER: fetch event ignored.', event.request.method, event.request.url);
    return;
  }

  // Intercepting Google API calls and cacheing them .

  if (event.request.url.indexOf('https://maps.googleapis.com/maps/api/js') == 0) {
    fetch(event.request).then(function(response) {
      var cacheCopy = response.clone();
      console.log('WORKER: fetch response from network for google api', event.request.url);
      caches.open(CACHE_NAME).then(function add(cache) {
      }).then(function() {
        console.log('WORKER: fetch response stored in cache for google api.', event.request.url);
      });
      return response;
    })
  }

  event.respondWith(
    caches.match(event.request).then(function(cached) {
      // Perform a fetch and if successful call fetchedFromNetwork function to perform
      // caching, if caching/fetch fails call unableToResolve function to alert user.

      var networked = fetch(event.request).then(fetchedFromNetwork, unableToResolve)
                        .catch(unableToResolve);
      console.log('WORKER: fetch event', cached ? '(cached)' : '(network)', event.request.url);
      return cached || networked;

      function fetchedFromNetwork(response) {
        // Adding a copy of the response to the cache

        var cacheCopy = response.clone();
        console.log('WORKER: fetch response from network.', event.request.url);

        // Open cache and add the request response pair

        caches.open(CACHE_NAME).then(function add(cache) {
          cache.put(event.request, cacheCopy);
        }).then(function() {
          console.log('WORKER: fetch response stored in cache.', event.request.url);
        });
        return response;
      }

      // Fetch and updatiopn to cache failed. Return a response object with appropriate text message

      function unableToResolve () {
        console.log('WORKER: fetch request failed in both cache and network.');
        return new Response('<h1>Service Unavailable</h1>', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/html'
          })
        });
      }
    })
  )
});
