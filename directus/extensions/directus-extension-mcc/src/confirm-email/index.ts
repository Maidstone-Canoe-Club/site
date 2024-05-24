import {defineEndpoint} from "@directus/extensions-sdk";
import {sendConfirmAccountEmail} from "../send-email";

export default defineEndpoint((router, {services, database}) => {
  const {UsersService, RolesService} = services;
  const adminAccountability = {
    admin: true
  };

  router.post("/new", async (req: any, res: any) => {
    try {
      const token = req.query.t;
      console.log("Trying to send new confirm email link");

      if (!token) {
        console.error("Cannot confirm email, missing token");
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
        console.error(`Could not find send new confirmation link email, could not find user using token: ${token}`);
        return res.json({
          result: false,
          statusCode: 102,
          message: "Unknown token"
        });
      }

      if (user.email_confirmed) {
        console.warn("Will not send new confirmation link email, user already confirmed");
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

      await userService.updateOne(user.id, userDataToUpdate);

      console.log("sent new confirmation link email to user", user.id);
      return res.json({
        result: true,
        statusCode: 100,
        message: null
      });
    } catch (err: any) {
      console.error("Error sending new confirmation link email to user", err);
      return res.status(500).send("Unable to send new confirmation link email");
    }
  });

  router.post("/", async (req: any, res: any) => {

    try {
      const token = req.query.t;
      console.log("Trying to confirm email");

      if (!token) {
        console.error("Cannot confirm email, missing token");
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
        console.error(`Cannot confirm email, unknown token used: ${token}`);
        return res.json({
          result: false,
          statusCode: 101,
          message: "Unknown token"
        });
      }

      if (user.email_confirmed) {
        console.warn("Cannot confirm email that has already been confirmed");
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
        console.log("Cannot confirm email, confirmation link expired");
        return res.json({
          result: false,
          statusCode: 103,
          message: "This email confirmation link has has expired"
        });
      }


      const userUpdateFields: any = {
        email_confirmed: true
      };

      if (user.role.name === "Unverified") {
        console.log("User is unverified, changing role to unapproved");
        try {
          const rolesService = new RolesService({
            knex: database,
            schema: req.schema,
            accountability: adminAccountability
          });
          const unapprovedRole = await getRole("Unapproved", rolesService);
          userUpdateFields.role = unapprovedRole.id;
          console.log("User role changed to unapproved");
        } catch (err: any) {
          console.error("Unable to switch user role", err);
        }
      }

      await userService.updateOne(user.id, userUpdateFields);

      console.log(`User email confirmed with token: ${token}`);
      return res.json({
        result: true,
        statusCode: 100,
        message: null
      });
    } catch (e: any) {
      console.error("Something went wrong confirming an email", e);
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
