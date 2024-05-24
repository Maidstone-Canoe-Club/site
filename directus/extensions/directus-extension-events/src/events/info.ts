import {AdminAccountability} from "./utils";

export async function getInfo(req: any, res: any, services: any, database: any){
  const {
    ItemsService,
    UsersService
  } = services;

  try {
    const eventId = req.query.eventId;
    const eventInstance = req.query.instance;
    const userId = req.accountability.user;

    let user;

    if (userId) {
      const userService = new UsersService({
        knex: database,
        schema: req.schema,
        accountability: AdminAccountability
      });

      user = await userService.readOne(userId, {
        fields: ["*", "role.name"]
      });
    }

    const eventsService = new ItemsService("events", {
      knex: database,
      schema: req.schema,
      accountability: AdminAccountability
    });

    const eventExceptionService = new ItemsService("event_exception", {
      knex: database,
      schema: req.schema,
      accountability: AdminAccountability
    });

    const eventBookingService = new ItemsService("event_bookings", {
      knex: database,
      schema: req.schema,
      accountability: AdminAccountability
    });

    const eventLeadersService = new ItemsService("events_directus_users", {
      knex: database,
      schema: req.schema,
      accountability: AdminAccountability
    });

    const reviewersService = new ItemsService("reviewers", {
      knex: database,
      schema: req.schema,
      accountability: AdminAccountability
    });

    const event = await eventsService.readOne(eventId, {
      fields: [
        "*",
        "reviewed_by.first_name",
        "reviewed_by.last_name",
      ]
    });

    if (!event) {
      return res.status(404).send("could not find event");
    }

    const otherBookingRequired = !!event.required_event;
    let hasRequiredBooking = false;

    let requiredEventTitle = null;

    if (otherBookingRequired) {
      console.log("has other required booking", event.required_event);

      const bookings = await eventBookingService.readByQuery({
        fields: ["*", "required_event.id"],
        filter: {
          _and: [
            {
              event: {
                _eq: event.required_event
              }
            },
            {
              user: {
                _eq: userId
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

      console.log("other event bookings", bookings);

      if (bookings && bookings.length) {
        console.log("has required booking!");
        hasRequiredBooking = true;
      }

      const requiredEvent = await eventsService.readOne(event.required_event);
      console.log("required event", requiredEvent);
      requiredEventTitle = requiredEvent.title;
    }

    const leaders = await eventLeadersService.readByQuery({
      fields: ["*", "directus_users_id.first_name", "directus_users_id.last_name", "directus_users_id.avatar", "directus_users_id.id"],
      filter: {
        events_id: {
          _eq: event.id
        }
      }
    });

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

      // TODO: This can break if the user has been deleted
      alreadyBooked = eventBookings.filter((x: any) => x.user.id === userId).length > 0;
    }

    const allowedRoles = ["committee", "administrator"];
    let bookings = [];

    const userIsLeader = leaders.find((x: any) => x.directus_users_id.id === userId);
    const isCoachAndBooked = user && user.role.name.toLowerCase() === "coach"
            && eventBookings.some((x: any) => x.user.id === user.id);

    let userCanApprove = false;
    let reviewedBy = undefined;
    let reviewNotes = undefined;
    let paidUserIds = [];

    if (user) {
      if (allowedRoles.includes(user.role.name.toLowerCase()) || userIsLeader || isCoachAndBooked) {
        bookings = eventBookings;
      } else if (event.visible_attendees) {
        bookings = eventBookings.map((e: any) => ({
          id: e.id,
          status: e.status,
          user: {
            id: e.user.id,
            avatar: e.user.avatar,
            first_name: e.user.first_name,
            last_name: e.user.last_name,
          }
        }));
      } else {
        bookings = eventBookings.filter((b: any) => b.user.id === userId || b.user.parent === userId);
      }

      const reviewers = await reviewersService.readByQuery({
        filter: {
          _and: [
            {
              user: {
                _eq: userId
              }
            },
            {
              area: {
                _eq: "events"
              }
            }
          ]
        }
      });

      userCanApprove = reviewers && reviewers.length;

      if (userCanApprove) {
        reviewedBy = event.reviewed_by ? `${event.reviewed_by.first_name} ${event.reviewed_by.last_name}` : undefined;
        reviewNotes = event.review_notes;
      }

      if (event.one_time_payment && event.payment_reference) {
        const ordersService = new ItemsService("orders", {
          knex: database,
          schema: req.schema,
          accountability: AdminAccountability
        });

        const orders = await ordersService.readByQuery({
          filter: {
            _and: [
              {
                user: {
                  _eq: userId
                }
              },
              {
                payment_reference: {
                  _eq: event.payment_reference
                }
              },
              {
                status: {
                  _eq: "paid"
                }
              }
            ]
          }
        });

        paidUserIds = orders.map((o: any) => JSON.parse(o.metadata).booked_user);
      }
    }

    let isCancelled = event.status === "cancelled";
    let cancelReason = event.cancel_reason;

    if (event.is_recurring) {
      const exceptions = await eventExceptionService.readByQuery({
        filter: {
          _and: [
            {
              event: {
                _eq: event.id
              }
            },
            {
              instance: {
                _eq: eventInstance
              }
            },
            {
              is_cancelled: {
                _eq: "true"
              }
            }
          ]
        }
      });

      if (exceptions && exceptions.length) {
        const exception = exceptions[0];
        isCancelled = true;
        cancelReason = exception.cancel_reason;
      }
    }

    return res.json({
      spacesLeft,
      alreadyBooked,
      bookings,
      bookingsCount: eventBookings.length,
      leaders,
      otherBookingRequired,
      hasRequiredBooking,
      requiredEventTitle,
      userCanApprove,
      reviewedBy,
      reviewNotes,
      paidUserIds,
      isCancelled,
      cancelReason
    });
  } catch (e) {
    console.error("error getting event info", e);
    return res.status(500).send("error getting event info");
  }
}
