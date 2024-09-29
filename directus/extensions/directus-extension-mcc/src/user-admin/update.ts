import {AdminAccountability, userHasRole} from "../utils";

export async function update(req: any, res: any, services: any, database: any) {
    const {
        UsersService
    } = services;

    try {
        const userToUpdate = req.body;
        const userId = req.accountability.user;

        if (!userToUpdate) {
            return res.status(400).send("Missing user");
        }

        const userHasPermission = await userHasRole(req, services, database, userId, ["Administrator", "Committee"]);

        if (!userHasPermission) {
            return res.status(401).send("You are not allowed to update user details");
        }

        const userService = new UsersService({
            knex: database,
            schema: req.schema,
            accountability: AdminAccountability
        });

        const existingUser = await userService.readOne(userToUpdate.id);
        if (!existingUser) {
            return res.status(400).send("Cannot update user that does not exist");
        }

        const canUpdateUser = !(await userHasRole(req, services, database, userToUpdate.id, ["Administrator", "Unverified", "Junior"]));

        if (!canUpdateUser) {
            return res.status(401).send("This user cannot be updated");
        }

        await userService.updateOne(userToUpdate.id, userToUpdate);
        return res.status(200).send("User updated successfully");
    } catch (err: any) {
        onsole.error("Error updating user from admin area", err);
        return res.status(500).send("Error updating user from admin area");
    }
}
