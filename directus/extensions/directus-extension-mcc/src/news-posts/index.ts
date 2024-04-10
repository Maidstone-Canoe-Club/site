import {defineEndpoint} from "@directus/extensions-sdk";
import {nanoid} from "nanoid";

export default defineEndpoint((router, {services, database, logger}) => {
  const {
    ItemsService,
    UsersService
  } = services;
  const adminAccountability = {
    admin: true
  };

  router.post("/create", async (req: any, res: any) => {
    try {
      const userId = req.accountability.user;
      const data = req.body.data;

      if (!userId) {
        return res.status(401).send("Missing user");
      }

      if (!data) {
        return res.status(400).send("Missing data");
      }

      const userService = new UsersService({
        knex: database,
        schema: req.schema,
        accountability: adminAccountability
      });

      const user = await userService.readOne(userId, {
        fields: ["id", "trusted_user", "role.name"]
      });

      if (!user) {
        return res.status(400).send("Unknown user");
      }

      const allowedRoles = ["coach", "committee"];
      const hasRole = allowedRoles.includes(user.role.name.toLowerCase());
      const isTrusted = user.trusted_user;

      if (!hasRole && !isTrusted) {
        logger.info(`User is not allowed to create a news post: ${userId}`);
        return res.status(401).send("Unauthorized");
      }

      const newsService = new ItemsService("news", {
        knex: database,
        schema: req.schema,
        accountability: adminAccountability
      });

      const newId = await newsService.createOne(data);

      await newsService.updateOne(newId, {
        user_created: {
          id: userId
        }
      });

      return res.send({
        id: newId
      });
    } catch (err: any) {
      logger.error(err, "An error occured when creating news post");
      return res.status(500).send("An error occured when creating a news post");
    }
  });

  router.post("/subscribe", async (req: any, res: any) => {
    const userId = req.accountability.user;

    try {
      if (!userId) {
        return res.status(401).send("Invalid user");
      }

      const subscribersService = new ItemsService("news_subscribers", {
        knex: database,
        schema: req.schema,
        accountability: req.accountability
      });

      const previous = await subscribersService.readByQuery({
        fields: ["user.id", "id"],
        filter: {
          user: {
            _eq: userId
          }
        }
      });

      if (previous?.length) {
        logger.warn("User has already subscribed to news posts");
        return res.send(200).send(false);
      }

      const newId = await subscribersService.createOne({
        user: {
          id: userId
        },
        unsubscribe_token: nanoid(34)
      });

      return res.status(200).send(!!newId);
    } catch (err) {
      logger.error(err, "An error occured when subscribing a user to news posts.");
      return res.status(500).send("An error occured when subscribing a user to news posts.");
    }
  });

  router.post("/unsubscribe", async (req: any, res: any) => {
    const userId = req.accountability.user;

    console.log("user id:", userId);

    try {
      if (userId) {
        const subscribersService = new ItemsService("news_subscribers", {
          knex: database,
          schema: req.schema,
          accountability: req.accountability
        });

        console.log("loading subs");

        const subscribers = await subscribersService.readByQuery({
          fields: ["user.id", "id"],
          filter: {
            user: {
              _eq: userId
            }
          }
        });

        console.log("found " + subscribers.length + " subscribers");

        if (subscribers?.length) {
          console.log("deleting many", subscribers);
          await subscribersService.deleteMany(subscribers.map((x: any) => x.id));
        }

        return res.status(200).send(true);
      } else {
        console.log("we don't have a user");
        const id = req.body.id;
        const token = req.body.token;

        console.log("here", id, token);

        if (!id) {
          return res.status(400).send("Missing id");
        }

        if (!token) {
          return res.status(400).send("Missing token");
        }

        const subscribersService = new ItemsService("news_subscribers", {
          schema: req.schema,
          accountability: adminAccountability
        });

        const subscriber = await subscribersService.readOne(id);

        if (subscriber.unsubscribe_token !== token) {
          return res.status(401).send("Invalid token");
        }

        await subscribersService.deleteOne(id);

        return res.status(200).send(true);
      }
    } catch (e) {
      logger.error(e, "An error occured unsubscribing a user from news posts");
      return res.status(500).send("An error occured unsubscribing a user from news posts");
    }
  });

  router.get("/check", async (req: any, res: any) => {
    const userId = req.accountability.user;

    console.log("checking user", userId);

    try {
      if (userId) {
        const subscribersService = new ItemsService("news_subscribers", {
          knex: database,
          schema: req.schema,
          accountability: req.accountability
        });

        const subscribers = await subscribersService.readByQuery({
          fields: ["user.id"],
          filter: {
            user: {
              _eq: userId
            }
          }
        });

        const hasSubscribers = subscribers && subscribers.length > 0;

        console.log("found subscribers", subscribers, hasSubscribers);

        return res.status(200).send(hasSubscribers);
      }
    } catch (e) {
      logger.error(e, "An error occured checking users news subscription status");
      return res.status(500).send("An error occured checking users news subscription status");
    }

    return res.status(200).send(false);
  });

});

