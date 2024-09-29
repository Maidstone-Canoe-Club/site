
export default defineNuxtRouteMiddleware((to, from) => {
  if(from.path.toLowerCase().startsWith("/admin")){
    const user = useDirectusUser();
    if (!hasRole(user.value, "Committee")) {
      return createError({
        statusCode: 401,
        statusMessage: "You're not allowed to access this page",
      });
    }
  }
});
