export function useLocalStorage() {
  function getItem(name: string) {
    if (import.meta.client) {
      try {
        return window.localStorage.getItem(name);
      } catch {
        console.warn("localStorage is not available in this environment");
      }
    } else {
      return undefined;
    }
  }

  function setItem(name: string, value: string) {
    if (import.meta.client) {
      try {
        window.localStorage.setItem(name, value);
        return true;
      } catch {
        console.warn("localStorage is not available in this environment");
      }
    }
  }

  return {
    getItem,
    setItem
  }
}
