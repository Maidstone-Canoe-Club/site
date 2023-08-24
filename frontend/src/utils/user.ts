import { DirectusUser } from "nuxt-directus/dist/runtime/types";
import { Ref } from "vue";
import { useDirectusUrl } from "#imports";

export function getAvatarUrl (user: Ref<DirectusUser>, size = 40) {
  const directusUrl = useDirectusUrl();
  if (user.value) {
    return `${directusUrl}/assets/${user.value.avatar}?width=${size}&height=${size}&fit=cover`;
  }
  return null;
}
