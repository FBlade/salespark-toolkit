import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  deferPostReturn,
  deferNonCritical,
  deferAfterResponse,
  deferAfterResponseNonCritical,
  type HttpResponseLike,
} from "../src/utils/defer";

describe("defer utilities", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("deferPostReturn", () => {
    it("runs after current stack and swallows errors", async () => {
      const order: string[] = [];
      order.push("a");
      deferPostReturn(() => {
        order.push("b");
        throw new Error("boom");
      });
      order.push("c");

      await Promise.resolve();
      expect(order).toEqual(["a", "c", "b"]);
    });

    it("handles async functions that reject", async () => {
      const spy = vi.fn(async () => {
        throw new Error("async boom");
      });

      deferPostReturn(spy);
      await Promise.resolve();

      expect(spy).toHaveBeenCalledTimes(1);
      // Error is swallowed, no crash
    });

    it("handles async functions that resolve", async () => {
      const order: string[] = [];

      deferPostReturn(async () => {
        order.push("async");
      });

      await Promise.resolve();
      await Promise.resolve(); // Extra tick for async completion

      expect(order).toContain("async");
    });

    it("ignores non-function input", async () => {
      // @ts-expect-error runtime guard test
      deferPostReturn(null);
      // @ts-expect-error runtime guard test
      deferPostReturn(undefined);
      // @ts-expect-error runtime guard test
      deferPostReturn(123);

      await Promise.resolve();
      expect(true).toBe(true); // No crash
    });

    it("uses Promise.resolve fallback when queueMicrotask is missing", async () => {
      const original = globalThis.queueMicrotask;
      // @ts-expect-error testing fallback
      globalThis.queueMicrotask = undefined;

      const order: string[] = [];
      order.push("a");
      deferPostReturn(() => order.push("b"));
      order.push("c");

      await Promise.resolve();
      expect(order).toEqual(["a", "c", "b"]);

      globalThis.queueMicrotask = original;
    });
  });

  describe("deferNonCritical", () => {
    it("schedules late and swallows errors", async () => {
      const spy = vi.fn(() => {
        throw new Error("boom");
      });

      deferNonCritical(spy);
      expect(spy).not.toHaveBeenCalled();

      vi.runAllTimers();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("handles async functions", async () => {
      const spy = vi.fn(async () => {
        throw new Error("async boom");
      });

      deferNonCritical(spy);
      vi.runAllTimers();

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("falls back when setImmediate is missing", () => {
      const original = (globalThis as any).setImmediate;
      (globalThis as any).setImmediate = undefined;

      const spy = vi.fn();
      deferNonCritical(spy);

      expect(spy).not.toHaveBeenCalled();
      vi.runAllTimers();
      expect(spy).toHaveBeenCalledTimes(1);

      (globalThis as any).setImmediate = original;
    });

    it("ignores non-function input", () => {
      // @ts-expect-error runtime guard test
      deferNonCritical(null);
      vi.runAllTimers();
      expect(true).toBe(true);
    });
  });

  describe("deferAfterResponse", () => {
    it("schedules on 'finish' event", async () => {
      const listeners: Record<string, Array<(...args: any[]) => void>> = {
        finish: [],
        close: [],
      };

      const res: HttpResponseLike = {
        writableEnded: false,
        once(event, listener) {
          (listeners[event] = listeners[event] || []).push(listener);
        },
      };

      const spy = vi.fn();
      deferAfterResponse(res, spy);

      expect(spy).not.toHaveBeenCalled();
      listeners.finish[0]?.();

      await Promise.resolve();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("schedules on 'close' event", async () => {
      const listeners: Record<string, Array<(...args: any[]) => void>> = {
        finish: [],
        close: [],
      };

      const res: HttpResponseLike = {
        writableEnded: false,
        once(event, listener) {
          (listeners[event] = listeners[event] || []).push(listener);
        },
      };

      const spy = vi.fn();
      deferAfterResponse(res, spy);

      listeners.close[0]?.();

      await Promise.resolve();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("runs immediately when response already ended", async () => {
      const spy = vi.fn();
      deferAfterResponse({ writableEnded: true, once: vi.fn() }, spy);

      await Promise.resolve();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("guards against null/undefined response", async () => {
      const spy = vi.fn();
      // @ts-expect-error testing guard
      deferAfterResponse(null, spy);

      await Promise.resolve();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("guards against response without 'once' method", async () => {
      const spy = vi.fn();
      // @ts-expect-error testing guard
      deferAfterResponse({ writableEnded: false }, spy);

      await Promise.resolve();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("handles error when attaching listeners", async () => {
      const res: HttpResponseLike = {
        writableEnded: false,
        once() {
          throw new Error("Cannot attach listener");
        },
      };

      const spy = vi.fn();
      deferAfterResponse(res, spy);

      // Falls back to deferPostReturn
      await Promise.resolve();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("ignores non-function input", async () => {
      const res: HttpResponseLike = {
        writableEnded: false,
        once: vi.fn(),
      };

      // @ts-expect-error testing guard
      deferAfterResponse(res, null);
      expect(true).toBe(true);
    });
  });

  describe("deferAfterResponseNonCritical", () => {
    it("schedules as low priority after 'finish'", () => {
      const listeners: Record<string, Array<(...args: any[]) => void>> = {
        finish: [],
        close: [],
      };

      const res: HttpResponseLike = {
        writableEnded: false,
        once(event, listener) {
          (listeners[event] = listeners[event] || []).push(listener);
        },
      };

      const spy = vi.fn();
      deferAfterResponseNonCritical(res, spy);

      listeners.finish[0]?.();
      expect(spy).not.toHaveBeenCalled();

      vi.runAllTimers();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("schedules as low priority after 'close'", () => {
      const listeners: Record<string, Array<(...args: any[]) => void>> = {
        finish: [],
        close: [],
      };

      const res: HttpResponseLike = {
        writableEnded: false,
        once(event, listener) {
          (listeners[event] = listeners[event] || []).push(listener);
        },
      };

      const spy = vi.fn();
      deferAfterResponseNonCritical(res, spy);

      listeners.close[0]?.();
      expect(spy).not.toHaveBeenCalled();

      vi.runAllTimers();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("handles already-ended response", () => {
      const spy = vi.fn();
      deferAfterResponseNonCritical(
        { writableEnded: true, once: vi.fn() },
        spy
      );

      vi.runAllTimers();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("guards against invalid response", () => {
      const spy = vi.fn();
      // @ts-expect-error testing guard
      deferAfterResponseNonCritical(null, spy);

      vi.runAllTimers();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("handles error when attaching listeners", () => {
      const res: HttpResponseLike = {
        writableEnded: false,
        once() {
          throw new Error("Cannot attach");
        },
      };

      const spy = vi.fn();
      deferAfterResponseNonCritical(res, spy);

      vi.runAllTimers();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("ignores non-function input", () => {
      const res: HttpResponseLike = {
        writableEnded: false,
        once: vi.fn(),
      };

      // @ts-expect-error testing guard
      deferAfterResponseNonCritical(res, null);
      vi.runAllTimers();
      expect(true).toBe(true);
    });
  });
});
