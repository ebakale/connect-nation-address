/**
 * Safe Capacitor bridge initialization.
 *
 * On native builds the `window.Capacitor` object is injected by the native
 * WebView. When the web assets load before the injection finishes (common when
 * serving from a remote URL, or on slow simulator starts), calls such as
 * `window.Capacitor.triggerEvent(...)` throw
 * "window.Capacitor.triggerEvent is undefined".
 *
 * These helpers wait for the bridge and no-op safely on the web.
 */

type CapacitorGlobal = {
  isNativePlatform?: () => boolean;
  triggerEvent?: (eventName: string, target: string, data?: unknown) => boolean;
  [key: string]: unknown;
};

declare global {
  interface Window {
    Capacitor?: CapacitorGlobal;
  }
}

const DEFAULT_TIMEOUT_MS = 3000;
const POLL_INTERVAL_MS = 50;

let readyPromise: Promise<CapacitorGlobal | null> | null = null;

/** True when the Capacitor bridge (with triggerEvent) is already injected. */
export function isCapacitorBridgeReady(): boolean {
  return typeof window !== 'undefined' && typeof window.Capacitor?.triggerEvent === 'function';
}

/**
 * Resolves with the Capacitor global once the bridge is ready, or `null` when
 * running on the web / if the bridge never appears within `timeoutMs`.
 */
export function waitForCapacitor(timeoutMs = DEFAULT_TIMEOUT_MS): Promise<CapacitorGlobal | null> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (isCapacitorBridgeReady()) return Promise.resolve(window.Capacitor!);

  if (!readyPromise) {
    readyPromise = new Promise<CapacitorGlobal | null>((resolve) => {
      const started = Date.now();

      const finish = (value: CapacitorGlobal | null) => {
        window.clearInterval(interval);
        document.removeEventListener('deviceready', onDeviceReady);
        resolve(value);
      };

      const check = () => {
        if (isCapacitorBridgeReady()) {
          finish(window.Capacitor!);
          return true;
        }
        return false;
      };

      const onDeviceReady = () => { check(); };
      document.addEventListener('deviceready', onDeviceReady, { once: true });

      const interval = window.setInterval(() => {
        if (check()) return;
        if (Date.now() - started >= timeoutMs) finish(null);
      }, POLL_INTERVAL_MS);

      check();
    }).finally(() => {
      // Allow a fresh wait later if the bridge still is not present.
      if (!isCapacitorBridgeReady()) readyPromise = null;
    }) as Promise<CapacitorGlobal | null>;
  }

  return readyPromise;
}

/**
 * Safely trigger a Capacitor bridge event. Waits for the bridge to be injected
 * and silently no-ops on the web instead of throwing.
 */
export async function safeTriggerEvent(
  eventName: string,
  target = 'window',
  data?: unknown,
): Promise<boolean> {
  const capacitor = await waitForCapacitor();
  if (typeof capacitor?.triggerEvent !== 'function') return false;
  try {
    return capacitor.triggerEvent(eventName, target, data) ?? false;
  } catch (error) {
    console.warn('[capacitor] triggerEvent failed:', error);
    return false;
  }
}

/** Call once at startup so native code can await the bridge before use. */
export async function initCapacitorBridge(): Promise<void> {
  const capacitor = await waitForCapacitor();
  if (capacitor) {
    document.documentElement.dataset.capacitorReady = 'true';
  }
}
