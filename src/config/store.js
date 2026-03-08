/**
 * storeConfig — mutable runtime config.
 *
 * storeId is written by main.js after the store is resolved.
 * All service files read from this object at call-time (not import-time),
 * so they always get the current value.
 *
 * VITE_FALLBACK_STORE_ID is used only on localhost as the dev default.
 */
export const storeConfig = {
  storeId: import.meta.env.VITE_FALLBACK_STORE_ID || '',
  environment: import.meta.env.VITE_ENVIRONMENT || 'demo',
};
