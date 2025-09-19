export async function redirectToSlug (slug: string) {
  const route = useRoute();

  if (!route.params.slug) {
    let redirect = route.path;
    if (!redirect.endsWith("/")) {
      redirect += "/";
    }

    redirect += slug;
    await navigateTo(redirect, {
      redirectCode: 301
    });
  }
}

export function slugify (input: string) {
  if (!input) {
    return null;
  }
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036F]/g, "")
    .toLocaleLowerCase()
    .trim()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, "-");
}
