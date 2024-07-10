import {defineEndpoint} from "@directus/extensions-sdk";
import {create} from "./create";
import {get, getConsentInfo} from "./get";
import {review} from "./review";
import {update} from "./update";
import {getInfo} from "./info";
import {nanoid} from "nanoid";
import {messageAttendees, messageLeader} from "./message";
import {AdminAccountability} from "./utils";

export default defineEndpoint((router, {services, database}) => {
  const {
    ItemsService,
    UsersService,
    MailService
  } = services;

  const adminAccountability = {
    admin: true
  };

  router.get("/", async (req: any, res: any) => {
    return await get(req, res, services, database);
  });

  router.get("/consent-info", async (req: any, res: any) => {
    return await getConsentInfo(req, res, services, database);
  });

  router.post("/review", async (req: any, res: any) => {
    return await review(req, res, services, database);
  });

  router.get("/info", async (req: any, res: any) => {
    return await getInfo(req, res, services, database);
  });

  router.post("/cancel", async (req: any, res: any) => {
    try {
      const mailService = new MailService({schema: req.schema, knex: database});

      const eventId = req.query.eventId;
      const instance = req.query.instance;
      const cancelAll = req.query.cancelAll === "true";
      const loggedInUserId = req.accountability.user;
      const reason = req.body.reason;

      if (!eventId) {
        return res.status(400).send("missing event id");
      }

      const eventsService = new ItemsService("events", {
        knex: database,
        schema: req.schema,
        accountability: req.accountability
      });

      const userService = new UsersService({
        knex: database,
        schema: req.schema,
        accountability: adminAccountability
      });

      const loggedInUser = await userService.readOne(loggedInUserId, {
        fields: ["*", "role.name"]
      });

      // Proceed if user created the event or the user is committee and above
      const event = await eventsService.readOne(eventId);

      const allowedRoles = ["committee", "administrator"];
      const userCreatedEvent = event.user_created === loggedInUserId;
      const userHasRole = allowedRoles.includes(loggedInUser.role.name.toLowerCase());

      if (userCreatedEvent || userHasRole) {
        if (event.status === "cancelled") {
          return res.status(400).send("event has already been cancelled");
        }

        // List event bookings for event
        const eventBookingService = new ItemsService("event_bookings", {
          knex: database,
          schema: req.schema,
          accountability: adminAccountability
        });

        const filter: any = {
          _and: [
            {
              event: {
                _eq: eventId
              }
            },
          ]
        };

        console.log("instance", instance);
        console.log("cancel all", cancelAll);

        // Only pass the event instance if we have an instance and we don't want
        // to cancel the entire recurring event
        if (instance && !cancelAll) {
          filter._and.push({
            instance: {
              _eq: instance
            }
          });
        }

        console.log("loading event bookings with filter", JSON.stringify(filter));

        const eventBookings = await eventBookingService
          .readByQuery({
            fields: ["*", "user.email"],
            filter
          });

        console.log("found event bookings", eventBookings);
        if (eventBookings && eventBookings.length) {
          // For each event booking, cancel the booking
          for (const booking of eventBookings) {
            booking.status = "cancelled";
            console.log("booking cancelled for", booking, booking.user.email);
            if (booking.user.email) {
              try {
                await mailService.send({
                  to: booking.user.email,
                  from: `events@${process.env.EMAIL_DOMAIN}`,
                  subject: event.title + " - Cancellation Notification",
                  template: {
                    name: "event-cancelled",
                    data: {
                      eventTitle: event.title,
                      eventDate: new Date(event.start_date).toLocaleString(),
                      reason
                    }
                  }
                });
              } catch (e) {
                console.log("unable to send event cancelled email", e);
              }
            }
          }

          await eventBookingService.updateBatch(eventBookings.map((x: any) => ({
            id: x.id,
            status: x.status
          })));
        }

        const cancelEntireEvent = !instance || cancelAll;

        // If the event is a single or multi day event, or the event is recurring and
        // we want to cancel the whole event
        if (!event.is_recurring || (event.is_recurring && cancelEntireEvent)) {
          // Cancel the event
          console.log("The event is a single, multi-day or is recurring and is cancelled");

          if (event.has_multiple) {
            const childEvents = await eventsService.readByQuery({
              fields: ["id", "parent_event", "status"],
              filter: {
                parent_event: {
                  _eq: event.id
                }
              }
            });

            if (childEvents && childEvents.length) {
              await eventsService.updateBatch(childEvents.map((e: any) => ({
                id: e.id,
                status: "cancelled",
                cancel_reason: reason
              })));
            } else {
              console.warn("Multi day event doesn't have any child events to cancel");
            }
          }
          event.status = "cancelled";
          await eventsService.updateOne(eventId, event);
        } else {
          console.log("creating new event exception");
          // If the cancellation is for a single instance of an event
          // Create a new event exception
          const eventExceptionService = new ItemsService("event_exception", {
            knex: database,
            schema: req.schema,
            accountability: adminAccountability
          });

          await eventExceptionService.createOne({
            event: eventId,
            instance,
            is_cancelled: true,
            cancel_reason: reason
            // TODO: There could be more options for a recurring event exception
          });
        }

        return res.status(200).send("ok");
      } else {
        console.error("user does not have permission to cancel this event", loggedInUser, userCreatedEvent, userHasRole);
        return res.status(401).send("not allowed to cancel this event");
      }
    } catch (e) {
      console.error("error cancelling event", e);
      return res.status(500).send("error cancelling event");
    }
  });

  router.post("/booking/cancel", async (req: any, res: any) => {
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
      const userService = new UsersService({
        knex: database,
        schema: req.schema,
        accountability: adminAccountability
      });

      const loggedInUser = await userService.readOne(loggedInUserId, {
        fields: ["*", "role.name"]
      });

      const bookedUser = await userService.readOne(userId, {
        fields: ["*", "role.name"]
      });

      const allowedRoles = ["committee", "administrator"];
      const isParentOfBookedUser = bookedUser.role.name === "Junior" && bookedUser.parent === loggedInUserId;

      if (isParentOfBookedUser || loggedInUser.id === userId || allowedRoles.includes(loggedInUser.role.name.toLowerCase())) {
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
          date_cancelled: new Date(),
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

  router.post("/book", async (req: any, res: any) => {
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

      const event = await eventsService.readOne(eventId);
      const filter: any = {
        _and: [
          {
            event: {
              _eq: eventId
            }
          }
        ]
      };

      if (instance !== null && instance !== undefined) {
        filter._and.push({
          instance: {
            _eq: instance
          }
        });
      }

      const existingBookings = await eventBookingService.readByQuery({
        filter
      });

      const currentBookings = existingBookings.filter((b: any) => b.status !== "cancelled").length;
      const maxBookings = event.max_spaces;
      const usersToBook = userIds.length;

      if (maxBookings && currentBookings + usersToBook > maxBookings) {
        return res.json({
          result: false,
          statusCode: 101,
          message: "Event is full"
        });
      }

      const bookingResults = [];

      for (const userId of userIds) {
        const alreadyBooked = existingBookings?.filter((x: any) => x.user === userId && x.status !== "cancelled");
        if (alreadyBooked?.length) {
          bookingResults.push({
            result: false,
            message: "That user is already booked",
            userId
          });
          continue;
        }

        const alreadyCancelledBookings = existingBookings?.filter((x: any) => x.user === userId && x.status === "cancelled");
        if (alreadyCancelledBookings?.length) {
          const cancelledBooking = alreadyCancelledBookings[0];

          let status = "booked";

          const ordersService = new ItemsService("orders", {
            knex: database,
            schema: req.schema,
            accountability: AdminAccountability
          });

          const orders = await ordersService.readByQuery({
            filter: {
              user: {
                _eq: loggedInUserId
              }
            }
          });

          if (orders && orders.length) {
            const eventOrder = orders.filter((o: any) => {
              const metadata = JSON.parse(o.metadata);
              let result = metadata.event_id === eventId
                                    && o.status === "paid"
                                    && metadata.booked_user === userId;

              if (instance !== null && instance !== undefined) {
                result = result && metadata.instance === instance;
              }

              return result;
            });

            if (eventOrder.length) {
              console.log("Found an existing payment for this user!");
              status = "paid";
            // } else {
            //   console.log("User has not paid for this event yet");
            }
          } else {
            console.warn("No orders found for customer when re-booking event attendee");
            // Not sure what case this would be, possibly when a payment doesn't complete,
            // so we have a customer but no orders yet
          }

          await eventBookingService.updateOne(cancelledBooking.id, {
            status
          });

          bookingResults.push({
            result: true,
            message: "Your cancelled booking has been re-added",
            bookingId: cancelledBooking.id,
            userId
          });
          continue;
        }

        const bookingId = await eventBookingService.createOne({
          user: userId,
          event: eventId,
          instance: instance,
          status: "booked",
          checkin_code: nanoid()
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
    return await update(req, res, services, database);
  });

  router.post("/create", async (req, res) => {
    return await create(req, res, services, database);
  });

  router.post("/download-attendees", async (req: any, res: any) => {
    try {
      const eventId = req.query.eventId;
      const instance = req.query.instance;
      const loggedInUserId = req.accountability.user;

      const body = req.body;

      if (!eventId) {
        return res.status(400).send("missing event id");
      }

      const eventsService = new ItemsService("events", {
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

      if (leaders.filter(x => x.directus_users_id === loggedInUserId).length === 0) {
        return res.status(401).send("you are not a leader of that event");
      }

      const eventBookingService = new ItemsService("event_bookings", {
        knex: database,
        schema: req.schema,
        accountability: adminAccountability
      });

      const bookingsFilter: any = {
        _and: [
          {
            status: {
              _neq: "cancelled"
            }
          },
          {
            event: {
              _eq: eventId
            }
          }
        ]
      };

      if (instance) {
        bookingsFilter._and.push({
          instance: {
            _eq: instance
          }
        });
      }

      const bookings = await eventBookingService.readByQuery({
        fields: [
          "user.id",
          "user.email",
          "user.first_name",
          "user.last_name",
          "user.dob",
          "user.bc_number",
          "user.home_tel",
          "user.mobile",
          "user.parent.email",
          "user.parent.id",
          "user.parent.first_name",
          "user.parent.last_name",
          "user.parent.home_tel",
          "user.parent.mobile"
        ],
        filter: bookingsFilter
      });

      const userService = new UsersService({
        knex: database,
        schema: req.schema,
        accountability: adminAccountability
      });

      const medicalInfoService = new ItemsService("medical_info", {
        knex: database,
        schema: req.schema,
        accountability: adminAccountability
      });

      const emergancyContactsService = new ItemsService("emergency_contacts", {
        knex: database,
        schema: req.schema,
        accountability: adminAccountability
      });

      const result = [];
      const row = [];

      if (body.firstName) {
        row.push("first name");
      }

      if (body.lastName) {
        row.push("last name");
      }

      if (body.dob) {
        row.push("date of birth");
      }

      if (body.email) {
        row.push("email");
      }

      if (body.bcNumber) {
        row.push("bc number");
      }

      if (body.homeTel) {
        row.push("home telephone");
      }

      if (body.mobileNumber) {
        row.push("mobile");
      }

      if (body.medicalInfo) {
        row.push("allergies");
        row.push("asthma");
        row.push("epilepsy");
        row.push("diabetes");
        row.push("other medical condition");
        row.push("first_aid_consent");
        row.push("photography_consent");
        row.push("additional medical info");
      }

      if (body.emergencyContacts) {
        row.push("emergency contact name");
        row.push("emergency contact number");
      }

      if (body.parentDetails) {
        row.push("parent name");
        row.push("parent email");
        row.push("parent mobile");
      }

      result.push(row);

      for (const booking of bookings) {
        const bookingRow = [];
        if (body.firstName) {
          bookingRow.push(booking.user.first_name);
        }

        if (body.lastName) {
          bookingRow.push(booking.user.last_name);
        }

        if (body.dob) {
          bookingRow.push(booking.user.dob);
        }

        if (body.email) {
          bookingRow.push(booking.user.email);
        }

        if (body.bcNumber) {
          bookingRow.push(booking.user.bc_number);
        }

        if (body.homeTel) {
          bookingRow.push(booking.user.home_tel);
        }

        if (body.mobileNumber) {
          bookingRow.push(booking.user.mobile);
        }

        if (body.medicalInfo) {
          const medicalInfoItems = await medicalInfoService.readByQuery({
            fields: ["*"],
            filter: {
              user: {
                _eq: booking.user.id
              }
            }
          });

          let medicalInfo;
          if (medicalInfoItems && medicalInfoItems.length) {
            medicalInfo = medicalInfoItems[0];
          }

          const medicalInfoProps = [
            "allergies",
            "asthma",
            "epilepsy",
            "diabetes",
            "other",
            "first_aid_consent",
            "photography_consent"
          ];

          for (const prop of medicalInfoProps) {
            if (medicalInfo === null ||
                            medicalInfo === undefined ||
                            medicalInfo[prop] === null ||
                            medicalInfo[prop] === undefined) {
              bookingRow.push("Not specified");
            } else {
              bookingRow.push(medicalInfo[prop] ? "Yes" : "No");
            }
          }

          bookingRow.push(medicalInfo?.details || "Not specified");
        }

        if (body.emergencyContacts) {
          const contacts = await emergancyContactsService.readByQuery({
            fields: ["*"],
            filter: {
              user: {
                _eq: booking.user.id
              }
            }
          });

          let contact;
          if (contacts && contacts.length) {
            contact = contacts[0];
          }

          bookingRow.push(contact?.full_name);
          bookingRow.push(contact?.contact_number);
        }

        if (body.parentDetails && booking.user.parent) {

          let parent;
          if (booking.user.parent) {
            parent = await userService.readOne(booking.user.parent.id);
          }

          bookingRow.push(parent ? `${parent.first_name} ${parent.last_name}` : null);
          bookingRow.push(parent?.email);
          bookingRow.push(parent?.mobile);
        }

        result.push(bookingRow);
      }

      return res.status(200).send(result);
    } catch (e) {
      console.error("error downloading event attendee data", e);
      return res.status(500).send("error downloading event attendee data");
    }
  });

  router.post("/message/attendees", async (req: any, res: any) => {
    return await messageAttendees(req, res, services, database);
  });

  router.post("/message/leader", async (req: any, res: any) => {
    return await messageLeader(req, res, services, database);
  });
});
