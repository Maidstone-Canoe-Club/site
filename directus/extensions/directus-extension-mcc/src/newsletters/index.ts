import {defineEndpoint} from "@directus/extensions-sdk";

export default defineEndpoint((router, {services, database}) => {
  const {
    ItemsService,
  } = services;

  const adminAccountability = {
    admin: true
  };

  router.post("/subscribe", async (req, res) => {
    try {
      const data = req.body;

      if (!data) {
        return res.status(400).send("missing data");
      }

      const newsletterSubscriberService = new ItemsService("newsletter_subscriber", {knex: database, schema: req.schema, accountability: adminAccountability});

      const existingSubscriptions = await newsletterSubscriberService.readByQuery({
        filter: {
          _and: [
            {
              newsletter: {
                _eq: data.newsletter
              }
            },
            {
              email: {
                _eq: data.email
              }
            }
          ]
        }
      });

      if (existingSubscriptions && existingSubscriptions.length) {
        return res.json({
          statusCode: 101,
          result: false,
          message: "You are already subscribed to that newsletter"
        });
      }

      await newsletterSubscriberService.createOne({
        newsletter: data.newsletter,
        email: data.email,
        user: data.user
      });

      return res.json({
        statusCode: 100,
        result: true,
      });
    } catch (e) {
      console.error("error subscribing to newsletter", e);
      return res.status(500).send("error subscribing to newsletter");
    }
  });
});
