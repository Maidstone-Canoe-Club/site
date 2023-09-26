import {defineEndpoint} from "@directus/extensions-sdk";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_KEY);

export default defineEndpoint((router, {services, database}) => {
  const {
    ItemsService,
    UsersService
  } = services;

  const adminAccountability = {
    admin: true
  };

  router.get("/customer", async (req, res) => {
    try {
      const loggedIn = req.accountability.user;
      const userId = req.query.userId;

      if (!loggedIn) {
        return res.status(401);
      }

      if(!userId){
        return res.status(400).send("missing user id");
      }

      const customersService = new ItemsService("stripe_customers", {knex: database, schema: req.schema, accountability: adminAccountability});

      const existingCustomers = await customersService
        .readByQuery({
          filter: {
            user: {
              _eq: userId
            }
          }
        });

      const customer = existingCustomers && existingCustomers.length
        ? existingCustomers[0]
        : null;

      if (customer) {
        return res.send(customer.customer_id);
      }

      const usersService = new UsersService({knex: database, schema: req.schema, accountability: adminAccountability});

      const user = await usersService.readOne(userId);

      const newCustomer = await stripe.customers.create({
        name: `${user.first_name} ${user.last_name}`,
        email: user.email
      });

      await customersService.createOne({
        customer_id: newCustomer.id,
        user: userId
      });

      return res.send(newCustomer.id);
    } catch (e) {
      console.error("error getting or creating stripe customer", e);
      return res.status(500).send("error getting or creating customer");
    }
  });

  router.post("/data", async (req, res) => {

    try {
      const eventId = req.query.eventId;
      const userIds = req.body.userIds;

      if (!eventId) {
        return res.status(400).send("missing event id");
      }

      if (!userIds || !userIds.length) {
        return res.status(400).send("missing user ids");
      }

      const eventsService = new ItemsService("events", {knex: database, schema: req.schema, accountability: adminAccountability});
      const usersService = new UsersService({knex: database, schema: req.schema, accountability: adminAccountability});

      const event = await eventsService.readOne(eventId);

      if (!event) {
        return res.status(404).send("could not load event");
      }

      const users = await usersService.readByQuery({
        fields: ["*", "role.name"],
        filter: {
          id: {
            _in: userIds
          }
        }
      });

      if (!users) {
        return res.status(404).send("could not load users");
      }

      return res.json({
        event,
        users
      });
    } catch (e) {
      console.error("error loading checkout data", e);
      return res.status(500).send("error loading checkout data");
    }
  });

});
