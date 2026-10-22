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

  // A logged in user can book themselves and their juniors
  async function canBookFor(req: any, userIds: string[]) {
    const loggedIn = req.accountability.user;
    const others = userIds.filter(id => id !== loggedIn);

    if (!others.length) {
      return true;
    }

    const usersService = new UsersService({knex: database, schema: req.schema, accountability: adminAccountability});
    const juniors = await usersService.readByQuery({
      fields: ["id"],
      filter: {
        _and: [
          {
            id: {
              _in: others
            }
          },
          {
            parent: {
              _eq: loggedIn
            }
          }
        ]
      },
      limit: -1
    });

    return juniors.length === new Set(others).size;
  }

  router.get("/customer", async (req, res) => {
    try {
      const loggedIn = req.accountability?.user;
      const userId = req.query.userId;

      if (!loggedIn) {
        return res.status(401).send("not logged in");
      }

      if(!userId){
        return res.status(400).send("missing user id");
      }

      if (userId !== loggedIn) {
        return res.status(403).send("not allowed");
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
      const userIds: string[] = [req.body.userIds ?? []].flat();

      if (!req.accountability?.user) {
        return res.status(401).send("not logged in");
      }

      if (!eventId) {
        return res.status(400).send("missing event id");
      }

      if (!userIds.length) {
        return res.status(400).send("missing user ids");
      }

      if (!(await canBookFor(req, userIds))) {
        return res.status(403).send("not allowed to book for those users");
      }

      const eventsService = new ItemsService("events", {knex: database, schema: req.schema, accountability: adminAccountability});
      const usersService = new UsersService({knex: database, schema: req.schema, accountability: adminAccountability});

      const event = await eventsService.readOne(eventId);

      if (!event) {
        return res.status(404).send("could not load event");
      }

      // Just what pricing needs
      const users = await usersService.readByQuery({
        fields: ["id", "role.name", "bc_number", "is_coach"],
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
