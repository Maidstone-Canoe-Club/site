
export default defineNuxtRouteMiddleware((to, from) => {
  if(from.path.toLowerCase().startsWith("/admin")){
    const user = useDirectusUser();

    if (!user.value) {
      return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
    }

    if (!hasRole(user.value, "Committee")) {
      return createError({
        statusCode: 401,
        statusMessage: "You're not allowed to access this page",
      });
    }
  }
});
