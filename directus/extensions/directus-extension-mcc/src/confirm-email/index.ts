import {defineEndpoint} from "@directus/extensions-sdk";
import {sendConfirmAccountEmail} from "../send-email";

export default defineEndpoint((router, {services, database}) => {
  const {UsersService, RolesService} = services;
  const adminAccountability = {
    admin: true
  };

  router.post("/new", async (req: any, res: any) => {
    const userService = new UsersService({knex: database, schema: req.schema, accountability: adminAccountability});

    const userId = req.accountability.user;

    const user = await userService.readOne(userId);

    if (user.email_confirmed) {
      return res.json({
        result: false,
        statusCode: 101,
        message: "Email already verified"
      });
    }

    const newUserData = await sendConfirmAccountEmail(services, user, req.schema, database);

    const userDataToUpdate = {
      confirm_token: newUserData.confirm_token,
      confirm_token_create_date: newUserData.confirm_token_create_date
    };

    await userService.updateOne(userId, userDataToUpdate);

    return res.json({
      result: true,
      statusCode: 100,
      message: null
    });
  });

  router.post("/", async (req: any, res: any) => {

    try {
      const token = req.query.t;

      if (!token) {
        return res.status(400).send("Missing token");
      }

      const userService = new UsersService({
        knex: database,
        schema: req.schema,
        accountability: adminAccountability
      });

      const users = await userService
        .readByQuery({
          fields: ["*", "role.name"],
          filter: {
            confirm_token: {
              _eq: token
            }
          }
        });

      const user = users.length > 0 ? users[0] : null;

      if (!user) {
        return res.json({
          result: false,
          statusCode: 101,
          message: "Unknown token"
        });
      }

      if (user.email_confirmed) {
        return res.json({
          result: false,
          statusCode: 102,
          message: "You have already confirmed your email address"
        });
      }

      const now = Date.now();
      const then = new Date(user.confirm_token_create_date).getTime();
      const expireTimeMs = 24 * 60 * 60 * 1000; // 24 hours

      if (now - then > expireTimeMs) {
        return res.json({
          result: false,
          statusCode: 103,
          message: "This email confirmation link has has expired"
        });
      }


      const userUpdateFields = {
        email_confirmed: true
      };

      if (user.role.name === "Unverified") {
        const rolesService = new RolesService({
          knex: database,
          schema: req.schema,
          accountability: adminAccountability
        });
        const unapprovedRole = await getRole("Unapproved", rolesService);
        userUpdateFields.role = unapprovedRole.id;
      }

      await userService.updateOne(user.id, userUpdateFields);

      return res.json({
        result: true,
        statusCode: 100,
        message: null
      });
    } catch (e) {
      console.error("something went wrong confirming an email", e);
      return res.json({
        result: false,
        statusCode: 150,
        message: "Something broke"
      });
    }
  });
});

async function getRole(name: string, rolesService: any) {
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
