// Service Worker for Connect Nation Address System
const CACHE_NAME = 'connect-nation-v1';
const OFFLINE_URL = '/offline.html';

// Core files to cache for offline functionality
const CORE_CACHE_FILES = [
  '/',
  '/offline.html',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/index.css',
  // Core assets
  '/src/assets/hero-bg.jpg',
  '/src/assets/hero-address-system.jpg'
];

// API responses cache
const API_CACHE_NAME = 'api-cache-v1';
const OFFLINE_DATA_CACHE = 'offline-data-v1';

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching core files');
        return cache.addAll(CORE_CACHE_FILES);
      })
      .then(() => {
        console.log('Service Worker installed successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Failed to cache core files:', error);
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME && cacheName !== OFFLINE_DATA_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return caches.match('/offline.html');
        })
    );
    return;
  }

  // Handle API requests with network-first strategy
  if (url.pathname.includes('/api/') || url.hostname.includes('supabase.co')) {
    event.respondWith(
      networkFirstStrategy(request)
    );
    return;
  }

  // Handle static assets with cache-first strategy
  event.respondWith(
    cacheFirstStrategy(request)
  );
});

// Network-first strategy for API calls
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network request failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline indicator for failed API calls
    return new Response(
      JSON.stringify({ 
        offline: true, 
        error: 'Network unavailable',
        timestamp: Date.now()
      }), 
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Cache-first strategy for static assets
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Failed to fetch resource:', request.url);
    return new Response('Resource not available offline', { status: 404 });
  }
}

// Background sync for data synchronization
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'address-sync') {
    event.waitUntil(syncAddressData());
  }
  
  if (event.tag === 'incident-sync') {
    event.waitUntil(syncIncidentData());
  }
});

async function syncAddressData() {
  try {
    // Get pending offline data from IndexedDB
    const offlineData = await getOfflineData('addresses');
    
    for (const data of offlineData) {
      try {
        await fetch('/api/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        
        // Remove synced data from offline storage
        await removeOfflineData('addresses', data.id);
      } catch (error) {
        console.error('Failed to sync address data:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function syncIncidentData() {
  try {
    const offlineData = await getOfflineData('incidents');
    
    for (const data of offlineData) {
      try {
        await fetch('/api/incidents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        
        await removeOfflineData('incidents', data.id);
      } catch (error) {
        console.error('Failed to sync incident data:', error);
      }
    }
  } catch (error) {
    console.error('Incident sync failed:', error);
  }
}

// Helper functions for offline data management
async function getOfflineData(storeName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ConnectNationOffline', 1);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result);
      };
      
      getAllRequest.onerror = () => {
        reject(getAllRequest.error);
      };
    };
    
    request.onerror = () => {
      reject(request.error);
    };
  });
}

async function removeOfflineData(storeName, id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ConnectNationOffline', 1);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => {
        resolve();
      };
      
      deleteRequest.onerror = () => {
        reject(deleteRequest.error);
      };
    };
    
    request.onerror = () => {
      reject(request.error);
    };
  });
}