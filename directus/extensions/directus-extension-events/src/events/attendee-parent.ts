import {AdminAccountability, isUserLeader, userHasRole} from "../../../shared/utils";

// A junior's parent, for the people who can see an event's attendee details (committee, the event's leaders and
// coaches booked on it). Members can only read other users' names, so this can't be loaded directly
export async function getAttendeeParent(req: any, res: any, services: any, database: any) {
  const {
    ItemsService,
    UsersService
  } = services;

  try {
    const userId = req.accountability?.user;
    const bookingId = req.query.bookingId;

    if (!userId) {
      return res.status(401).send("Not allowed");
    }

    if (!bookingId) {
      return res.status(400).send("Missing booking id");
    }

    const eventBookingService = new ItemsService("event_bookings", {
      knex: database,
      schema: req.schema,
      accountability: AdminAccountability
    });

    const booking = await eventBookingService.readOne(bookingId, {
      fields: ["id", "event", "instance", "user.parent"]
    }).catch(() => null);

    const parentId = booking?.user?.parent;

    if (!parentId) {
      return res.status(404).send("No parent found for that booking");
    }

    let allowed = await userHasRole(req, services, database, userId, ["Committee", "Administrator"])
      || await isUserLeader(req, services, database, booking.event, userId);

    if (!allowed && await userHasRole(req, services, database, userId, ["Coach"])) {
      const coachBookings = await eventBookingService.readByQuery({
        fields: ["id"],
        filter: {
          event: {_eq: booking.event},
          user: {_eq: userId},
          status: {_neq: "cancelled"},
          ...(booking.instance !== null && booking.instance !== undefined ? {instance: {_eq: booking.instance}} : {})
        },
        limit: 1
      });
      allowed = coachBookings.length > 0;
    }

    if (!allowed) {
      return res.status(403).send("Not allowed");
    }

    const usersService = new UsersService({
      knex: database,
      schema: req.schema,
      accountability: AdminAccountability
    });

    const parent = await usersService.readOne(parentId, {
      fields: ["id", "first_name", "last_name", "avatar", "dob", "email", "mobile", "home_tel", "parent", "role.name"]
    });

    return res.json(parent);
  } catch (err) {
    console.error("Error loading attendee parent", err);
    return res.status(500).send("Error loading attendee parent");
  }
}
