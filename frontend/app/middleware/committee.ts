export default defineNuxtRouteMiddleware(() => {
  const user = useDirectusUser();
  if (!user.value || !hasRole(user.value, "Committee")) {
    return createError({
      statusCode: 401,
      statusMessage: "You're not allowed to access this page"
    });
  }
});
