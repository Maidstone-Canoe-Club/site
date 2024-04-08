import {defineEndpoint} from "@directus/extensions-sdk";
import {InboundEmail} from "../types";
import {extractForwardTarget, handleMailForward} from "../mail-forwards";

export default defineEndpoint((router, {services, database}) => {
  const {
    ItemsService,
    UsersService,
    MailService
  } = services;

  const adminAccountability = {
    admin: true
  };

  router.post("/", async (req: any, res: any) => {
    try {
      const data = req.body;

      console.log("got contact us message:", data);

      if (!data) {
        return res.status(400).send("missing data");
      }

      const contactUsService = new ItemsService("contact_us_message", {
        knex: database,
        schema: req.schema,
        accountability: adminAccountability
      });

      await contactUsService.createOne({
        from_name: data.fromName,
        from_email: data.fromEmail,
        to: data.to.id,
        subject: data.subject,
        message: data.message
      });

      const mailForwardsService = new ItemsService("mail_forwards", {
        knex: database,
        schema: req.schema,
        accountability: adminAccountability
      });

      const forward = await mailForwardsService.readOne(data.to.send_to);

      if (!forward) {
        return res.status(500).send("unknown mail forward");
      }

      const extractedForwards = await extractForwardTarget(forward.name, mailForwardsService);
      const extractedForward = extractedForwards && extractedForwards.length ? extractedForwards[0] : null;

      // TODO: possibly handle multiple forwards?
      if (!extractedForward) {
        return res.status(500).send("could not extract mail forward target");
      }

      const mailThreadsService = new ItemsService("mail_threads", {
        knex: database,
        schema: req.schema,
        accountability: adminAccountability
      });

      const mailService = new MailService({schema: req.schema, knex: database});

      const sentFromMessage = `This email was sent by ${data.fromName} (${data.fromEmail})`;

      const message = await mailService.renderTemplate("sent-from", {
        content: data.message,
        sentFromMessage
      });

      const inboundEmail: InboundEmail = {
        From: data.fromEmail,
        FromName: data.fromName,
        Subject: data.subject,
        HtmlBody: message,
        FromFull: {
          Email: data.fromEmail,
          Name: data.fromName
        }
      };

      await handleMailForward(inboundEmail, undefined, extractedForward, mailThreadsService, mailForwardsService);

      return res.send(true);
    } catch (e: any) {
      console.error("error creating new contact us message", e);
      return res.status(500).send("error creating new contact us message");
    }
  });

  router.post("/user", async (req: any, res: any) => {
    try {
      const data = req.body;

      console.log("got contact user message:", data);

      if (!data) {
        return res.status(400).send("missing data");
      }

      const userService = new UsersService({
        knex: database,
        schema: req.schema,
        accountability: adminAccountability
      });

      const user = await userService.readOne(data.userId, {
        fields: ["email"]
      });

      if (!user) {
        console.error("Unknwo user");
        return res.status(400).send("Unknown user");
      }

    } catch (err: any) {
      console.error("error creating new contact user message", err);
      return res.status(500).send("error creating new contact user message");
    }
  });
});
