import {defineEndpoint} from "@directus/extensions-sdk";
import {InboundEmail} from "../types";
import {extractForwardTarget, handleMailForward} from "../mail-forwards";

export default defineEndpoint((router, {services, database}) => {
  const {
    ItemsService,
  } = services;

  const adminAccountability = {
    admin: true
  };

  router.post("/", async (req, res) => {
    try {
      const data = req.body;

      console.log("got contact us message:", data);

      if (!data) {
        return res.status(400).send("missing data");
      }

      const contactUsService = new ItemsService("contact_us_message", {knex: database, schema: req.schema, accountability: adminAccountability});

      await contactUsService.createOne({
        from_name: data.fromName,
        from_email: data.fromEmail,
        to: data.to.id,
        subject: data.subject,
        message: data.message
      });

      const mailForwardsService = new ItemsService("mail_forwards", {knex: database, schema: req.schema, accountability: adminAccountability});

      const forward = await mailForwardsService.readOne(data.to.send_to);

      if (!forward) {
        return res.status(500).send("unknown mail forward");
      }

      const extractedForwards = await extractForwardTarget(forward.name, mailForwardsService);
      const extractedForward = extractedForwards && extractedForwards.length ? extractedForwards[0] : null;

      if (!extractedForward) {
        return res.status(500).send("could not extract mail forward target");
      }

      const mailThreadsService = new ItemsService("mail_threads", {knex: database, schema: req.schema, accountability: adminAccountability});

      const inboundEmail: InboundEmail = {
        From: data.fromEmail,
        FromName: data.fromName,
        Subject: data.subject,
        TextBody: data.message,
        FromFull: {
          Email: data.fromEmail,
          Name: data.fromName
        }
      };

      await handleMailForward(inboundEmail, undefined, extractedForward, mailThreadsService, mailForwardsService);

      return res.send(true);
    } catch (e) {
      console.error("error creating new contact us message", e);
      return res.status(500).send("error creating new contact us message");
    }
  });
});
