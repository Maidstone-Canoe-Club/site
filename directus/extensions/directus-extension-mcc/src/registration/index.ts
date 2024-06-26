﻿import {defineEndpoint} from "@directus/extensions-sdk";
import {nanoid} from "nanoid";

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

export default defineEndpoint((router, {services, database, logger}) => {
  const {
    ItemsService,
    RolesService,
    UsersService
  } = services;

  const adminAccountability = {
    admin: true
  };

  router.get("/check", async (req: any, res: any) => {
    try {
      const email = req.query.email;

      if (!email) {
        return res.status(400).send("missing email");
      }

      const usersService = new UsersService({
        knex: database,
        schema: req.schema,
        accountability: adminAccountability
      });

      const existing = await usersService.readByQuery({
        filter: {
          email: {
            _eq: email
          }
        }
      });

      if (existing && existing.length) {
        return res.json({
          result: false,
          statusCode: 101,
          message: "That email address is already in use"
        });
      }

      return res.json({
        result: true,
        statusCode: 100,
      });

    } catch (e) {
      logger.error(e, "error checking if email is already in use");
      return res.status(500).send("error checking if email is already in use");
    }
  });

  router.post("/", async (req: any, res: any) => {
    try {
      const user = req.body.user;
      const inviteId = req.body.inviteId;
      const newsPostNotifications = req.body.newsPostNotifications;
      const emergencyContacts = req.body.emergencyContacts;
      const medicalInfo = req.body.medicalInfo;

      if (!user) {
        return res.status(400).send("missing user");
      }

      if (!emergencyContacts || !emergencyContacts.length) {
        return res.status(400).send("missing emergency contacts");
      }

      if (!medicalInfo) {
        return res.status(400).send("missing medical info");
      }

      const rolesService = new RolesService({
        knex: database,
        schema: req.schema,
        accountability: adminAccountability
      });

      if (inviteId) {
        const memberRole = await getRole("Member", rolesService);
        user.role = memberRole.id;
      } else {
        const unverifiedRole = await getRole("Unverified", rolesService);
        user.role = unverifiedRole.id;
      }

      user.last_med_check = new Date();

      const usersService = new UsersService({
        knex: database,
        schema: req.schema,
        accountability: adminAccountability
      });

      const newUserId = await usersService.createOne(user);

      medicalInfo.user = newUserId;
      for (let i = 0; i < emergencyContacts.length; i++) {
        emergencyContacts[i].user = newUserId;
      }

      const emergencyContactsService = new ItemsService("emergency_contacts", {
        knex: database,
        schema: req.schema,
        accountability: adminAccountability
      });
      await emergencyContactsService.createMany(emergencyContacts);

      const medicalInfoService = new ItemsService("medical_info", {
        knex: database,
        schema: req.schema,
        accountability: adminAccountability
      });
      await medicalInfoService.createOne(medicalInfo);

      if (inviteId) {
        const inviteService = new ItemsService("member_invites", {
          knex: database,
          schema: req.schema,
          accountability: adminAccountability
        });
        const invite = await inviteService.readOne(inviteId);
        invite.accepted = true;
        await inviteService.updateOne(inviteId, invite);
      }

      if (newsPostNotifications) {
        const subscribersService = new ItemsService("news_subscribers", {
          knex: database,
          schema: req.schema,
          accountability: adminAccountability
        });

        await subscribersService.createOne({
          user: {
            id: newUserId
          },
          unsubscribe_token: nanoid(34)
        });
      }

      return res.send(newUserId);
    } catch (e) {
      logger.error(e, "error registering new user");
      return res.status(500).send("error registering new user");
    }
  });
});
