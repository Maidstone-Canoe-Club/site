import {format} from "date-fns";
import {AdminAccountability} from "./utils";

export async function create(req: any, res: any, services: any, database: any) {
  const {
    ItemsService,
    UsersService,
    MailService
  } = services;

  try {
    const eventItem = req.body.eventItem;
    const eventDates = req.body.eventDates;
    const leaders = req.body.leaders;

    console.log("creating new event");
    console.log("event item", eventItem);
    console.log("event dates", eventDates);
    console.log("leaders", leaders);

    eventItem.status = "published";

    const loggedInUserId = req.accountability.user;
    const userService = new UsersService({
      knex: database,
      schema: req.schema,
      accountability: AdminAccountability
    });

    console.log("logged in user", loggedInUserId);

    const user = await userService.readOne(loggedInUserId, {
      fields: ["role.name"]
    });

    // roles that are allowed to create an event
    const allowedRoles = ["coach", "committee", "administrator"];
    let sendApprovalEmail = false;
    let reviewers = [];

    if (!allowedRoles.includes(user.role.name.toLowerCase())) {
      const reviewersService = new ItemsService("reviewers", {
        knex: database,
        schema: req.schema,
        accountability: AdminAccountability
      });

      reviewers = await reviewersService.readByQuery({
        fields: ["user.email"],
        filter: {
          area: {
            _eq: "events"
          }
        }
      });

      console.log("got reviewers", reviewers);

      if (!reviewers || reviewers.length === 0) {
        console.warn("No event reviewers found! Publishing event");
      } else {
        eventItem.status = "draft";
        sendApprovalEmail = true;
      }
    }

    const eventService = new ItemsService("events", {
      knex: database,
      schema: req.schema,
      accountability: req.accountability
    });

    const newEventItem = {
      ...eventItem,
      has_multiple: eventItem.occurrenceType === "multi",
      is_recurring: eventItem.occurrenceType === "recurring"
    };

    let id: string;

    if (newEventItem.occurrenceType === "single") {
      id = await createSingleEvent(newEventItem, eventService);
    } else if (newEventItem.has_multiple) {
      if (!eventDates || !eventDates.length) {
        console.error("Cannot create multi event with no dates provided");
        return res.status(400).send("Cannot create multi event with no dates provided");
      }

      id = await createMultiDateEvent(newEventItem, eventDates, eventService);
    } else if (newEventItem.is_recurring) {
      id = await createSingleEvent(newEventItem, eventService);
    } else {
      console.error(`Cannot create event, unknown event type: ${eventItem.occurrenceType}`);
      return res.status(400).send("Unknown event type");
    }

    if(sendApprovalEmail){
      const mailService = new MailService({schema: req.schema, knex: database});

      let eventDate;

      if (eventItem.occurrenceType === "multi") {
        eventDate = format(new Date(eventDates[0].startDate), "dd/MM/yyyy");
      } else {
        eventDate = format(new Date(eventItem.start_date), "dd/MM/yyyy");
      }

      const subject = `Event requires approval: ${eventItem.title} - ${eventDate}`;

      const eventUrl = `${process.env.PUBLIC_URL}/events/${id}`;

      for (const reviewer of reviewers) {
        console.log("sending review mail to " + reviewer.user.email);
        await mailService.send({
          to: reviewer.user.email,
          from: `events@${process.env.EMAIL_DOMAIN}`,
          subject,
          template: {
            name: "event-approve",
            data: {
              eventTitle: eventItem.title,
              eventDate,
              eventUrl
            }
          }
        });
      }
    }

    if (leaders && leaders.length) {
      const eventLeadersService = new ItemsService("events_directus_users", {
        knex: database,
        schema: req.schema,
        accountability: AdminAccountability
      });
      await createLeaders(id, leaders, eventLeadersService, eventService);
    }

    return res.send(id);
  } catch (err) {
    console.error("Error creating event", err);
    return res.status(500).send("Error creating event");
  }
}

async function createSingleEvent(eventItem: any, eventService: any) {
  return await eventService.createOne(eventItem);
}

async function createMultiDateEvent(eventItem: any, eventDates: any, eventService: any) {

  const firstDate = eventDates[0];

  const firstEventId = await eventService.createOne({
    ...eventItem,
    event_count: eventDates.length,
    event_index: 1,
    start_date: firstDate.startDate,
    end_date: firstDate.endDate,
  });

  for (let i = 1; i < eventDates.length; i++) {
    const eventDate = eventDates[i];

    await eventService.createOne({
      ...eventItem,
      event_count: eventDates.length,
      event_index: i + 1,
      parent_event: firstEventId,
      start_date: eventDate.startDate,
      end_date: eventDate.endDate,
    });
  }

  console.log("created " + eventDates.length + " additional events");

  return firstEventId;
}


async function createLeaders(eventId: string, leaders: any[], leadersService: any, eventService: any) {
  console.log("creating leaders against event", eventId, leaders);
  if (leaders && leaders.length) {
    const leaderIds = await leadersService.createMany(leaders.map(id => ({
      events_id: eventId,
      directus_users_id: id
    })));

    await eventService.updateOne(eventId, {
      leaders: leaderIds
    });
  }
}
