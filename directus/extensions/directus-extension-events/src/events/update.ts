import {AdminAccountability, isUserLeader, userHasRole} from "./utils";

export async function update(req: any, res: any, services: any, database: any) {
  const {
    ItemsService,
  } = services;

  try {
    const eventId = req.query.eventId;
    const event = req.body.event;
    const eventDates = req.body.eventDates;
    event.id = eventId;
    const userId = req.accountability.user;
    const leaders = req.body.leaders;
    const editType = req.query.editType;

    console.log("got user", userId);
    console.log("got event", event);
    console.log("got event dates", eventDates);

    if (!event) {
      return res.status(400).send("Missing event");
    }

    const eventsService = new ItemsService("events", {
      knex: database,
      schema: req.schema,
      accountability: AdminAccountability
    });

    console.log("getting event");
    const existingEvent = await eventsService.readOne(event.id);
    if (!existingEvent) {
      console.error(`Cannot update event. Event not found: ${event.id}`);
      return res.status(404).send("Cannot update event. Event not found");
    }

    console.log("got event", event);

    const userCreatedEvent = existingEvent.user_created === userId;
    const userHasRolePermission = await userHasRole(req, services, database, userId, ["committee", "administrator"]);
    const userIsLeader = await isUserLeader(req, services, database, event.id, userId);
    if (!userIsLeader && !userHasRolePermission && !userCreatedEvent) {
      console.error(`User without permission tried to edit event: ${event.id}`);
      return res.status(401).send("Not allowed");
    }

    console.log("user is leader and/or has role");

    if (event.occurrenceType === "single") {
      const result = await updateSingleEvent(req, services, database, event);
      if (result) {
        await updateLeaders(req, services, database, event.id, leaders);

        if (event.notifyUsers || hasDateChange(event, existingEvent)) {
          await notifyBookings(req, services, database, event);
        }
      } else {
        console.error("Unable to update event");
      }

      return res.send(result);
    } else if (event.occurrenceType === "multi") {
      const result = await updateMultiDayEvent(req, services, database, event, eventDates);

      if (result) {
        await updateLeaders(req, services, database, event.id, leaders);

        if (event.notifyUsers || result.datesChanged) {
          await notifyBookings(req, services, database, event);
        }

      } else {
        console.error("Unable to update event");
      }

      return res.send(result.eventId);
    }else if(event.occurrenceType === "recurring"){
      const result = await updateRecurringEvent(req, services, database, event, editType);

      if(result){
        await updateLeaders(req, services, database, event.id, leaders);

        if (event.notifyUsers || hasDateChange(event, existingEvent)) {
          await notifyBookings(req, services, database, event);
        }
      } else {
        console.error("Unable to update event");
      }

      return res.send(result.eventId);
    }

    console.error(`Event not saved, unknown occurrence type: ${event.occurrenceType}`);
    return res.status(400).send("Unknown occurrence type.");
    // If the event is a single event
    // make the api call to update single event
    // if dates have changed or notify users checked
    // find all event bookings
    // send email notifying the event has changed

    // If the event is a multi day event
    // only update the first event data
    // loop over the OTHER events to update any date values that have changed
    // if dates have changed or notify users checked
    // find all event bookings
    // send email notifying the event has changed

    // If the event is a recurring event
    // if the edit type is ALL
    // make api call to change defining event
    // if dates have changed or notify users checked
    // find all FUTURE event bookings
    // send email notifying the event has changed
    // If the edit type is instance
    // create a new event exception
    // find any event bookings for that instance
    // send email notifying the event has changed

  } catch (err: any) {
    console.error("Error updating events", err);
    return res.status(500).send("Error updating event");
  }
}

async function updateSingleEvent(req: any, services: any, database: any, event: any) {
  const {
    ItemsService,
  } = services;

  const eventService = new ItemsService("events", {
    knex: database,
    schema: req.schema,
    accountability: req.accountability
  });

  return await eventService.updateOne(event.id, event);
}

async function updateMultiDayEvent(req: any, services: any, database: any, event: any, eventDates: any) {
  // If the event is a multi day event
  // only update the first event data
  // loop over the OTHER events to update any date values that have changed
  // if dates have changed or notify users checked
  // find all event bookings
  // send email notifying the event has changed

  const {
    ItemsService,
  } = services;

  const eventService = new ItemsService("events", {
    knex: database,
    schema: req.schema,
    accountability: req.accountability
  });

  const mainId = await eventService.updateOne(event.id, event);

  const dates = eventDates.filter((e: any) => e.id !== event.id);

  const otherEvents = await eventService.readByQuery({
    fields: ["id", "start_date", "end_date", "parent_event"],
    filter: {
      parent_event: {
        _in: event.id
      }
    }
  });

  console.log("loaded other events", otherEvents);


  let datesChanged = false;

  for (const otherEvent of otherEvents) {
    const date = dates.find((d: any) => d.id === otherEvent.id);

    if (!date) {
      // we have deleted a date?
      datesChanged = true;
      break;
    }

    const startChange = new Date(date.startDate).toISOString() !== new Date(otherEvent.start_date).toISOString();
    const endChange = new Date(date.endDate).toISOString() !== new Date(otherEvent.end_date).toISOString();

    if (startChange || endChange) {
      datesChanged = true;
      break;
    }
  }

  if (!datesChanged) {
    console.log("dates haven't changed");
    return {
      eventId: mainId,
      datesChanged: false
    };
  }


  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    const existingEvent = otherEvents.find((e: any) => e.id === date.id);
    if (!existingEvent) {
      // we have added a new date
      // create a new event with a parent event set to event.id
      console.log("creating new session");
      await eventService.createOne({
        ...event,
        id: undefined,
        start_date: date.startDate,
        end_date: date.endDate,
        event_index: i + 1,
        event_count: dates.length,
        parent_event: event.id
      });
    } else {
      // we have updated the event?

      // TODO: should only update existing if date has changed

      console.log("updating event session: " + existingEvent.id);
      await eventService.updateOne(existingEvent.id, {
        start_date: date.startDate,
        end_date: date.endDate
      });
      console.log("event session updated!");
    }
  }

  for (const other of otherEvents) {
    console.log("checking if existing event has a date?", other.id);
    const existingDate = dates.find((d: any) => d.id === other.id);
    if (!existingDate) {
      // we have removed a date
      // EITHER delete the event.id or set the event.id to cancelled
      // TODO: Might be best to remove event, to avoid polluting events table with cancelled event sessions
      console.log("removing event session", other.id);
      await eventService.updateOne(other.id, {
        status: "cancelled",
        event_index: -1
      });
    } else {
      console.log("date still exists");
    }
  }

  let updatedEvents = await eventService.readByQuery({
    fields: ["id", "start_date", "end_date", "status", "parent_event"],
    filter: {
      _and: [
        {
          status: {
            _neq: "cancelled"
          }
        },
        {
          _or: [
            {
              id: {
                _eq: event.id
              }
            },
            {
              parent_event: {
                _eq: event.id
              }
            }
          ]
        }
      ],
    }
  });

  console.log("got events to update index and count for");

  updatedEvents = updatedEvents
    .sort((a: any, b: any) => {
      return new Date(a.start_date).getTime() - new Date(b.end_date).getTime();
    });

  console.log("sorted events", updatedEvents);

  for (let i = 0; i < updatedEvents.length; i++) {
    const updatedEvent = updatedEvents[i];

    console.log("trying to update", updatedEvent.id);
    await eventService.updateOne(updatedEvent.id, {
      event_index: i + 1,
      event_count: updatedEvents.length
    });
    console.log("it worked");
  }

  console.log("Updated!");
  return {
    eventId: mainId,
    datesChanged: true
  };

  // figure out which events to add using the list of dates
  // figure out which events to remove using the list of dates
  // figure out which events to update
}

async function updateRecurringEvent(req: any, services: any, database: any, event: any, editType: string) {
  if(editType === "all"){
    const {
      ItemsService,
    } = services;

    const eventService = new ItemsService("events", {
      knex: database,
      schema: req.schema,
      accountability: req.accountability
    });

    return await eventService.updateOne(event.id, event);
  }else if(editType ==="single-instance"){
    // not ready yet
  }else{
    console.error("unknown edit type: " + editType);
  }
}

async function updateLeaders(req: any, services: any, database: any, eventId: string, leaders: string[]) {
  const {
    ItemsService,
  } = services;

  const eventLeadersService = new ItemsService("events_directus_users", {
    knex: database,
    schema: req.schema,
    accountability: AdminAccountability
  });

  // Load existing leaders for this event
  // Compare the existing leaders to the list of leaders passed in
  // Create a list of toAdd and toRemove leaders

  // TODO: Include event instance to handle recurring event exceptions?

  const existingLeaders = await eventLeadersService.readByQuery({
    fields: ["*"],
    filter: {
      events_id: {
        _eq: eventId
      }
    }
  });

  console.log("found existing leaders", existingLeaders);

  const toAdd: string[] = [];
  const toRemove: string[] = [];

  for (const leader of leaders) {
    const existing = existingLeaders.find((l: any) => l.directus_user_id === leader);
    if (!existing) {
      toAdd.push(leader);
      console.log("adding leader to event", leader);
    }
  }

  for (const leader of existingLeaders) {
    const stillInList = leaders.includes(leader.directus_user_id);
    if (!stillInList) {
      toRemove.push(leader.id);
      console.log("removing leader from event", leader.directus_user_id);
    }
  }

  const added = await eventLeadersService.createMany(toAdd.map(id => ({
    events_id: eventId,
    directus_users_id: id
  })));

  console.log("added " + added.length + " leaders");
  if (added.length !== toAdd.length) {
    console.error("leaders added length mismatch");
  }

  const removed = await eventLeadersService.deleteMany(toRemove);
  console.log("removed " + removed.length + " leaders");
  if (removed.length !== toRemove.length) {
    console.error("leaders removed length mismatch");
  }
}

async function notifyBookings(req: any, services: any, database: any, event: any) {
  const {
    ItemsService,
  } = services;

  const eventBookingService = new ItemsService("event_bookings", {
    knex: database,
    schema: req.schema,
    accountability: AdminAccountability
  });

  const filter: any = {
    _and: [
      {
        event: {
          _eq: event.id
        },
      },
      {
        status: {
          _in: ["booked", "paid"]
        }
      }
    ]
  };

  // if (instance) {
  //   bookingsFilter.instance = {
  //     _eq: instance
  //   };
  // }

  const bookings = await eventBookingService.readByQuery({
    fields: [
      "user.email",
      "user.first_name",
      "user.last_name",
      "user.parent.email",
      "user.parent.first_name",
      "user.parent.last_name",
    ],
    filter
  });

  if (!bookings || bookings.length === 0) {
    console.log("No bookings found for event, no notification emails sent");
    return;
  }

  for (const booking of bookings) {
    const isJunior = !!booking.user.parent;
    const email = isJunior ? booking.user.parent.email : booking.user.email;

    console.log("SENDING EMAIL TO ", email);
  }
}

function hasDateChange(event: any, existingEvent: any) {
  const startChange = new Date(event.start_date).toISOString() !== new Date(existingEvent.start_date).toISOString();
  console.log("start change", startChange);

  const endChange = new Date(event.end_date).toISOString() !== new Date(existingEvent.end_date).toISOString();
  console.log("end change", endChange);

  return startChange || endChange;
}
