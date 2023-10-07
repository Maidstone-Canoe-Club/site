import {defineEndpoint} from "@directus/extensions-sdk";
import {ofetch} from "ofetch";

const postmarkUrl = "https://api.postmarkapp.com";


export default defineEndpoint((router, {services, database}) => {
  const {ItemsService} = services;

  const adminAccountability = {
    admin: true
  };

  router.post("/send", async (req, res) => {
    try {
      type Invite = {
          first_name: string,
          last_name: string,
          id: string,
          email: string
      }

      const invites: Invite[] = req.body.invites;
      const email = req.body.email;

      if(!req.accountability.admin){
        return res.status(401).send("not allowed");
      }

      if (!invites) {
        return res.status(400).send("missing invites");
      }

      if (!email) {
        return res.status(400).send("missing email");
      }

      const from = `Maidstone Canoe Club <invite@${process.env.EMAIL_DOMAIN}>`;
      const inviteUrl = `${process.env.PUBLIC_URL}/register`;

      const inviteChunks = chunkArray(invites, 50);

      for (let i = 0; i < inviteChunks.length; i++) {
        const invites = inviteChunks[i];
        if (!invites) {
          continue;
        }

        const emails = [];

        for (const invite of invites) {
          let content = email.content;

          content = content.replace("{FIRST_NAME}", invite.first_name);
          content = content.replace("{LAST_NAME}", invite.last_name);

          const url = `${inviteUrl}?inviteId=${invite.id}`;
          content = content.replace("{INVITE_URL}", `<a href="${url}">${url}</a>`);

          emails.push({
            To: invite.email,
            From: from,
            Subject: email.subject,
            HtmlBody: content,
            ReplyTo: `web@${process.env.EMAIL_DOMAIN}`,
            TrackOpens: true,
            TrackLinks: "None",
            MessageStream: "outbound"
          });
        }

        await sendBatchEmail(emails);

      }
      return res.send("ok");
    } catch (e) {
      console.error("error sending invite emails", e);
      return res.status(500).send("error sending invite emails");
    }
  });

  router.post("/check", async (req, res) => {
    try {
      const email = req.body.email;
      const bcNumber = req.body.bcNumber;

      if (!email) {
        return res.status(400).send("missing email");
      }

      if (!bcNumber) {
        return res.status(400).send("missing bc number");
      }

      const itemService = new ItemsService("member_invites", {knex: database, schema: req.schema, accountability: adminAccountability});

      const foundInvites = await itemService.readByQuery({
        filter: {
          email: {
            _eq: email
          },
          bc_number: {
            _eq: bcNumber
          }
        }
      });

      if (!foundInvites || foundInvites.length === 0) {
        return res.json({
          result: false,
          statusCode: 101,
          message: "No invite found"
        });
      }

      const invite = foundInvites[0];

      if (invite.accepted) {
        return res.json({
          result: false,
          statusCode: 102,
          message: "Invite has already been accepted",
        });
      }

      return res.json({
        result: true,
        statusCode: 100,
        message: null,
        id: invite.id
      });
    } catch (e) {
      console.error("error checking invite", e);
      return res.status(500).send("error checking invite");
    }
  });

  router.get("/", async (req, res) => {
    const id = req.query.id;
    const email = req.query.email;

    console.log("got id", id, "got email", email);
    if (!id && !email) {
      return res.status(404).send();
    }

    const itemService = new ItemsService("member_invites", {knex: database, schema: req.schema, accountability: adminAccountability});

    let invite;

    if (id) {
      invite = await itemService.readOne(id);
    } else if (email) {
      const invites = await itemService.readByQuery({
        filter: {
          email: {
            _eq: email
          }
        }
      });

      invite = invites.length ? invites[0] : null;
    }

    if (!invite) {
      return res.json({
        result: false,
        statusCode: 101
      });
    }

    return res.json({
      result: true,
      statusCode: 100,
      invite: invite
    });
  });
});

async function sendBatchEmail(data: any) {
  console.log("Sending batch emails", data);

  if (process.env.IGNORE_MAIL) {
    console.log("not sending batch emails ", data.length);
    return;
  }

  return await ofetch("/email/batch", {
    method: "POST",
    baseURL: postmarkUrl,
    body: data,
    headers: {
      "X-Postmark-Server-Token": process.env.EMAIL_SMTP_PASSWORD!
    }
  }).catch((err) => {
    console.log("send mail error: ", err.data);
  });
}

function chunkArray<T>(input: T[], size: number): T[][] {
  const result: T[][] = [];

  for (let i = 0; i < input.length; i += size) {
    result.push(input.slice(i, i + size));
  }

  return result;
}
