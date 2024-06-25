import {AdminAccountability} from "./utils";
import {InboundEmail} from "directus-extension-mcc/src/types";
import {handleMailForward} from "../mail-forwards";
import {formatInTimeZone} from "date-fns-tz";
import {RRule} from "rrule";

export async function messageAttendees(req: any, res: any, services: any, database: any) {
  const {
    ItemsService,
    MailService
  } = services;

  try {
    const eventId = req.query.eventId;
    const instance = req.query.instance;
    const loggedInUserId = req.accountability.user;

    const subject = req.body.subject;
    const message = req.body.message;

    if (!subject) {
      return res.status(400).send("missing subject");
    }

    if (!message) {
      return res.status(400).send("missing message content");
    }

    if (!eventId) {
      return res.status(400).send("missing event id");
    }

    const eventsService = new ItemsService("events", {
      knex: database,
      schema: req.schema,
      accountability: AdminAccountability
    });

    const eventLeadersService = new ItemsService("events_directus_users", {
      knex: database,
      schema: req.schema,
      accountability: AdminAccountability
    });

    const event = await eventsService.readOne(eventId);

    if (!event.leaders || event.leaders.length === 0) {
      return res.status(400).send("event doesn't have any leaders");
    }

    const leaders = await eventLeadersService.readByQuery({
      fields: ["*"],
      filter: {
        id: {
          _in: event.leaders
        }
      }
    });

    if (leaders.filter((x: any) => x.directus_users_id === loggedInUserId).length === 0) {
      return res.status(401).send("you are not a leader of that event");
    }

    const eventBookingService = new ItemsService("event_bookings", {
      knex: database,
      schema: req.schema,
      accountability: AdminAccountability
    });

    const bookingsFilter: any = {
      event: {
        _eq: eventId
      }
    };

    if (instance) {
      bookingsFilter.instance = {
        _eq: instance
      };
    }

    const bookings = await eventBookingService.readByQuery({
      fields: ["*", "user.email", "user.role.name", "user.parent.email"],
      filter: bookingsFilter
    });

    if (!bookings || bookings.length === 0) {
      return res.status(400).send("no bookings found");
    }

    const mailService = new MailService({schema: req.schema, knex: database});

    const eventTitle = event.title;
    let eventUrl = `${process.env.PUBLIC_URL}/events/${event.id}`;
    if (instance) {
      eventUrl += `?instance=${instance}`;
    }

    for (const booking of bookings) {
      let email = booking.user.email;
      if (booking.user.role.name.toLowerCase() === "junior") {
        email = booking.user.parent.email;
      }

      await mailService.send({
        to: email,
        from: `events@${process.env.EMAIL_DOMAIN}`,
        subject,
        template: {
          name: "event-message",
          data: {
            message,
            eventTitle,
            eventUrl
          }
        }
      });
    }

    console.log(`user ${loggedInUserId} send event message to ${bookings.length} attendee(s)`);
    return res.status(200).send("ok");
  } catch (e: any) {
    console.error("error sending message to event attendees", e);
    return res.status(500).send("error sending message to event attendees");
  }
}

export async function messageLeader(req: any, res: any, services: any, database: any) {
  const {
    ItemsService,
    MailService
  } = services;

  try {
    const eventId = req.query.eventId;
    const instance = req.query.instance;
    const loggedInUserId = req.accountability.user;

    const subject = req.body.subject;
    const message = req.body.message;
    const leaderId = req.body.leaderId;

    if (!subject) {
      return res.status(400).send("missing subject");
    }

    if (!message) {
      return res.status(400).send("missing message content");
    }

    if (!eventId) {
      return res.status(400).send("missing event id");
    }

    if (!leaderId) {
      return res.status(400).send("missing leader id");
    }

    const eventsService = new ItemsService("events", {
      knex: database,
      schema: req.schema,
      accountability: AdminAccountability
    });

    const eventBookingsService = new ItemsService("event_bookings", {
      knex: database,
      schema: req.schema,
      accountability: AdminAccountability
    });

    const eventLeadersService = new ItemsService("events_directus_users", {
      knex: database,
      schema: req.schema,
      accountability: AdminAccountability
    });

    const event = await eventsService.readOne(eventId);

    if (!event.leaders || event.leaders.length === 0) {
      console.warn("cannot message a leader when the event doesn't have any leaders");
      return res.status(400).send("cannot message a leader when the event doesn't have any leaders");
    }

    // check if the user who is sending a message is booked onto the event

    const eventBookingFilter: any = {
      _and: [
        {
          event: {
            _eq: eventId
          }
        },
        {
          _or: [
            {
              user: {
                _eq: loggedInUserId
              }
            }, {
              user: {
                parent: {
                  _eq: loggedInUserId
                }
              }
            }
          ]
        },
        {
          status: {
            _neq: "cancelled"
          }
        }
      ]
    };

    if (instance) {
      eventBookingsService._and.push({
        instance: {
          _eq: instance
        }
      });
    }

    const loggedInUserBookings = await eventBookingsService.readByQuery({
      fields: [
        "*",
        "user.*",
        "user.role.name",
        "user.parent.*"
      ],
      filter: eventBookingFilter
    });

    console.log("found requesting user booking", loggedInUserBookings);

    if (!loggedInUserBookings || loggedInUserBookings.length === 0) {
      console.warn("user cannot message leader if they aren't booked onto event");
      return res.status(400).send("user cannot message leader if they aren't booked onto event");
    }

    let userSendingMessage = loggedInUserBookings[0].user;
    let onBehalfOf = null;

    if (userSendingMessage.role.name === "Junior") {
      onBehalfOf = userSendingMessage;
      console.log("booked user is junior, sending message on behalf of", onBehalfOf.first_name, userSendingMessage.first_name);
      userSendingMessage = userSendingMessage.parent;
    }

    const sendingUserName = `${userSendingMessage.first_name} ${userSendingMessage.last_name}`;

    if (!userSendingMessage) {
      console.error("something went wrong selecting the user to send the message");
      return res.status(500).send("something went wrong selecting the user to send the message");
    }

    // find the leader to message

    const leaders = await eventLeadersService.readByQuery({
      fields: [
        "*",
        "directus_users_id.email",
        "directus_users_id.first_name"
      ],
      filter: {
        directus_users_id: {
          _eq: leaderId
        }
      }
    });

    if (!leaders || leaders.length === 0) {
      console.warn("could not find leader to send message to");
      return res.status(500).send("could not find leader to send message to");
    }

    const leader = leaders[0].directus_users_id;
    console.log("found leader", leader);

    const mailForwardsService = new ItemsService("mail_forwards", {
      knex: database,
      schema: req.schema,
      accountability: AdminAccountability
    });

    let mailForwards = await mailForwardsService.readByQuery({
      filter: {
        target_email: {
          _icontains: leader.email
        }
      }
    });

    if (!mailForwards || mailForwards.length === 0) {
      console.warn(`no mail forward found for ${leader.email}, creating new forward`);

      const newForwardId = await mailForwardsService.createOne({
        name: `${userSendingMessage.first_name}.${userSendingMessage.last_name}`.toLowerCase(),
        from_name: sendingUserName,
        target_email: userSendingMessage.email
      });

      const newForward = await mailForwardsService.readOne(newForwardId);

      mailForwards = [newForward];
    }

    console.log("got forwards for", userSendingMessage.email, mailForwards);
    const mailService = new MailService({schema: req.schema, knex: database});

    let eventLabel = event.title;

    if (instance) {
      // calculate date of event from instance

      const {start} = getDatesOfInstance(event, instance);
      console.log("got start date of instance", start, instance);
      const timeZone = "Europe/London";
      const eventDate = formatInTimeZone(new Date(date), timeZone, "do MMMM yyyy @ h:mmaaa");
      eventLabel += " - " + eventDate;
    } else {
      let date = event.start_date;
      if (!date.endsWith("Z")) {
        date += "Z";
      }
      const timeZone = "Europe/London";
      const eventDate = formatInTimeZone(new Date(date), timeZone, "do MMMM yyyy @ h:mmaaa");
      eventLabel += " - " + eventDate;
    }

    const renderedMessage = await mailService.renderTemplate("event-message-to-leader", {
      isJunior: !!onBehalfOf,
      attendeeName: sendingUserName,
      eventLabel,
      message
    });

    const mailForward = mailForwards[0];

    const mailThreadsService = new ItemsService("mail_threads", {
      knex: database,
      schema: req.schema,
      accountability: AdminAccountability
    });

    const inboundEmail: InboundEmail = {
      From: userSendingMessage.email,
      FromName: sendingUserName,
      Subject: `Message from attendee: ${subject}`,
      HtmlBody: renderedMessage,
      FromFull: {
        Email: userSendingMessage.email,
        Name: sendingUserName
      }
    };

    console.log("sending mail to leader", inboundEmail);
    await handleMailForward(inboundEmail, undefined, mailForward, mailThreadsService, mailForwardsService);
    return res.status(200).send("ok");
  } catch (e: any) {
    console.error("error sending message to event attendees", e);
    return res.status(500).send("error sending message to event attendees");
  }
}

export function getDatesOfInstance (event: any, instance: number) {
  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);

  const duration = endDate.getTime() - startDate.getTime();
  const ruleData = RRule.fromString(event.rrule!);

  // TODO: This will need some optimisation in the future.
  // Has to iterator over each date to get to the current instance
  const all = ruleData.all((_, i) => {
    return i < instance + 1;
  });

  const start = all[instance];

  start.setHours(startDate.getHours(), startDate.getMinutes(), startDate.getSeconds());
  const end = new Date(start.getTime() + duration);

  return {
    start,
    end
  };
}
