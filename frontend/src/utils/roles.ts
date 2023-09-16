import { DirectusUser } from "nuxt-directus/dist/runtime/types";

const roleLevels : Record<string, number> = {
  unverified: 0,
  junior: 1,
  unapproved: 2,
  member: 3,
  coach: 4,
  committee: 5,
  administrator: 6
};

function getRoleLevel (role: string) {
  if (!role) {
    return null;
  }

  const level : number | null | undefined = roleLevels[role.trim().toLowerCase()];
  if (level === null || level === undefined) {
    return null;
  }

  return level;
}

export function hasExactRole (user: DirectusUser, role: string) {
  if (!user) {
    return false;
  }

  if (!user.role) {
    console.error("No role object on user");
    return false;
  }

  return user.role.name.toLowerCase() === role.trim().toLowerCase();
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
    console.warn(`Unknown user role: '${user.role.name}'`);
    return false;
  }

  const targetLevel = getRoleLevel(role);

  if (!targetLevel) {
    console.warn(`Unknown target role: '${role}'`);
    return false;
  }

  return userLevel >= targetLevel;
}
