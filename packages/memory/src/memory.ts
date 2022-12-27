export function memory() {
  const cache = new Map<string, unknown>();

  function get(key: string) {
    return cache.get(key);
  }

  function has(key: string) {
    return cache.has(key);
  }

  function set(key: string, value: unknown) {
    cache.set(key, value);
  }

  return function withContext() {
    return {
      get,
      has,
      set,
    };
  };
}
