import type { DirectusUser } from "nuxt-directus/dist/runtime/types";

export default defineNuxtRouteMiddleware(async (to, _from) => {
  const { fetchUser, setUser } = useDirectusAuth();

  let user = ref<DirectusUser | null>(null);

  try {
    user = useDirectusUser();
  } catch {
    console.warn("Auth middleware check, user is not logged in.");
  }

  if (!user.value) {
    const user = await fetchUser();
    setUser(user.value);
  }

  if (!user.value) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
  }
});
