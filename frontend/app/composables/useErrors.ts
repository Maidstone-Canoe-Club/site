export type ErrorContent = {
  title?: string,
  message: string
}

export function useErrors () {
  const state = useState<ErrorContent[]>("site-errors", () => []);

  function newError (error: ErrorContent) {
    if (import.meta.client) {
      state.value.push(error);
    }
  }

  function clearError () {
    if (state.value.length) {
      state.value.shift();
    }
  }

  const errors = computed<ErrorContent[]>(() => state.value);

  return {
    newError,
    clearError,
    errors: readonly(errors)
  };
}
