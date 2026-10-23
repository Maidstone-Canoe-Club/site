import {defineEndpoint} from "@directus/extensions-sdk";
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

function lowerCase(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

// Only the fields the registration form collects can be set; anything else in the request is ignored
function pickUser(user: any) {
  return {
    email: user.email,
    password: user.password,
    bc_number: user.bc_number,
    club_number: user.club_number,
    first_name: user.first_name,
    last_name: user.last_name,
    dob: user.dob,
    home_tel: user.home_tel,
    mobile: user.mobile,
    street_address: user.street_address,
    city: user.city,
    county: user.county,
    postcode: user.postcode
  };
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

      if (!user || !user.email || !user.password) {
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

      const inviteService = new ItemsService("member_invites", {
        knex: database,
        schema: req.schema,
        accountability: adminAccountability
      });

      const newUser: any = pickUser(user);

      // An invite skips approval, so it has to be real, unused and for the email address being registered.
      // Otherwise the user goes through the normal confirm-and-approve route
      let invite = null;
      if (inviteId) {
        invite = await inviteService.readOne(inviteId, {
          fields: ["id", "email", "accepted", "bc_number", "club_number"]
        }).catch(() => null);

        if (!invite || invite.accepted || lowerCase(invite.email) !== lowerCase(newUser.email)) {
          logger.warn(`Ignoring invite ${inviteId} for registration, it is missing, already accepted or for another email address`);
          invite = null;
        }
      }

      if (invite) {
        const memberRole = await getRole("Member", rolesService);
        newUser.role = memberRole.id;
        newUser.bc_number = invite.bc_number ?? newUser.bc_number;
        newUser.club_number = invite.club_number ?? newUser.club_number;
      } else {
        const unverifiedRole = await getRole("Unverified", rolesService);
        newUser.role = unverifiedRole.id;
      }

      newUser.last_med_check = new Date();

      const usersService = new UsersService({
        knex: database,
        schema: req.schema,
        accountability: adminAccountability
      });

      const newUserId = await usersService.createOne(newUser);

      const emergencyContactsService = new ItemsService("emergency_contacts", {
        knex: database,
        schema: req.schema,
        accountability: adminAccountability
      });
      await emergencyContactsService.createMany(emergencyContacts.map((contact: any) => ({
        full_name: contact.full_name,
        contact_number: contact.contact_number,
        user: newUserId
      })));

      const medicalInfoService = new ItemsService("medical_info", {
        knex: database,
        schema: req.schema,
        accountability: adminAccountability
      });
      await medicalInfoService.createOne({
        allergies: medicalInfo.allergies,
        asthma: medicalInfo.asthma,
        epilepsy: medicalInfo.epilepsy,
        diabetes: medicalInfo.diabetes,
        other: medicalInfo.other,
        details: medicalInfo.details,
        first_aid_consent: medicalInfo.first_aid_consent,
        photography_consent: medicalInfo.photography_consent,
        user: newUserId
      });

      if (invite) {
        await inviteService.updateOne(invite.id, {accepted: true});
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
