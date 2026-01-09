export type DeferFn = () => void | Promise<void>;

/******************************************************************
 * ##: Swallow promise rejections for fire-and-forget tasks
 * Attaches a catch handler that intentionally ignores any rejection.
 * Use to prevent unhandled rejections in non-critical async work.
 *
 * TL;DR: Prevents unhandled promise rejections for background tasks.
 * Keeps best-effort work from impacting the caller.
 * @param {Promise<unknown>} p - Promise to observe and silence on rejection
 * @returns {Promise<unknown>} - Promise with rejection swallowed via a no-op catch handler
 * History:
 * 09-01-2026: Created
 ******************************************************************/
const swallow = (p: Promise<unknown>) => p.catch(() => {});

/******************************************************************
 * ##: Defer work to run right after return using a microtask
 * Schedules work after the current call stack, using queueMicrotask or
 * Promise.then, and swallows sync/async errors to avoid impacting callers.
 *
 * TL;DR: Runs post-return work ASAP without blocking the caller.
 * Best for small but important tasks that must run soon.
 * @param {DeferFn} fn - Function to execute after the current stack completes
 * @returns {void} - Does not return a value
 * History:
 * 09-01-2026: Created
 ******************************************************************/
export const deferPostReturn = (fn: DeferFn): void => {
  if (typeof fn !== "function") return;

  const run = () => {
    try {
      const result = fn();
      swallow(Promise.resolve(result));
    } catch {
      // Swallow synchronous errors to prevent crashes
    }
  };

  if (typeof queueMicrotask === "function") {
    queueMicrotask(run);
  } else {
    Promise.resolve().then(run);
  }
};

/******************************************************************
 * ##: Defer non-critical work with low priority scheduling
 * Schedules work after more urgent tasks, using setImmediate when available
 * (or setTimeout), and swallows sync/async errors to keep execution safe.
 *
 * TL;DR: Runs low-priority work as late as possible.
 * Ideal for logs, metrics, and cleanup that must not compete with requests.
 * @param {DeferFn} fn - Function to execute with low priority scheduling
 * @returns {void} - Does not return a value
 * History:
 * 09-01-2026: Created
 ******************************************************************/
export const deferNonCritical = (fn: DeferFn): void => {
  if (typeof fn !== "function") return;

  const run = () => {
    try {
      const result = fn();
      swallow(Promise.resolve(result));
    } catch {
      // Guard: prevent bubbling in unusual environments
    }
  };

  if (typeof setImmediate === "function") {
    setImmediate(run);
  } else {
    setTimeout(run, 0);
  }
};

export type HttpResponseLike = {
  once: (event: "finish" | "close", listener: (...args: any[]) => void) => void;
  writableEnded?: boolean;
};

/******************************************************************
 * ##: Defer work until after the HTTP response finishes
 * Runs work only after the response is completed (finish/close), ensures it
 * executes once, and schedules via microtask to avoid impacting response time.
 *
 * TL;DR: Runs work after sending the response, exactly once.
 * Use for post-response tasks like logging, metrics, or async side effects.
 * @param {HttpResponseLike} res - Response-like object that emits finish/close events
 * @param {DeferFn} fn - Function to execute after the response has completed
 * @returns {void} - Does not return a value
 * History:
 * 09-01-2026: Created
 ******************************************************************/
export const deferAfterResponse = (
  res: HttpResponseLike,
  fn: DeferFn
): void => {
  if (typeof fn !== "function") return;

  // If response is already finished, schedule immediately
  if (res?.writableEnded === true) {
    deferPostReturn(fn);
    return;
  }

  // Guard against incompatible objects
  if (!res || typeof res.once !== "function") {
    deferPostReturn(fn);
    return;
  }

  let executed = false;
  const executeOnce = () => {
    if (executed) return;
    executed = true;
    deferPostReturn(fn);
  };

  try {
    res.once("finish", executeOnce);
    res.once("close", executeOnce);
  } catch {
    // Fallback if attaching listeners fails
    if (!executed) {
      deferPostReturn(fn);
    }
  }
};

/******************************************************************
 * ##: Defer low-priority work until after the HTTP response finishes
 * Runs work only after the response is completed (finish/close), ensures it
 * executes once, and schedules with low priority to avoid competing with traffic.
 *
 * TL;DR: Runs low-priority work after sending the response, exactly once.
 * Best for non-urgent metrics, logs, and cleanup after request completion.
 * @param {HttpResponseLike} res - Response-like object that emits finish/close events
 * @param {DeferFn} fn - Function to execute after the response has completed
 * @returns {void} - Does not return a value
 * History:
 * 09-01-2025: Created
 * 09-01-2025: Fixed duplicate execution bug (finish + close both firing)
 ******************************************************************/
export const deferAfterResponseNonCritical = (
  res: HttpResponseLike,
  fn: DeferFn
): void => {
  if (typeof fn !== "function") return;

  if (res?.writableEnded === true) {
    deferNonCritical(fn);
    return;
  }

  if (!res || typeof res.once !== "function") {
    deferNonCritical(fn);
    return;
  }

  let executed = false;
  const executeOnce = () => {
    if (executed) return;
    executed = true;
    deferNonCritical(fn);
  };

  try {
    res.once("finish", executeOnce);
    res.once("close", executeOnce);
  } catch {
    if (!executed) {
      deferNonCritical(fn);
    }
  }
};
