export default defineNuxtRouteMiddleware(() => {
  const user = useDirectusUser();
  if (user.value) {
    return navigateTo("/");
  }
});
