import {AdminAccountability} from "./utils";

export async function review(req: any, res: any, services: any, database: any) {
  const {
    ItemsService,
    MailService
  } = services;

  try {
    const eventId = req.body.event;
    const result = req.body.result;
    const notes = req.body.notes;
    const userId = req.accountability.user;

    if (!eventId) {
      return res.status(400).send("Missing event id");
    }

    if (!result) {
      return res.status(400).send("Missing review result");
    }

    const eventsService = new ItemsService("events", {
      knex: database,
      schema: req.schema,
      accountability: AdminAccountability
    });

    console.log("getting event");
    const event = await eventsService.readOne(eventId, {
      fields: ["*", "user_created.email"]
    });
    console.log("got event", event);

    if (!event) {
      console.error("Unable to review unknown event");
      return res.status(400).send("Unknown event");
    }

    const reviewersService = new ItemsService("reviewers", {
      knex: database,
      schema: req.schema,
      accountability: AdminAccountability
    });

    console.log("getting reviewers");
    const reviewers = await reviewersService.readByQuery({
      fields: ["user.id"],
      filter: {
        area: {
          _eq: "events"
        }
      }
    });

    if (!reviewers || reviewers.length === 0) {
      console.error("No reviewers found");
      return res.status(400).send("No event reviewers found");
    }

    console.log("got reviewers", reviewers);
    const approver = reviewers.find((a: any) => a.user.id === userId);
    console.log("got approver", approver);

    if (!approver) {
      console.error(`User is not allowed to review event: ${userId}`);
      return res.status(401).send("Not allowed to approve events");
    }

    const createdBy = event.user_created;

    const mailService = new MailService({schema: req.schema, knex: database});

    let status = event.status;
    const eventUrl = `${process.env.PUBLIC_URL}/events/${event.id}`;

    if (result === "approve") {
      console.log(`event ${event.title} (${event.id}) approved by ${userId}`);
      status = "published";

      await mailService.send({
        to: createdBy.email,
        from: `events@${process.env.EMAIL_DOMAIN}`,
        subject: `Event approved: ${event.title}`,
        template: {
          name: "event-approved",
          data: {
            eventTitle: event.title,
            eventUrl
          }
        }
      });

    } else if (result === "reject") {
      console.log(`event ${event.title} (${event.id}) rejected by ${userId}`);
      status = "draft";

      await mailService.send({
        to: createdBy.email,
        from: `events@${process.env.EMAIL_DOMAIN}`,
        subject: `Event not approved: ${event.title}`,
        template: {
          name: "event-rejected",
          data: {
            eventTitle: event.title,
            eventUrl,
            notes
          }
        }
      });
    } else {
      console.error(`Unknown review result specified: ${result}`);
      return res.status(400).send(`Unknown review result: ${result}`);
    }

    await eventsService.updateOne(eventId, {
      status,
      reviewed_by: approver.user.id,
      review_notes: notes
    });

    return res.send("ok");
  } catch (err: any) {
    console.error("Error reviewing events", err);
    return res.status(500).send("Error reviewing event");
  }
}
