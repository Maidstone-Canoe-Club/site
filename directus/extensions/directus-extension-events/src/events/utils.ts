export const AdminAccountability = {
  admin: true
};

export async function userHasRole(req: any, services: any, database: any, userId: string, roles: string[]) {
  console.log("checking is user has role", userId, roles);
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

  console.log("found user", user);
  const includes = roles.map(r => r.toLowerCase()).includes(user.role.name.toLowerCase());

  console.log("result", includes);
  return includes;
}

export async function isUserLeader(req: any, services: any, database: any, eventId: string, userId: string) {
  console.log("checking if user is leader");
  const {
    ItemsService
  } = services;

  const eventLeadersService = new ItemsService("events_directus_users", {
    knex: database,
    schema: req.schema,
    accountability: AdminAccountability
  });

  const leaders = await eventLeadersService.readByQuery({
    fields: ["*", "directus_users_id.first_name", "directus_users_id.last_name", "directus_users_id.avatar", "directus_users_id.id"],
    filter: {
      events_id: {
        _eq: eventId
      }
    }
  });

  console.log("leaders", leaders);

  if (!leaders || leaders.length === 0) {
    return false;
  }

  console.log("got leaders", leaders);

  const userIsLeader = leaders.find((x: any) => x.directus_users_id.id === userId);
  console.log("result", !!userIsLeader);
  return !!userIsLeader;
}
