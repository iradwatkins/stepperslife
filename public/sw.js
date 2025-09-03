// SteppersLife Service Worker - Blue-Green Deployment Strategy
// Version: 1.0.0
// Deployment: Blue

const CACHE_VERSION = 'v3.0.0-clerk'; // Updated for Clerk authentication
const DEPLOYMENT_COLOR = 'green'; // Toggle between 'blue' and 'green' for deployments
const CACHE_NAME = `stepperslife-${DEPLOYMENT_COLOR}-${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-${DEPLOYMENT_COLOR}-${CACHE_VERSION}`;

// Critical assets for offline functionality
const OFFLINE_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html'
];

// Cache strategies
const CACHE_STRATEGIES = {
  // Network first, fallback to cache (for API calls and JS files)
  networkFirst: [
    '/api/',
    'convex.cloud',
    '.js',  // JavaScript files should always try network first
    '/_next/'  // Next.js build files
  ],
  // Cache first, fallback to network (for static assets)
  cacheFirst: [
    '/assets/',
    // '.js', // Removed JS caching to prevent stale module issues
    '.css',
    '.png',
    '.jpg',
    '.svg',
    '.woff2'
  ],
  // Network only (for auth and payments)
  networkOnly: [
    '/auth/',
    '/api/webhooks/',
    'square',
    'paypal'
  ]
};

// Install event - pre-cache critical assets
self.addEventListener('install', (event) => {
  console.log(`[SW ${DEPLOYMENT_COLOR}] Installing version ${CACHE_VERSION}`);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log(`[SW ${DEPLOYMENT_COLOR}] Pre-caching offline assets`);
        // Try to cache each asset individually, don't fail if one fails
        return Promise.all(
          OFFLINE_ASSETS.map(url => 
            cache.add(url).catch(err => {
              console.warn(`[SW ${DEPLOYMENT_COLOR}] Failed to cache ${url}:`, err);
            })
          )
        );
      })
      .then(() => {
        // Blue-Green: Skip waiting to activate immediately
        return self.skipWaiting();
      })
      .catch(err => {
        console.error(`[SW ${DEPLOYMENT_COLOR}] Installation failed:`, err);
        // Still skip waiting even if caching fails
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log(`[SW ${DEPLOYMENT_COLOR}] Activating version ${CACHE_VERSION}`);
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => {
            // Delete caches from opposite color deployment
            const oppositeColor = DEPLOYMENT_COLOR === 'blue' ? 'green' : 'blue';
            return cacheName.includes(oppositeColor) || 
                   (cacheName.includes(DEPLOYMENT_COLOR) && !cacheName.includes(CACHE_VERSION));
          })
          .map(cacheName => {
            console.log(`[SW ${DEPLOYMENT_COLOR}] Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          })
      );
    }).then(() => {
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - implement cache strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip chrome-extension and other non-http(s) protocols
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Skip caching for authentication domains and redirects
  if (url.hostname === 'accounts.stepperslife.com' || 
      url.hostname === 'clerk.stepperslife.com' ||
      url.hostname.includes('clerk.accounts.dev') ||
      url.pathname.includes('/sign-in') || 
      url.pathname.includes('/sign-up') ||
      url.pathname.includes('/oauth') ||
      url.pathname.includes('/clerk') ||
      url.pathname.includes('_clerk') ||
      request.headers.get('x-requested-with') === 'XMLHttpRequest') {
    return;
  }

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return event.respondWith(
      fetch(request).catch(error => {
        console.error('[SW] Non-GET request failed:', error);
        return new Response('Service Unavailable', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({ 'Content-Type': 'text/plain' })
        });
      })
    );
  }

  // Determine cache strategy
  const strategy = getStrategy(url.pathname);

  switch (strategy) {
    case 'networkFirst':
      event.respondWith(networkFirst(request));
      break;
    case 'cacheFirst':
      event.respondWith(cacheFirst(request));
      break;
    case 'networkOnly':
      event.respondWith(networkOnly(request));
      break;
    default:
      event.respondWith(networkFirst(request));
  }
});

// Network First Strategy - for API calls
async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses (2xx status codes)
    if (networkResponse.ok || (networkResponse.status >= 200 && networkResponse.status < 300)) {
      cache.put(request, networkResponse.clone());
    }
    
    // For 502/503 errors, try cache first
    if (networkResponse.status === 502 || networkResponse.status === 503) {
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        console.log(`[SW ${DEPLOYMENT_COLOR}] Server error (${networkResponse.status}), serving from cache: ${request.url}`);
        return cachedResponse;
      }
    }
    
    return networkResponse;
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log(`[SW ${DEPLOYMENT_COLOR}] Network error, serving from cache: ${request.url}`);
      return cachedResponse;
    }
    
    // If no cache and it's a navigation request, show offline page
    if (request.mode === 'navigate') {
      const offlinePage = await cache.match('/offline.html');
      if (offlinePage) {
        console.log(`[SW ${DEPLOYMENT_COLOR}] Showing offline page`);
        return offlinePage;
      }
      
      // Create a basic offline response if no offline page cached
      return new Response(
        '<html><body><h1>Connection Error</h1><p>The site is temporarily unavailable. Please check your connection and try again.</p></body></html>',
        {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({ 'Content-Type': 'text/html' })
        }
      );
    }
    
    // For non-navigation requests, return an error response
    console.error(`[SW ${DEPLOYMENT_COLOR}] Failed to fetch and no cache available:`, request.url, error);
    return new Response('Network error occurred', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Cache First Strategy - for static assets
async function cacheFirst(request) {
  const url = new URL(request.url);
  
  // Skip chrome-extension and other non-http(s) protocols
  if (!url.protocol.startsWith('http')) {
    return fetch(request);
  }
  
  const cache = await caches.open(CACHE_NAME);
  
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    // Only cache successful HTTP(S) responses
    if (networkResponse.ok && url.protocol.startsWith('http')) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error(`[SW ${DEPLOYMENT_COLOR}] Fetch failed for: ${request.url}`, error);
    throw error;
  }
}

// Network Only Strategy - for sensitive operations
async function networkOnly(request) {
  return fetch(request);
}

// Determine cache strategy based on URL
function getStrategy(pathname) {
  // Check network only patterns
  for (const pattern of CACHE_STRATEGIES.networkOnly) {
    if (pathname.includes(pattern)) {
      return 'networkOnly';
    }
  }
  
  // Check cache first patterns
  for (const pattern of CACHE_STRATEGIES.cacheFirst) {
    if (pathname.includes(pattern) || pathname.endsWith(pattern)) {
      return 'cacheFirst';
    }
  }
  
  // Check network first patterns
  for (const pattern of CACHE_STRATEGIES.networkFirst) {
    if (pathname.includes(pattern)) {
      return 'networkFirst';
    }
  }
  
  return 'networkFirst'; // Default strategy
}

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log(`[SW ${DEPLOYMENT_COLOR}] Received skip waiting message`);
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: CACHE_VERSION,
      deployment: DEPLOYMENT_COLOR
    });
  }
});

// Background sync for offline check-ins
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-checkins') {
    console.log(`[SW ${DEPLOYMENT_COLOR}] Syncing offline check-ins`);
    event.waitUntil(syncOfflineCheckIns());
  }
});

// Sync offline check-ins when back online
async function syncOfflineCheckIns() {
  const cache = await caches.open('offline-checkins');
  const requests = await cache.keys();
  
  for (const request of requests) {
    try {
      const response = await fetch(request);
      if (response.ok) {
        await cache.delete(request);
        console.log(`[SW ${DEPLOYMENT_COLOR}] Synced check-in: ${request.url}`);
      }
    } catch (error) {
      console.error(`[SW ${DEPLOYMENT_COLOR}] Failed to sync check-in:`, error);
    }
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New event update!',
    icon: '/logo192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('SteppersLife', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});