/**
 * SATify - Service Worker
 * Provides offline functionality and caching
 */

const CACHE_NAME = 'satify-v2';
const STATIC_CACHE_NAME = 'satify-static-v2';
const DATA_CACHE_NAME = 'satify-data-v2';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/js/app.js',
  '/js/auth.js',
  '/js/practice.js',
  '/js/analytics.js',
  '/manifest.json',
  'https://polyfill.io/v3/polyfill.min.js?features=es6',
  'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js'
];

// Data assets to cache on demand
const DATA_ASSETS = [
  '/data/manifest.json',
  '/data/lookup.json'
];

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      }),
      // Cache data assets
      caches.open(DATA_CACHE_NAME).then((cache) => {
        return cache.addAll(DATA_ASSETS);
      })
    ]).then(() => {
      console.log('Service Worker installed successfully');
      // Force activation of new service worker
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== STATIC_CACHE_NAME && 
                     cacheName !== DATA_CACHE_NAME && 
                     cacheName !== CACHE_NAME;
            })
            .map((cacheName) => caches.delete(cacheName))
        );
      }),
      // Take control of all pages
      self.clients.claim()
    ]).then(() => {
      console.log('Service Worker activated successfully');
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle different types of requests
  if (request.method === 'GET') {
    if (isStaticAsset(request.url)) {
      event.respondWith(handleStaticAsset(request));
    } else if (isDataAsset(request.url)) {
      event.respondWith(handleDataAsset(request));
    } else if (isAppShellRequest(request.url)) {
      event.respondWith(handleAppShell(request));
    } else {
      event.respondWith(handleOtherRequests(request));
    }
  }
});

function isStaticAsset(url) {
  return STATIC_ASSETS.some(asset => url.includes(asset)) ||
         url.includes('polyfill.io') ||
         url.includes('mathjax') ||
         url.includes('jsdelivr');
}

function isDataAsset(url) {
  return url.includes('/data/') && 
         (url.includes('.json') || url.includes('chunks/'));
}

function isAppShellRequest(url) {
  return url.includes('index.html') || 
         url.endsWith('/') ||
         (!url.includes('.') && !url.includes('api'));
}

async function handleStaticAsset(request) {
  try {
    // Try cache first (cache-first strategy)
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If not in cache, fetch from network
    const networkResponse = await fetch(request);
    
    // Cache the response for future use
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Failed to handle static asset:', error);
    // Return cached version if available, otherwise throw
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

async function handleDataAsset(request) {
  try {
    // Try network first (network-first strategy) for fresh data
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      // Cache the fresh data
      const cache = await caches.open(DATA_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('Network failed, trying cache for:', request.url);
  }
  
  // Fall back to cache if network fails
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // If no cache available, return error response
  return new Response(
    JSON.stringify({ error: 'Data not available offline' }),
    { 
      status: 503, 
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

async function handleAppShell(request) {
  try {
    // For app shell, always try cache first for better performance
    const cachedResponse = await caches.match('/index.html');
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fall back to network
    return await fetch('/index.html');
  } catch (error) {
    console.error('Failed to serve app shell:', error);
    throw error;
  }
}

async function handleOtherRequests(request) {
  try {
    // For other requests, try network first
    return await fetch(request);
  } catch (error) {
    // Check if we have it cached
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page or error
    return new Response(
      'Content not available offline',
      { 
        status: 503, 
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'text/plain' }
      }
    );
  }
}

// Background sync for when connectivity returns
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-user-data') {
    event.waitUntil(syncUserData());
  }
});

async function syncUserData() {
  try {
    // Get pending user data from IndexedDB or localStorage
    const pendingData = await getPendingUserData();
    
    if (pendingData && pendingData.length > 0) {
      // Sync with server when available
      for (const data of pendingData) {
        await syncSingleSession(data);
      }
      
      // Clear pending data after successful sync
      await clearPendingUserData();
    }
  } catch (error) {
    console.error('Failed to sync user data:', error);
  }
}

async function getPendingUserData() {
  // In a real implementation, this would read from IndexedDB
  // For now, return empty array
  return [];
}

async function syncSingleSession(sessionData) {
  // In a real implementation, this would POST to your API
  console.log('Would sync session:', sessionData);
}

async function clearPendingUserData() {
  // Clear synced data from local storage
  console.log('Clearing pending sync data');
}

// Push notifications (for future enhancement)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const options = {
    body: event.data.text(),
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Practice Now',
        icon: '/icons/practice-action.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/close-action.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('SATify', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    // Open the app to practice page
    event.waitUntil(
      clients.openWindow('/?mode=practice')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Periodic background sync (for future enhancement)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-questions') {
    event.waitUntil(updateQuestionDatabase());
  }
});

async function updateQuestionDatabase() {
  try {
    // Check for new questions or updates
    const response = await fetch('/api/questions/version');
    const { version } = await response.json();
    
    const cachedVersion = await getCachedDataVersion();
    
    if (version > cachedVersion) {
      // Update cached questions
      await updateCachedQuestions();
      await setCachedDataVersion(version);
    }
  } catch (error) {
    console.error('Failed to update question database:', error);
  }
}

async function getCachedDataVersion() {
  // Get version from cache or localStorage
  return 1;
}

async function setCachedDataVersion(version) {
  // Store version in cache or localStorage
  console.log('Updated data version to:', version);
}

async function updateCachedQuestions() {
  // Update question data in cache
  console.log('Updating cached questions');
}