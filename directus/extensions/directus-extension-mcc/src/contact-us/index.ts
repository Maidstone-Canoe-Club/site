import {defineEndpoint} from "@directus/extensions-sdk";
import {OutboundEmail} from "../types";
import {ofetch} from "ofetch";

const postmarkUrl = "https://api.postmarkapp.com";

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

      console.log("got contact us message");

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

      const contactUsOptions = new ItemsService("contact_us_options", {knex: database, schema: req.schema, accountability: adminAccountability});

      const option = await contactUsOptions.readOne(data.to.id);

      const email: OutboundEmail= {
        To: option.send_to_email,
        Subject: data.subject,
        TextBody: data.message
      };

      await sendEmail(email);

      return res.send(true);
    } catch (e) {
      console.error("error creating new contact us message", e);
      return res.status(500).send("error creating new contact us message");
    }
  });
});

async function sendEmail(email: OutboundEmail) {
  return await ofetch("/email", {
    baseURL: postmarkUrl,
    method: "POST",
    headers: {
      "X-Postmark-Server-Token": process.env.EMAIL_SMTP_PASSWORD!
    },
    body: email
  }).catch((err) => {
    console.log("send mail error: ", err.data);
  });
}
