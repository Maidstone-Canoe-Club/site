import {AdminAccountability, userHasRole} from "../../../shared/utils";

// Matches the roles the admin Users page won't let you pick
const unassignableRoles = ["administrator", "junior", "unverified"];

export async function update(req: any, res: any, services: any, database: any) {
  const {
    UsersService,
    RolesService
  } = services;

  try {
    const userToUpdate = req.body;
    const userId = req.accountability?.user;

    if (!userId) {
      return res.status(401).send("You must be logged in to update user details");
    }

    if (!userToUpdate || !userToUpdate.id) {
      return res.status(400).send("Missing user");
    }

    const userHasPermission = await userHasRole(req, services, database, userId, ["Administrator", "Committee"]);

    if (!userHasPermission) {
      return res.status(403).send("You are not allowed to update user details");
    }

    const userService = new UsersService({
      knex: database,
      schema: req.schema,
      accountability: AdminAccountability
    });

    const existingUser = await userService.readOne(userToUpdate.id).catch(() => null);
    if (!existingUser) {
      return res.status(400).send("Cannot update user that does not exist");
    }

    const canUpdateUser = !(await userHasRole(req, services, database, userToUpdate.id, ["Administrator", "Junior"]));

    if (!canUpdateUser) {
      return res.status(403).send("This user cannot be updated");
    }

    // Only the fields the admin Users page edits can be changed here
    const changes: Record<string, unknown> = {};

    if ("bc_number" in userToUpdate) {
      changes.bc_number = userToUpdate.bc_number;
    }

    if ("club_number" in userToUpdate) {
      changes.club_number = userToUpdate.club_number;
    }

    if (userToUpdate.role) {
      const rolesService = new RolesService({
        knex: database,
        schema: req.schema,
        accountability: AdminAccountability
      });

      const role = await rolesService.readOne(userToUpdate.role, {fields: ["id", "name"]}).catch(() => null);

      if (!role || unassignableRoles.includes(role.name.toLowerCase())) {
        return res.status(403).send("That role cannot be assigned here");
      }

      changes.role = role.id;
    }

    await userService.updateOne(existingUser.id, changes);
    return res.status(200).send("User updated successfully");
  } catch (err: any) {
    console.error("Error updating user from admin area", err);
    return res.status(500).send("Error updating user from admin area");
  }
}
