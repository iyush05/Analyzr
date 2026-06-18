/**
 * Generate a UUID v4 string.
 * Uses crypto.randomUUID when available, falls back to manual generation.
 */
export function generateUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get or create a session ID.
 * Sessions expire after 30 minutes of inactivity.
 */
const SESSION_KEY = '__ua_session_id';
const SESSION_TS_KEY = '__ua_session_ts';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export function getSessionId() {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    const lastActive = localStorage.getItem(SESSION_TS_KEY);

    if (stored && lastActive) {
      const elapsed = Date.now() - parseInt(lastActive, 10);
      if (elapsed < SESSION_TIMEOUT) {
        // Refresh the timestamp
        localStorage.setItem(SESSION_TS_KEY, Date.now().toString());
        return stored;
      }
    }

    // Create a new session
    const newId = generateUUID();
    localStorage.setItem(SESSION_KEY, newId);
    localStorage.setItem(SESSION_TS_KEY, Date.now().toString());
    return newId;
  } catch {
    // localStorage unavailable (e.g., incognito in some browsers)
    // Fall back to in-memory session
    return generateUUID();
  }
}

/**
 * Get current timestamp in ISO format.
 */
export function getTimestamp() {
  return new Date().toISOString();
}

/**
 * Get the current page URL (without hash for cleaner grouping).
 */
export function getPageUrl() {
  return window.location.href.split('#')[0];
}

/**
 * Get viewport dimensions.
 */
export function getViewport() {
  return {
    viewportW: window.innerWidth,
    viewportH: window.innerHeight,
  };
}

/**
 * Truncate a string to a max length.
 */
export function truncate(str, maxLen = 100) {
  if (!str) return '';
  return str.length > maxLen ? str.substring(0, maxLen) + '…' : str;
}
