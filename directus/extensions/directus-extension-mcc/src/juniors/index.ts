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

export default defineEndpoint((router, {services, database}) => {
  const {
    UsersService,
    RolesService,
    ItemsService
  } = services;

  const adminAccountability = {
    admin: true
  };

  router.post("/update", async (req, res) => {
    const juniorUser = req.body.user;

    if (!juniorUser) {
      return res.status(400).send("missing user");
    }

    const usersService = new UsersService({knex: database, schema: req.schema, accountability: adminAccountability});

    // TODO: might need email address
    const newUserId = await usersService.updateOne( juniorUser.id, {
      first_name: juniorUser.first_name,
      last_name: juniorUser.last_name,
      dob: juniorUser.dob,
      parent: juniorUser.parentId,
    });

    if(juniorUser.medicalInformation.hasData) {
      const medicalInfoService = new ItemsService("medical_info", {knex: database, schema: req.schema, accountability: adminAccountability});
      juniorUser.medicalInformation.user = newUserId;
      await medicalInfoService.updateOne(juniorUser.medicalInformation.id, juniorUser.medicalInformation);
    }

    return res.send(newUserId);
  });

  router.post("/create", async (req, res) => {
    const juniorUser = req.body.user;

    if (!juniorUser) {
      return res.status(400).send("missing user");
    }

    const rolesService = new RolesService({knex: database, schema: req.schema, accountability: adminAccountability});

    const juniorRole = await getRole("Junior", rolesService);

    if (!juniorUser) {
      console.error("could not find junior role");
      return res.status(400).send("could not find junior role");
    }

    const usersService = new UsersService({knex: database, schema: req.schema, accountability: adminAccountability});

    // TODO: might need email address
    const newUserId = await usersService.createOne({
      first_name: juniorUser.first_name,
      last_name: juniorUser.last_name,
      dob: juniorUser.dob,
      parent: juniorUser.parentId,
      role: juniorRole.id,
      email_confirmed: true
    });

    if(juniorUser.medicalInformation.hasData) {
      const medicalInfoService = new ItemsService("medical_info", {knex: database, schema: req.schema, accountability: adminAccountability});
      juniorUser.medicalInformation.user = newUserId;
      await medicalInfoService.createOne(juniorUser.medicalInformation);
    }

    return res.send(newUserId);
  });
});
