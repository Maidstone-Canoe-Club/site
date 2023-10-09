export default defineNuxtPlugin(async () => {
  const { expires, refreshTokens, refreshToken } = useDirectusToken();
  const user = useDirectusUser();

  watch(user, async (val, oldVal) => {
    if (!oldVal && val) {
      // User has logged in, begin auto refresh
      await checkRefresh();
    }
  });

  let windowTimeout: number | null = null;

  async function checkRefresh () {
    console.log("starting refresh check");
    if (isNaN(expires.value)) {
      return;
    }

    if (!refreshToken.value) {
      console.log("no refresh token found");
      return;
    }

    const expiresInMs = expires.value - Date.now();
    // Add a small buffer window to the expire time when refreshing tokens
    const expiresBufferMs = 10_000; // 10 seconds

    console.log("expires in", expiresInMs, "ms");

    if (isNaN(expiresInMs)) {
      return;
    }

    if (expiresInMs > expiresBufferMs) {
      // The token will expire some time after the buffer window
      const timeout = expiresInMs - expiresBufferMs;

      if (timeout > 1) {
        if (windowTimeout) {
          console.log("clearing old timeout");
          window.clearTimeout(windowTimeout);
        }
        console.log("creating timeout");
        windowTimeout = window.setTimeout(async () => {
          if (!user.value) {
            console.log("user timed out");
            // The user has logged out so we won't perform the auto refresh or queue another timeout
            return;
          }

          console.log("refreshing");
          await refreshTokens();
          await checkRefresh();
        }, timeout);
      } else {
        throw new Error(`Expires timeout was less than 1: '${timeout}'`);
      }
    } else {
      console.log("instantly refreshing");
      // The token has already expired, or we are in the buffer window
      await refreshTokens();
      await checkRefresh();
    }
  }

  await checkRefresh();
});
