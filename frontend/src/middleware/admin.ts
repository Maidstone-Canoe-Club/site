﻿export default defineNuxtRouteMiddleware(() => {
  const user = useDirectusUser();
  if (!hasRole(user.value, "Administrator")) {
    return createError({
      statusCode: 401,
      statusMessage: "You're not allowed to access this page"
    });
  }
});
