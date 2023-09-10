import { DirectusUser } from "nuxt-directus/dist/runtime/types";

const roleLevels : Record<string, number> = {
  unverified: 0,
  unapproved: 1,
  member: 2,
  coach: 3,
  committee: 4,
  administrator: 5
};

function getRoleLevel (role: string) {
  if (!role) {
    return null;
  }

  const level : number | null | undefined = roleLevels[role.toLowerCase()];
  if (level === null || level === undefined) {
    return null;
  }

  return level;
}

export function hasRole (user: DirectusUser, role: string) {
  if (!user) {
    return false;
  }

  if (!user.role) {
    console.error("No role object on user");
    return false;
  }

  const userLevel = getRoleLevel(user.role.name);

  if (!userLevel) {
    console.warn("Unknown user role:", user.role.name);
    return false;
  }

  const targetLevel = getRoleLevel(role);

  if (!targetLevel) {
    console.warn("Unknown target role:", role);
    return false;
  }

  return userLevel >= targetLevel;
}
