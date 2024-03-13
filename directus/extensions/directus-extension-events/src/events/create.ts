const adminAccountability = {
  admin: true
};

export async function create(req: any, res: any, services: any, database: any) {
  const {
    ItemsService,
    UsersService
  } = services;

  try {
    const eventItem = req.body.eventItem;
    const eventDates = req.body.eventDates;
    const leaders = req.body.eventItem.leaders;

    console.log("creating new event");
    console.log("event item", eventItem);
    console.log("event dates", eventDates);
    console.log("leaders", leaders);

    eventItem.status = "published";

    // require approval if a price is set
    if (eventItem.price || eventItem.junior_price || eventItem.member_price || eventItem.non_member_price || eventItem.coach_price) {
      const loggedInUserId = req.accountability.user;
      const userService = new UsersService({
        knex: database,
        schema: req.schema,
        accountability: adminAccountability
      });
      const user = await userService.readOne(loggedInUserId, {
        fields: ["role.name"]
      });

      // roles that are allowed to create an event with a price
      const allowedRoles = ["committee", "administrator"];

      if (!allowedRoles.includes(user.role.name.toLowerCase())) {
        eventItem.status = "draft";
        // TODO: Send email to committee
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
      console.log("creating single event");
      id = await createSingleEvent(newEventItem, eventService);
    } else if (newEventItem.has_multiple) {
      console.log("creating multi event");
      if (!eventDates || !eventDates.length) {
        console.error("Cannot create multi event with no dates provided");
        return res.status(400).send("Cannot create multi event with no dates provided");
      }

      id = await createMultiDateEvent(newEventItem, eventDates, eventService);
    } else if (newEventItem.is_recurring) {
      console.log("creating recurring event");
      id = await createSingleEvent(newEventItem, eventService);
    } else {
      console.error(`Cannot create event, unknown event type: ${eventItem.occurrenceType}`);
      return res.status(400).send("Unknown event type");
    }

    if (leaders && leaders.length) {
      const eventLeadersService = new ItemsService("events_directus_users", {
        knex: database,
        schema: req.schema,
        accountability: req.accountability
      });
      await createLeaders(id, leaders, eventLeadersService, eventService);
    }

    return res.send(id);

    // create event leaders
    // const eventLeadersService = new ItemsService("events_directus_users", {
    //   knex: database,
    //   schema: req.schema,
    //   accountability: req.accountability
    // });

    // if (eventType === "single") {
    //   const id = await createSingleEvent(eventItem, eventService, res);
    //   await createLeaders(id, leaders, eventLeadersService, eventService);
    //   return res.send(id);
    // } else if (eventType === "multi") {
    //   const ids = await createMultiEvent(eventItem, eventDates, eventService, res);
    //
    //   for (const id of ids) {
    //     await createLeaders(id, leaders, eventLeadersService, eventService);
    //   }
    //
    //   return res.send(ids);
    // } else {
    //   return res.status(400).send("unknown event type");
    // }
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
