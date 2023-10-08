export default defineNuxtPlugin(async () => {
//   const { expires, refreshTokens } = useDirectusToken();
//   const user = useDirectusUser();
//
//   watch(user, async (val, oldVal) => {
//     if (!oldVal && val) {
//       // User has logged in, begin auto refresh
//       await checkRefresh();
//     }
//   });
//
//   async function checkRefresh () {
//     if (isNaN(expires.value)) {
//       return;
//     }
//
//     const expiresInMs = expires.value - Date.now();
//     // Add a small buffer window to the expire time when refreshing tokens
//     const expiresBufferMs = 10_000; // 10 seconds
//
//     if (isNaN(expiresInMs)) {
//       return;
//     }
//
//     if (expiresInMs > expiresBufferMs) {
//       // The token will expire some time after the buffer window
//       const timeout = expiresInMs - expiresBufferMs;
//
//       if (timeout > 1) {
//         window.setTimeout(async () => {
//           if (!user.value) {
//             // The user has logged out so we won't perform the auto refresh or queue another timeout
//             return;
//           }
//
//           await refreshTokens();
//           await checkRefresh();
//         }, timeout);
//       } else {
//         throw new Error(`Expires timeout was less than 1: '${timeout}'`);
//       }
//     } else {
//       // The token has already expired, or we are in the buffer window
//       await refreshTokens();
//       await checkRefresh();
//     }
//   }
//
//   await checkRefresh();
});
