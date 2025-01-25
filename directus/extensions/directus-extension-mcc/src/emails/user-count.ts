export async function getUserCount(req: any, res: any, services: any, database: any) {
  const {
    UsersService
  } = services;

  const adminAccountability = {
    admin: true
  };

  try {
    const userId = req.accountability.user;

    if (!userId) {
      return res.status(400).send("missing user id");
    }

    const userService = new UsersService({
      knex: database,
      schema: req.schema,
      accountability: adminAccountability
    });

    const user = await userService.readOne(userId, {
      fields: ["*", "role.name"]
    });

    if (!user) {
      return res.status(400).send("user not found");
    }

    const allowedRoles = ["committee", "administrator"];

    if (!allowedRoles.includes(user.role.name.toLowerCase())) {
      return res.status(401).send("not allowed to get user count for email sending");
    }

    const users = await userService.readByQuery({
      fields: [],
      filter: {
        role: {
          name: {
            _in: ["Member", "Committee", "Administrator", "Coach", "Junior"]
          }
        }
      },
      limit: -1,
      aggregate: {
        count: ["*"]
      }
    });

    if(!users || users.length === 0) {
      return res.status(400).send("error getting user count");
    }

    return res.status(200).send(users[0]);
  } catch (e) {
    console.error("error getting user count", e);
    return res.status(500).send("error getting user count");
  }
}
