import { getSessionId, getTimestamp, getPageUrl, getViewport, truncate } from './utils.js';

/**
 * UserAnalytics Tracker SDK
 * 
 * Usage:
 *   <script src="https://your-cdn.com/tracker.umd.js"></script>
 *   <script>
 *     UserAnalytics.init({ endpoint: 'https://api.example.com', siteId: 'my-site' });
 *   </script>
 * 
 * Or via npm:
 *   import { init } from '@user-analytics/tracker';
 *   init({ endpoint: 'https://api.example.com', siteId: 'my-site' });
 */

let config = {
  endpoint: '',
  siteId: '',
  batchSize: 10,
  flushInterval: 2000,
  debug: false,
};

let eventQueue = [];
let flushTimer = null;
let initialized = false;

// ─── Logging ──────────────────────────────────────────────

function log(...args) {
  if (config.debug) {
    console.log('[UserAnalytics]', ...args);
  }
}

// ─── Event Sending ────────────────────────────────────────

function flushQueue() {
  if (eventQueue.length === 0) return;

  const batch = eventQueue.splice(0, config.batchSize);
  const url = `${config.endpoint}/api/events`;
  const payload = JSON.stringify({ siteId: config.siteId, events: batch });

  log('Flushing', batch.length, 'events');

  // Try fetch first, fall back to sendBeacon
  if (typeof fetch === 'function') {
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch((err) => {
      log('Fetch failed, re-queuing events:', err);
      eventQueue.unshift(...batch);
    });
  } else if (navigator.sendBeacon) {
    const blob = new Blob([payload], { type: 'application/json' });
    navigator.sendBeacon(url, blob);
  }

  // If there are still events left, keep flushing
  if (eventQueue.length > 0) {
    scheduleFlush();
  }
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flushQueue();
  }, config.flushInterval);
}

function pushEvent(event) {
  eventQueue.push(event);
  log('Event queued:', event.eventType, event);

  if (eventQueue.length >= config.batchSize) {
    if (flushTimer) {
      clearTimeout(flushTimer);
      flushTimer = null;
    }
    flushQueue();
  } else {
    scheduleFlush();
  }
}

// ─── Event Trackers ───────────────────────────────────────

function trackPageView() {
  const sessionId = getSessionId();
  pushEvent({
    sessionId,
    eventType: 'page_view',
    pageUrl: getPageUrl(),
    timestamp: getTimestamp(),
    data: {
      referrer: document.referrer || '',
      title: document.title || '',
      ...getViewport(),
    },
  });
}

function trackClick(e) {
  const sessionId = getSessionId();
  const target = e.target;

  pushEvent({
    sessionId,
    eventType: 'click',
    pageUrl: getPageUrl(),
    timestamp: getTimestamp(),
    data: {
      x: e.pageX,
      y: e.pageY,
      elementTag: target.tagName || '',
      elementText: truncate(target.innerText || target.textContent, 100),
      ...getViewport(),
    },
  });
}

// ─── SPA Navigation Support ──────────────────────────────

function patchHistoryMethod(method) {
  const original = history[method];
  history[method] = function (...args) {
    const result = original.apply(this, args);
    trackPageView();
    return result;
  };
}

function setupSPATracking() {
  patchHistoryMethod('pushState');
  patchHistoryMethod('replaceState');
  window.addEventListener('popstate', trackPageView);
}

// ─── Initialization ──────────────────────────────────────

/**
 * Initialize the tracker.
 * @param {Object} options
 * @param {string} options.endpoint - Backend API URL (e.g., 'http://localhost:3001')
 * @param {string} options.siteId - Unique site identifier
 * @param {number} [options.batchSize=10] - Events before auto-flush
 * @param {number} [options.flushInterval=2000] - MS between flushes
 * @param {boolean} [options.debug=false] - Enable console logging
 */
export function init(options = {}) {
  if (initialized) {
    log('Already initialized');
    return;
  }

  if (!options.endpoint) {
    console.error('[UserAnalytics] endpoint is required');
    return;
  }
  if (!options.siteId) {
    console.error('[UserAnalytics] siteId is required');
    return;
  }

  // Merge config
  config = { ...config, ...options };
  // Remove trailing slash from endpoint
  config.endpoint = config.endpoint.replace(/\/+$/, '');

  initialized = true;
  log('Initialized with config:', config);

  // Track initial page view
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    trackPageView();
  } else {
    document.addEventListener('DOMContentLoaded', trackPageView);
  }

  // Track clicks via event delegation
  document.addEventListener('click', trackClick, { capture: true });

  // SPA support
  setupSPATracking();

  // Flush remaining events on page unload
  window.addEventListener('beforeunload', () => {
    if (eventQueue.length > 0) {
      const url = `${config.endpoint}/api/events`;
      const payload = JSON.stringify({ siteId: config.siteId, events: eventQueue });
      
      // sendBeacon is more reliable on unload
      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon(url, blob);
      } else {
        // Synchronous XHR as last resort
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url, false);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(payload);
      }
      eventQueue = [];
    }
  });
}

// For UMD / script tag usage
if (typeof window !== 'undefined') {
  window.UserAnalytics = window.UserAnalytics || { init };
}

export default { init };
