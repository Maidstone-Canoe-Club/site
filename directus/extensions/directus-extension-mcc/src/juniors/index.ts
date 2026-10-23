import {defineEndpoint} from "@directus/extensions-sdk";

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

// Only these medical fields can be set from the profile page, and the record always belongs to the junior
function pickMedicalInfo(medicalInfo: any, juniorId: string) {
  return {
    allergies: medicalInfo.allergies,
    asthma: medicalInfo.asthma,
    epilepsy: medicalInfo.epilepsy,
    diabetes: medicalInfo.diabetes,
    other: medicalInfo.other,
    details: medicalInfo.details,
    first_aid_consent: medicalInfo.first_aid_consent,
    photography_consent: medicalInfo.photography_consent,
    user: juniorId
  };
}

export default defineEndpoint((router, {services, database}) => {
  const {
    UsersService,
    RolesService,
    ItemsService
  } = services;

  const adminAccountability = {
    admin: true
  };

  router.post("/update", async (req: any, res: any) => {
    try {
      const loggedInUserId = req.accountability?.user;
      const juniorUser = req.body.user;

      if (!loggedInUserId) {
        return res.status(401).send("You must be logged in to update a junior");
      }

      if (!juniorUser || !juniorUser.id) {
        return res.status(400).send("missing user");
      }

      const usersService = new UsersService({
        knex: database,
        schema: req.schema,
        accountability: adminAccountability
      });

      const existingJunior = await usersService.readOne(juniorUser.id, {
        fields: ["id", "parent", "role.name"]
      }).catch(() => null);

      // Parents can only edit their own juniors
      if (!existingJunior || existingJunior.role?.name !== "Junior" || existingJunior.parent !== loggedInUserId) {
        return res.status(403).send("You are not allowed to update that junior");
      }

      // TODO: might need email address
      const juniorId = await usersService.updateOne(existingJunior.id, {
        first_name: juniorUser.first_name,
        last_name: juniorUser.last_name,
        dob: juniorUser.dob,
        bc_number: juniorUser.bc_number
      });

      if (juniorUser.medicalInformation?.hasData) {
        const medicalInfoService = new ItemsService("medical_info", {
          knex: database,
          schema: req.schema,
          accountability: adminAccountability
        });
        const medicalInfo = pickMedicalInfo(juniorUser.medicalInformation, juniorId);

        // Look the record up by the junior rather than trusting the id that was sent
        const existingMedicalInfo = await medicalInfoService.readByQuery({
          fields: ["id"],
          filter: {
            user: {
              _eq: juniorId
            }
          },
          limit: 1
        });

        if (existingMedicalInfo && existingMedicalInfo.length) {
          await medicalInfoService.updateOne(existingMedicalInfo[0].id, medicalInfo);
        } else {
          await medicalInfoService.createOne(medicalInfo);
        }
      }

      return res.send(juniorId);
    } catch (err: any) {
      console.error("Error updating junior details", err);
      return res.status(500).send("Error updating junior details");
    }
  });

  router.post("/create", async (req: any, res: any) => {
    try{
      const loggedInUserId = req.accountability?.user;
      const juniorUser = req.body.user;

      if (!loggedInUserId) {
        return res.status(401).send("You must be logged in to add a junior");
      }

      if (!juniorUser) {
        return res.status(400).send("missing user");
      }

      const rolesService = new RolesService({
        knex: database,
        schema: req.schema,
        accountability: adminAccountability
      });

      const juniorRole = await getRole("Junior", rolesService);

      if (!juniorRole) {
        console.error("could not find junior role");
        return res.status(400).send("could not find junior role");
      }

      const usersService = new UsersService({
        knex: database,
        schema: req.schema,
        accountability: adminAccountability
      });

      const newUserId = await usersService.createOne({
        first_name: juniorUser.first_name,
        last_name: juniorUser.last_name,
        dob: juniorUser.dob,
        // A junior is always added by their own parent
        parent: loggedInUserId,
        role: juniorRole.id,
        bc_number: juniorUser.bc_number,
        email_confirmed: true
      });

      if (juniorUser.medicalInformation?.hasData) {
        const medicalInfoService = new ItemsService("medical_info", {
          knex: database,
          schema: req.schema,
          accountability: adminAccountability
        });
        await medicalInfoService.createOne(pickMedicalInfo(juniorUser.medicalInformation, newUserId));
      }

      return res.send(newUserId);
    } catch (err: any) {
      console.error("Error creating junior", err);
      return res.status(500).send("Error creating junior");
    }
  });
});
