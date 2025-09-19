export default defineNuxtPlugin(() => {
  const { expires, refreshTokens, refreshToken } = useDirectusToken();
  const user = useDirectusUser();

  watch(user, async (val, oldVal) => {
    if (!oldVal && val) {
      // User has logged in, begin auto refresh
      if (windowTimeout) {
        console.log("[auth] Already has timeout, clearing timeout");
        window.clearTimeout(windowTimeout);
        windowTimeout = null;
      }
      await checkRefresh();
    }

    if (oldVal && !val) {
      if (windowTimeout) {
        console.log("[auth] User logged out, clearing timeout");
        window.clearTimeout(windowTimeout);
        windowTimeout = null;
      }
    }
  });

  let windowTimeout: number | null = null;

  async function checkRefresh () {
    console.log("[auth] Starting refresh check");
    if (isNaN(expires.value)) {
      return;
    }

    if (!refreshToken.value) {
      console.log("[auth] No refresh token found");
      return;
    }

    const expiresInMs = expires.value - Date.now();
    // Add a small buffer window to the expire time when refreshing tokens
    const expiresBufferMs = 10_000; // 10 seconds

    console.log("[auth] Expires in", expiresInMs, "ms");

    if (isNaN(expiresInMs)) {
      return;
    }

    if (expiresInMs > expiresBufferMs) {
      // The token will expire some time after the buffer window
      const timeout = expiresInMs - expiresBufferMs;

      if (timeout > 1) {
        if (windowTimeout) {
          console.log("[auth] Clearing old timeout");
          window.clearTimeout(windowTimeout);
        }
        console.log("[auth] Creating timeout");
        windowTimeout = window.setTimeout(async () => {
          if (!user.value) {
            console.log("[auth] User timed out");
            // The user has logged out so we won't perform the auto refresh or queue another timeout
            return;
          }

          console.log("[auth] Refreshing...");
          try {
            await refreshTokens();
            await checkRefresh();
          } catch (e) {
            console.error("[auth] Error refreshing token", e);
          }
        }, timeout);
      } else {
        console.log("[auth] Timeout less than 1, instantly refreshing");
        await refreshTokens();
        await checkRefresh();
      }
    } else {
      console.log("[auth] Instantly refreshing");
      // The token has already expired, or we are in the buffer window
      await refreshTokens();
      await checkRefresh();
    }
  }

  checkRefresh().catch(e => console.error("[auth] Error on initial check refresh", e));
});
