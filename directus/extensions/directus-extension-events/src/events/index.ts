import {defineEndpoint} from "@directus/extensions-sdk";
import {
  parseISO,
  getDay,
  getWeekOfMonth,
  getDate,
  getMonth,
  setDefaultOptions,
  addDays, addWeeks, addMonths, addYears
} from "date-fns";
import enGB from "date-fns/locale/en-GB/index.js";

export default defineEndpoint((router, {services, database}) => {
  const {
    ItemsService,
    UsersService
  } = services;

  const adminAccountability = {
    admin: true
  };

  router.get("/info", async (req, res) => {
    try {
      const eventId = req.query.eventId;
      const eventInstance = req.query.instance;
      const userId = req.accountability.user;

      let user;

      if (userId) {
        const userService = new UsersService({knex: database, schema: req.schema, accountability: adminAccountability});
        user = await userService.readOne(userId, {
          fields: ["*", "role.name"]
        });
      }

      const eventsService = new ItemsService("events", {
        knex: database,
        schema: req.schema,
        accountability: adminAccountability
      });

      const eventBookingService = new ItemsService("event_bookings", {
        knex: database,
        schema: req.schema,
        accountability: adminAccountability
      });

      const recurringPatternService = new ItemsService("recurring_event_patterns", {
        knex: database,
        schema: req.schema,
        accountability: adminAccountability
      });

      const eventLeadersService = new ItemsService("events_directus_users", {
        knex: database,
        schema: req.schema,
        accountability: adminAccountability
      });

      const event = await eventsService.readOne(eventId);

      const leaders = await eventLeadersService.readByQuery({
        fields: ["*", "directus_users_id.first_name", "directus_users_id.last_name", "directus_users_id.avatar", "directus_users_id.id"],
        filter: {
          events_id: {
            _eq: event.id
          }
        }
      });

      const patterns = await recurringPatternService.readByQuery({
        filter: {
          event: {
            _eq: event.id
          }
        }
      });

      const pattern = patterns && patterns.length ? patterns[0] : null;

      if (!event) {
        return res.status(404).send("could not find event");
      }

      const eventBookings = await eventBookingService
        .readByQuery({
          fields: [
            "*",
            "user.*",
            "user.role.name"
          ],
          filter: {
            _and: [
              {
                event: {
                  _eq: eventId
                }
              },
              {
                instance: {
                  _eq: eventInstance
                }
              },
              {
                status: {
                  _neq: "cancelled"
                }
              }
            ]
          }
        });

      let spacesLeft = null;
      if (event.max_spaces) {
        spacesLeft = event.max_spaces;
        if (eventBookings && eventBookings.length) {
          spacesLeft -= eventBookings.length;
        }
      }

      let alreadyBooked = false;
      if (eventBookings && eventBookings.length) {
        alreadyBooked = eventBookings.filter(x => x.user.id === userId).length > 0;
      }

      const allowedRoles = ["coach", "committee", "administrator"];
      let bookings = [];

      const userIsLeader = leaders.find(x => x.directus_users_id.id === userId);

      if (user) {
        if (allowedRoles.includes(user.role.name.toLowerCase()) || userIsLeader) {
          bookings = eventBookings;
        } else {
          bookings = eventBookings.filter(b => b.user.id === userId || b.user.parent === userId);
        }
      }

      return res.json({
        patternType: pattern?.type,
        spacesLeft,
        alreadyBooked,
        bookings,
        bookingsCount: eventBookings.length,
        leaders
      });
    } catch (e) {
      console.error("error getting event info", e);
      return res.status(500).send("error getting event info");
    }
  });

  router.post("/cancel", async (req, res) => {
    try {
      const eventId = req.query.eventId;
      const userId = req.query.userId;
      const instance = req.query.instance;
      const loggedInUserId = req.accountability.user;

      if (!eventId) {
        return res.status(400).send("missing event id");
      }

      if (!userId) {
        return res.status(400).send("missing user id");
      }

      const eventsService = new ItemsService("events", {
        knex: database,
        schema: req.schema,
        accountability: adminAccountability
      });
      const userService = new UsersService({knex: database, schema: req.schema, accountability: adminAccountability});

      const loggedInUser = await userService.readOne(loggedInUserId, {
        fields: ["*", "role.name"]
      });

      const bookedUser = await userService.readOne(userId, {
        fields: ["*", "role.name"]
      });

      const allowedRoles = ["committee", "administrator"];
      const isParentOfBookedUser = bookedUser.role.name === "Junior" && bookedUser.parent === loggedInUserId;

      if (isParentOfBookedUser || loggedInUser.id === userId || allowedRoles.includes(loggedInUser.role.name)) {
        const eventBookingService = new ItemsService("event_bookings", {
          knex: database,
          schema: req.schema,
          accountability: adminAccountability
        });

        const eventBookings = await eventBookingService
          .readByQuery({
            fields: ["*", "user.first_name", "user.last_name", "user.email", "user.id", "user.role.name"],
            filter: {
              _and: [
                {
                  event: {
                    _eq: eventId
                  }
                },
                {
                  user: {
                    _eq: userId
                  }
                },
                {
                  instance: {
                    _eq: instance
                  }
                }
              ]
            }
          });

        if (!eventBookings || !eventBookings.length) {
          return res.status(404).send("no event bookings found");
        }

        const eventBooking = eventBookings[0];

        const event = await eventsService.readOne(eventId);
        if (event.price || event.junior_price) {
          // TODO: Only send refund if the user booked on is a junior AND there is a junior_price OR the user is NOT a junior and there is a price
          // TODO: send stripe refund request
        }

        await eventBookingService.updateOne(eventBooking.id, {
          status: "cancelled"
        });

        return res.send("ok");
      } else {
        return res.status(401).send("not allowed to cancel that users booking");
      }

    } catch (e) {
      console.error("error cancelling event booking", e);
      return res.status(500).send("error cancelling event booking");
    }
  });

  router.post("/book", async (req, res) => {
    try {

      const eventId = req.query.eventId;
      const loggedInUserId = req.query.userId;
      const instance = req.query.instance;
      const userIds = req.body.userIds;

      if (!eventId) {
        return res.status(400).send("missing event id");
      }

      if (!loggedInUserId) {
        return res.status(400).send("missing logged in user id");
      }

      const eventsService = new ItemsService("events", {
        knex: database,
        schema: req.schema,
        accountability: req.accountability
      });

      const eventBookingService = new ItemsService("event_bookings", {
        knex: database,
        schema: req.schema,
        accountability: req.accountability
      });

      const recurringPatternService = new ItemsService("recurring_event_patterns", {
        knex: database,
        schema: req.schema,
        accountability: adminAccountability
      });

      const event = await eventsService.readOne(eventId);

      const existingBookings = await eventBookingService.readByQuery({
        filter: {
          event: {
            _eq: eventId
          }
        }
      });

      const currentBookings = existingBookings.length;
      const maxBookings = event.max_spaces;
      const usersToBook = userIds.length;

      if (maxBookings && currentBookings + usersToBook > maxBookings) {
        return res.json({
          result: false,
          statusCode: 101,
          message: "Event is full"
        });
      }

      const patterns = await recurringPatternService.readByQuery({
        filter: {
          event: {
            _eq: eventId
          }
        }
      });

      const bookingResults = [];

      for (const userId of userIds) {
        const alreadyBooked = existingBookings?.filter(x => x.user === userId && x.status !== "cancelled");
        if (alreadyBooked?.length) {
          bookingResults.push({
            result: false,
            message: "That user is already booked",
            userId
          });
          continue;
        }

        const alreadyCancelledBookings = existingBookings?.filter(x => x.user === userId && x.status === "cancelled");
        if (alreadyCancelledBookings?.length) {
          const cancelledBooking = alreadyCancelledBookings[0];
          await eventBookingService.updateOne(cancelledBooking.id, {
            status: "booked"
          });

          bookingResults.push({
            result: true,
            message: "Your cancelled booking has been re-added",
            bookingId: cancelledBooking.id,
            userId
          });
          continue;
        }

        const recurringPattern = patterns && patterns.length ? patterns[0] : null;

        const bookingId = await eventBookingService.createOne({
          user: userId,
          event: eventId,
          instance: instance,
          recurring_pattern: recurringPattern?.id,
          status: "booked"
        });

        bookingResults.push({
          result: true,
          message: "User has been booked",
          bookingId,
          userId,
        });
      }

      return res.json(bookingResults);
    } catch (e) {
      console.log("error booking on to event", e);
      return res.status(500).send("something went wrong");
    }
  });

  router.post("/update", async (req, res) => {
    const eventItem = req.body.event;

    if(!eventItem){
      return res.status(400).send("missing event data");
    }

    try{
      const eventService = new ItemsService("events", {
        knex: database,
        schema: req.schema,
        accountability: req.accountability
      });

      const existingEvent = await eventService.readOne(eventItem.id);
      if(!existingEvent){
        return res.status(400).send("could not edit event that doesn't exist");
      }

      eventItem.status = "published";

      if (eventItem.price || eventItem.junior_price) {
        const loggedInUserId = req.accountability.user;
        const userService = new UsersService({knex: database, schema: req.schema, accountability: adminAccountability});
        const user = await userService.readOne(loggedInUserId, {
          fields: ["role.name"]
        });

        // roles that are allowed to create an event with a price
        const allowedRoles = ["committee", "administrator"];

        if (!allowedRoles.includes(user.role.name.toLowerCase())) {
          eventItem.status = "draft";
        }
      }

      const result = await eventService.updateOne(eventItem.id, eventItem);
      return res.send(result);

    }catch(e){
      console.error("error updating event", e);
      return res.status(400).send("error updating event");
    }
  });

  router.post("/create", async (req, res) => {
    const eventType = req.body.eventType;
    const eventItem = req.body.eventItem;
    const eventDates = req.body.eventDates;

    console.log("creating new date");
    console.log("event type", eventType);
    console.log("event item", eventItem);
    console.log("event dates", eventDates);

    const eventService = new ItemsService("events", {
      knex: database,
      schema: req.schema,
      accountability: req.accountability
    });

    const recurringEventService = new ItemsService("recurring_event_patterns", {
      knex: database,
      schema: req.schema,
      accountability: req.accountability
    });

    eventItem.status = "published";

    if (eventItem.price || eventItem.junior_price) {
      const loggedInUserId = req.accountability.user;
      const userService = new UsersService({knex: database, schema: req.schema, accountability: adminAccountability});
      const user = await userService.readOne(loggedInUserId, {
        fields: ["role.name"]
      });

      // roles that are allowed to create an event with a price
      const allowedRoles = ["committee", "administrator"];

      if (!allowedRoles.includes(user.role.name.toLowerCase())) {
        eventItem.status = "draft";
      }
    }

    if (eventType === "single") {
      return await createSingleEvent(eventItem, eventService, res);
    } else if (eventType === "multi") {
      return await createMultiEvent(eventItem, eventDates, eventService, res);
    } else if (eventType === "recurring") {
      return await createRecurringEvent(eventItem, eventDates, eventService, recurringEventService, res);
    } else {
      return res.status(400).send("unknown event type");
    }
  });
});

async function createSingleEvent(eventItem, eventService, res) {

  try {
    const result = await eventService.createOne({
      title: eventItem.title,
      description: eventItem.description,
      location: eventItem.location,
      start_date: eventItem.startDate,
      end_date: eventItem.endDate,
      price: eventItem.price,
      junior_price: eventItem.junior_price,
      allowed_roles: eventItem.allowedRoles,
      type: eventItem.type,
      status: eventItem.status
    });

    return res.send(result);
  } catch (e) {
    console.error("unable to create new event", e);
    return res.status(500).send("unable to create new event");
  }
}

async function createMultiEvent(eventItem, eventDates, eventService, res) {

  try {
    const newEvents = [];

    const eventCount = eventDates.multiple.length;

    const firstDate = eventDates.multiple[0];
    const firstEventId = await eventService.createOne({
      title: eventItem.title,
      event_count: eventCount,
      event_index: 1,
      description: eventItem.description,
      location: eventItem.location,
      start_date: firstDate.startDate,
      end_date: firstDate.endDate,
      price: eventItem.price,
      junior_price: eventItem.junior_price,
      allowed_roles: eventItem.allowedRoles,
      has_multiple: true,
      type: eventItem.type,
      status: eventItem.status
    });

    for (let i = 1; i < eventDates.multiple.length; i++) {
      const date = eventDates.multiple[i];

      newEvents.push({
        title: eventItem.title,
        event_count: eventCount,
        event_index: i + 1,
        description: eventItem.description,
        location: eventItem.location,
        start_date: date.startDate,
        end_date: date.endDate,
        price: eventItem.price,
        junior_price: eventItem.junior_price,
        allowed_roles: eventItem.allowedRoles,
        parent_event: firstEventId,
        type: eventItem.type,
        status: eventItem.status
      });
    }

    const newIds = await eventService.createMany(newEvents);

    return res.send([firstEventId, ...newIds]);
  } catch (e) {
    console.error("unable to create new multi day event", e);
    return res.status(500).send("unable to create new multi day  event");
  }
}

async function createRecurringEvent(eventItem, eventDates, eventService, recurringEventService, res) {
  try {

    let endDate = undefined;
    const occurences = eventDates.recurring.maxOccurrences;
    if (occurences) {
      const type = eventDates.recurring.recurringType.id;
      const start = eventDates.recurring.startDate;

      if (type === "daily") {
        endDate = addDays(new Date(start), occurences);
      } else if (type === "weekly") {
        endDate = addWeeks(new Date(start), occurences);
      } else if (type === "monthly") {
        endDate = addMonths(new Date(start), occurences);
      } else if (type === "yearly") {
        endDate = addYears(new Date(start), occurences);
      }
    }

    const newEventId = await eventService.createOne({
      title: eventItem.title,
      description: eventItem.description,
      location: eventItem.location,
      price: eventItem.price,
      junior_price: eventItem.junior_price,
      start_date: eventDates.recurring.startDate,
      end_date: eventDates.recurring.endDate,
      allowed_roles: eventItem.allowedRoles,
      last_occurance: endDate,
      is_recurring: true,
      type: eventItem.type,
      status: eventItem.status
    });

    const recurringPattern = {
      event: newEventId,
      type: mapRecurringType(eventDates.recurring.recurringType.id),
      max_occurences: eventDates.recurring.maxOccurrences
    };

    let dayOfWeek: number | undefined;
    let weekOfMonth: number | undefined;
    let dayOfMonth: number | undefined;
    let monthOfYear: number | undefined;

    setDefaultOptions({
      locale: enGB,
      weekStartsOn: 1
    });

    const startDate = parseISO(eventDates.recurring.startDate);

    const dayMap = {
      "0": 6,
      "1": 0,
      "2": 1,
      "3": 2,
      "4": 3,
      "5": 4,
      "6": 5,
    };

    if (recurringPattern.type === "1") { // weekly
      dayOfWeek = dayMap[getDay(startDate)];
    }

    if (recurringPattern.type === "2") { // monthly
      weekOfMonth = getWeekOfMonth(startDate);
      dayOfMonth = getDate(startDate);
    }

    if (recurringPattern.type === "3") { // yearly
      monthOfYear = getMonth(startDate);
    }

    recurringPattern.day_of_week = dayOfWeek;
    recurringPattern.week_of_month = weekOfMonth;
    recurringPattern.day_of_month = dayOfMonth;
    recurringPattern.month_of_year = monthOfYear;

    const id = await recurringEventService.createOne(recurringPattern);

    return res.send(id);
  } catch (e) {
    console.error("unable to create new recurring event", e);
    return res.status(500).send("unable to create new recurring event");
  }
}

function mapRecurringType(id: string) {
  switch (id) {
  case "daily":
    return "0";
  case "weekly":
    return "1";
  case "monthly":
    return "2";
  case "yearly":
    return "3";
  default:
    throw new Error(`Unknown recurring type: ${id}`);
  }
}
