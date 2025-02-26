// File: app/lib/utils/imageCache.js

const IMAGE_CACHE_KEY = 'mprokolo-image-cache';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const MAX_CACHE_SIZE = 200; // Maximum number of items in cache

export const getImageCache = () => {
  try {
    const cache = localStorage.getItem(IMAGE_CACHE_KEY);
    return cache ? JSON.parse(cache) : {};
  } catch (error) {
    console.error('Error reading image cache:', error);
    return {};
  }
};

export const setImageCache = (cache) => {
  try {
    localStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Error saving image cache:', error);
    // If localStorage is full, clear old entries
    clearOldCache();
    // Try again with reduced cache
    try {
      localStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(cache));
    } catch (retryError) {
      console.error('Failed to save cache even after cleanup:', retryError);
    }
  }
};

export const getCachedImage = (url) => {
  if (!url) return null;
  
  try {
    const cache = getImageCache();
    const entry = cache[url];
    
    if (entry) {
      // Check if cache is still valid
      if (Date.now() - entry.timestamp < CACHE_DURATION) {
        return entry.imageUrl;
      } else {
        // Remove expired entry
        delete cache[url];
        setImageCache(cache);
      }
    }
  } catch (error) {
    console.error('Error getting cached image:', error);
  }
  return null;
};

export const setCachedImage = (url, imageUrl) => {
  if (!url || !imageUrl) return;
  
  try {
    const cache = getImageCache();
    
    // Check cache size and clear if needed
    if (Object.keys(cache).length >= MAX_CACHE_SIZE) {
      trimCache();
    }
    
    cache[url] = {
      imageUrl,
      timestamp: Date.now()
    };
    setImageCache(cache);
  } catch (error) {
    console.error('Error setting cached image:', error);
  }
};

export const clearOldCache = () => {
  try {
    const cache = getImageCache();
    const now = Date.now();
    
    // Remove expired entries
    Object.keys(cache).forEach(url => {
      if (now - cache[url].timestamp > CACHE_DURATION) {
        delete cache[url];
      }
    });
    
    setImageCache(cache);
  } catch (error) {
    console.error('Error clearing old cache:', error);
  }
};

// Remove oldest entries when cache gets too large
export const trimCache = () => {
  try {
    const cache = getImageCache();
    const entries = Object.entries(cache);
    
    // Sort by timestamp (oldest first)
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // Remove oldest 20% of entries
    const toRemove = Math.ceil(entries.length * 0.2);
    const trimmedEntries = entries.slice(toRemove);
    
    const newCache = {};
    trimmedEntries.forEach(([url, data]) => {
      newCache[url] = data;
    });
    
    setImageCache(newCache);
  } catch (error) {
    console.error('Error trimming cache:', error);
    // If all else fails, just clear the entire cache
    localStorage.removeItem(IMAGE_CACHE_KEY);
  }
};

// New helper function to generate a favicon URL using the new endpoint
export const getFaviconUrl = (linkUrl) => {
  try {
    const { hostname } = new URL(linkUrl);
    return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=128`;
  } catch (error) {
    console.error('Error generating favicon URL:', error);
    return '/globe.svg';
  }
};
