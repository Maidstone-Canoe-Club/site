export async function redirectToSlug (item: any) {
  const route = useRoute();

  if (!route.params.slug && item.slug) {
    let redirect = route.path;
    if (!redirect.endsWith("/")) {
      redirect += "/";
    }

    redirect += item.slug;
    await navigateTo(redirect);
  }
}
