import {defineEndpoint} from "@directus/extensions-sdk";

export default defineEndpoint((router, {services, database}) => {
  const {
    ItemsService,
    UsersService
  } = services;

  const adminAccountability = {
    admin: true
  };

  router.get("/data", async (req, res) => {

    try {
      const eventId = req.query.eventId;
      const userId = req.query.userId;

      if (!eventId) {
        return res.status(400).send("missing event id");
      }

      if (!userId) {
        return res.status(400).send("missing user id");
      }

      const eventsService = new ItemsService("events", { knex: database,  schema: req.schema,  accountability: adminAccountability });
      const usersService = new UsersService({knex: database, schema: req.schema, accountability: adminAccountability});

      const event = await eventsService.readOne(eventId);

      if(!event){
        return res.status(404).send("could not load event");
      }

      const user = await usersService.readOne(userId);

      if(!user){
        return res.status(404).send("could not load user");
      }

      return res.json({
        event,
        user
      });
    } catch (e) {
      console.error("error loading checkout data", e);
      return res.status(500).send("error loading checkout data");
    }
  });

});
