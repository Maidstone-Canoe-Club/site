export const AdminAccountability = {
  admin: true
};

export async function getRole(name: string, rolesService: any) {
  const roles = await rolesService.readByQuery({
    filter: {
      name: {
        _eq: name
      }
    }
  });

  if (!roles || !roles.length) {
    return null;
  }

  if (roles.length > 1) {
    throw new Error("Found multiple roles with the same name: " + name);
  }

  return roles[0];
}

export async function userHasRole(req: any, services: any, database: any, userId: string, roles: string[]) {
  const {
    UsersService
  } = services;

  const userService = new UsersService({
    knex: database,
    schema: req.schema,
    accountability: AdminAccountability
  });

  const user = await userService.readOne(userId, {
    fields: ["role.name"]
  });

  return roles.map(r => r.toLowerCase()).includes(user.role.name.toLowerCase());
}

export async function isUserLeader(req: any, services: any, database: any, eventId: string, userId: string) {
  const {
    ItemsService
  } = services;

  const eventLeadersService = new ItemsService("events_directus_users", {
    knex: database,
    schema: req.schema,
    accountability: AdminAccountability
  });

  const leaders = await eventLeadersService.readByQuery({
    fields: ["directus_users_id.id"],
    filter: {
      events_id: {
        _eq: eventId
      }
    },
    limit: -1
  });

  if (!leaders || leaders.length === 0) {
    return false;
  }

  return leaders.some((x: any) => x.directus_users_id?.id === userId);
}
