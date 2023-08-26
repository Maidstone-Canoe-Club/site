export default defineNuxtRouteMiddleware(() => {
  const user = useDirectusUser();
  if (user.value.role !== "b4a0ccc9-6378-4b29-a3d5-dfb065b2ff42") {
    return createError({
      statusCode: 401
    });
  }
});
