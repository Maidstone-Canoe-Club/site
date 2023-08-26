import { DirectusUser } from "nuxt-directus/dist/runtime/types";
import { Ref } from "vue";
import { useDirectusUrl } from "#imports";

export function getAvatarUrl (user: DirectusUser, size = 40) {
  if (user) {
    const directusUrl = useDirectusUrl();
    return `${directusUrl}/assets/${user.avatar}?width=${size}&height=${size}&fit=cover&format=webp`;
  }
  return null;
}
