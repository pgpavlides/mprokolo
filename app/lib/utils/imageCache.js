// Utility functions for handling image caching

const IMAGE_CACHE_KEY = 'mprokolo-image-cache';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

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
  }
};

export const getCachedImage = (url) => {
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
  return null;
};

export const setCachedImage = (url, imageUrl) => {
  const cache = getImageCache();
  cache[url] = {
    imageUrl,
    timestamp: Date.now()
  };
  setImageCache(cache);
};

export const clearOldCache = () => {
  const cache = getImageCache();
  const now = Date.now();
  
  // Remove expired entries
  Object.keys(cache).forEach(url => {
    if (now - cache[url].timestamp > CACHE_DURATION) {
      delete cache[url];
    }
  });
  
  setImageCache(cache);
};