import type { DirectusUser } from "nuxt-directus/dist/runtime/types";

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
    console.error("User object is missing when checking for exact role");
    return false;
  }

  if (!role) {
    console.error("Cannot compare exact to missing role");
    return false;
  }

  if (!user.role) {
    console.error(`No role object on user with id ${user.id}`);
    return false;
  }

  return user.role.name.toLowerCase() === role.trim().toLowerCase();
}

export function hasRole (user: DirectusUser, role: string) {
  if (!user) {
    console.error("User object is missing when checking for role");
    return false;
  }

  if (!role) {
    console.error("Cannot compare to missing role");
    return false;
  }

  if (!user.role) {
    console.error(`No role object on user with id ${user.id}`);
    return false;
  }

  const userLevel = getRoleLevel(user.role.name);

  if (!userLevel) {
    console.warn(`Unknown user role: '${user.role.name}' for user with id ${user.id}`);
    return false;
  }

  const targetLevel = getRoleLevel(role);

  if (!targetLevel) {
    console.warn(`Unknown target role: '${role}'`);
    return false;
  }

  return userLevel >= targetLevel;
}
