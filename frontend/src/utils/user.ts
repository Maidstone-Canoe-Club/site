import type { DirectusUser } from "nuxt-directus/dist/runtime/types";
import { subYears } from "date-fns";

export function getAvatarUrl (user: DirectusUser | undefined, size = 40) {
  if (user) {
    const directusUrl = useDirectusUrl();
    return `${directusUrl}/assets/${user.avatar}?width=${size}&height=${size}&fit=cover&format=webp`;
  }
  return null;
}

export function isAdult (value: Date) {
  const cutoff = subYears(new Date(), 18);
  return new Date(value) < cutoff;
}
