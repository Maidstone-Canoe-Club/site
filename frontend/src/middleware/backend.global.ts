import { useDirectus } from "#imports";

export default defineNuxtRouteMiddleware(async (to, _from) => {
  if (to.path.includes("offline")) {
    return;
  }

  const directus = useDirectus();

  try {
    await directus("/server/health");
    console.log("directus ok!");
  } catch {
    console.log("couldn't talk to directus!");
    return navigateTo("/offline");
  }
});
