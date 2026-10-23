import {defineHook} from "@directus/extensions-sdk";

// Relations that can be expanded on your own record. Anything deeper (like role.users) could reach other people
const expandableRelations = ["role", "avatar"];

function allowedFields(requested: unknown): string[] {
  const fields = Array.isArray(requested) && requested.length ? requested : ["*"];

  return fields.filter((field: string) => {
    const parts = field.split(".");
    return parts.length === 1 || (parts.length === 2 && expandableRelations.includes(parts[0]!));
  });
}

function canReadAllUserFields(accountability: any) {
  const permission = accountability.permissions?.find((p: any) => p.collection === "directus_users" && p.action === "read");
  return !!permission && permission.fields?.includes("*") && Object.keys(permission.permissions ?? {}).length === 0;
}

// Most roles can only read other users' names, which Directus also applies to /users/me. This serves your own
// record in full instead, so the website still gets your email, address and so on.
export default defineHook(({init}, {services, database, logger}) => {
  init("routes.before", ({app}: any) => {
    app.get("/users/me", async (req: any, res: any, next: any) => {
      const accountability = req.accountability;

      // Admins, shares and anyone who can read every user field get Directus's own handler
      if (!accountability?.user || accountability.admin || accountability.share || canReadAllUserFields(accountability)) {
        return next();
      }

      try {
        const usersService = new services.UsersService({
          knex: database,
          schema: req.schema,
          accountability: {admin: true}
        });

        const user = await usersService.readOne(accountability.user, {
          fields: allowedFields(req.sanitizedQuery?.fields)
        });

        return res.json({data: user});
      } catch (err) {
        logger.error(err, "Error reading the current user");
        return next(err);
      }
    });
  });
});
