export type ErrorContent = {
  title?: string,
  message: string
}

export function useError () {
  const state = useState<ErrorContent[]>("site-errors", () => []);

  function newError (error: ErrorContent) {
    state.value.push(error);
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
