export type Redirect = {
  url_old: string,
  url_new: string,
  response_code?: number
}

export default defineNuxtPlugin(async (nuxtApp) => {
  const redirectsState = useState<Redirect[]>("redirects", () => []);
  const { getItems } = useDirectusItems();

  if (redirectsState.value.length) {
    return;
  }

  const redirects = await getItems<Redirect>({
    collection: "redirects",
    params: {
      fields: [
        "url_old",
        "url_new",
        "response_code"
      ]
    }
  });

  if (redirects && redirects.length) {
    redirectsState.value = redirects;
  }
});
