import type { Redirect } from "~/plugins/redirects";

export default defineNuxtRouteMiddleware((to, from) => {
  const redirectsState = useState<Redirect[]>("redirects", () => []);

  if (redirectsState.value.length) {
    let toCheck = to.path.toLowerCase();
    if (toCheck.endsWith("/")) {
      toCheck = toCheck.slice(0, -1);
    }

    const redirect = redirectsState.value.find(r => r.url_old.toLowerCase() === toCheck);
    if (redirect) {
      return navigateTo(redirect.url_new, {
        redirectCode: redirect.response_code ?? 301
      });
    }
  }
});
