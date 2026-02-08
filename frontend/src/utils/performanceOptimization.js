/**
 * Utilidad para optimizar llamadas a API con caching y debouncing
 */

// Cache para resultados de API por 5 minutos
const apiCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const getCachedData = (key) => {
  const cached = apiCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`✓ Cache hit: ${key}`);
    return cached.data;
  }
  apiCache.delete(key);
  return null;
};

export const setCachedData = (key, data) => {
  apiCache.set(key, {
    data,
    timestamp: Date.now()
  });
};

// Debounce para operaciones frecuentes
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle para eventos como scroll
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Prefetch de datos antes de que los necesites
export const prefetchData = async (fetchFunction, cacheKey) => {
  const cached = getCachedData(cacheKey);
  if (!cached) {
    try {
      const data = await fetchFunction();
      setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Error prefetching ${cacheKey}:`, error);
    }
  }
  return cached;
};

// Reportar Core Web Vitals a tu servidor para monitoreo
export const reportWebVitals = (metric) => {
  if (navigator.sendBeacon && metric) {
    try {
      // Aquí enviarías los datos a tu servidor de analytics
      console.log(`📊 Web Vital - ${metric.name}: ${metric.value.toFixed(2)}ms`);
    } catch (error) {
      console.error('Error reporting metrics:', error);
    }
  }
};
