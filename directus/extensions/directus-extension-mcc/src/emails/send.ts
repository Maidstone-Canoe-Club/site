import {chunkArray, sendBatchEmail} from "../send-email";

export async function send(req: any, res: any, services: any, database: any) {
  const {
    UsersService
  } = services;

  const adminAccountability = {
    admin: true
  };

  try {
    const userId = req.accountability.user;
    const body = req.body;

    if (!userId) {
      return res.status(400).send("missing user id");
    }

    if (!body.subject) {
      return res.status(400).send("missing subject line");
    }

    if (!body.content) {
      return res.status(400).send("missing email content");
    }

    const userService = new UsersService({
      knex: database,
      schema: req.schema,
      accountability: adminAccountability
    });

    const user = await userService.readOne(userId, {
      fields: ["*", "role.name"]
    });

    if (!user) {
      return res.status(400).send("user not found");
    }

    const allowedRoles = ["committee", "administrator"];

    if (!allowedRoles.includes(user.role.name.toLowerCase())) {
      return res.status(401).send("not allowed to send emails");
    }

    const users = await userService.readByQuery({
      fields: [
        "id",
        "email",
        "role.name",
        "parent.email"
      ],
      filter: {
        role: {
          name: {
            _in: ["Member", "Committee", "Administrator", "Coach", "Junior"]
          }
        }
      },
      limit: -1,
    });

    if (!users || users.length === 0) {
      return res.status(400).send("error getting user count");
    }

    let unableToSendCount = 0;
    const emailAddresses = [];

    for (const user of users) {
      if (user.role.name === "Junior") {
        if (user.parent) {
          if (!user.parent.email) {
            console.warn(`Found user with no email: ${user.id}`);
            unableToSendCount++;
          } else {
            emailAddresses.push(user.parent.email);
          }
        } else {
          console.warn(`Found a junior with no parent when trying to send email: ${user.id}`);
          unableToSendCount++;
        }
      } else {
        if (!user.email) {
          console.warn(`Found user with no email: ${user.id}`);
          unableToSendCount++;
        } else {
          emailAddresses.push(user.email);
        }
      }
    }

    console.log(`user ${userId} is sending an email to ${emailAddresses.length} users`);

    const addressesChunks = chunkArray(emailAddresses, 50);

    for (const chunk of addressesChunks) {
      const emailsToSend = [];

      for (const address of chunk) {
        emailsToSend.push({
          To: address,
          From: `notifications@${process.env.EMAIL_DOMAIN}`,
          Subject: body.subject,
          HtmlBody: body.content,
          TrackOpens: true,
          MessageStream: "broadcast"
        });
      }

      await sendBatchEmail(emailsToSend);
    }

    return res.send({
      sentToCount: emailAddresses.length,
      unableToSendCount
    });
  } catch (e) {
    console.error("error sending email to users", e);
    return res.status(500).send("error sending email to users");
  }
}
