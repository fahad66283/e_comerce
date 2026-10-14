"use client";

import { useSyncExternalStore } from "react";

// A small store backed by localStorage. Every component using it stays in sync,
// including across browser tabs. On the server it always returns `fallback`.
export function createLocalStore(key, fallback) {
  let cache;
  let hasCache = false;
  const listeners = new Set();

  function get() {
    if (!hasCache) {
      try {
        const saved = localStorage.getItem(key);
        cache = saved === null ? fallback : JSON.parse(saved);
      } catch {
        cache = fallback;
      }
      hasCache = true;
    }
    return cache;
  }

  function notify() {
    listeners.forEach((listener) => listener());
  }

  function set(update) {
    cache = typeof update === "function" ? update(get()) : update;
    hasCache = true;
    localStorage.setItem(key, JSON.stringify(cache));
    notify();
  }

  function reset() {
    localStorage.removeItem(key);
    hasCache = false;
    notify();
  }

  function subscribe(listener) {
    listeners.add(listener);
    function onStorage(e) {
      if (e.key === key) {
        hasCache = false;
        listener();
      }
    }
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }

  function useValue() {
    return useSyncExternalStore(subscribe, get, () => fallback);
  }

  return { get, set, reset, useValue };
}

const noopSubscribe = () => () => {};

// false during server render and hydration, true once browser storage is readable
export function useHydrated() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}
