import {AdminAccountability, isUserLeader} from "./utils";
import {RRule} from "rrule";

export async function getConsentInfo(req: any, res: any, services: any, database: any) {
  const {
    ItemsService,
    UsersService
  } = services;

  try {
    const bookingId = req.query.bookingId;
    const userId = req.accountability.user;

    console.log("got booking", bookingId);
    console.log("got user", userId);

    if (!bookingId) {
      return res.status(400).send("Missing booking id");
    }

    if (!userId) {
      return res.status(401).send("Not allowed");
    }

    const userService = new UsersService({
      knex: database,
      schema: req.schema,
      accountability: AdminAccountability
    });

    const eventsService = new ItemsService("events", {
      knex: database,
      schema: req.schema,
      accountability: AdminAccountability
    });

    const eventBookingService = new ItemsService("event_bookings", {
      knex: database,
      schema: req.schema,
      accountability: AdminAccountability
    });

    const emergencyContactsService = new ItemsService("emergency_contacts", {
      knex: database,
      schema: req.schema,
      accountability: AdminAccountability
    });

    const booking = await eventBookingService.readOne(bookingId);

    if (!booking) {
      console.error("Unknown booking");
      return res.status(400).send("Unknown booking");
    }

    console.log("got booking", booking);

    const event = await eventsService.readOne(booking.event);

    if (!event) {
      console.error("Unknown event on booking");
      return res.status(400).send("Unknown event on booking");
    }

    console.log("got event", event);

    const userIsLeader = await isUserLeader(req, services, database, event.id, userId);
    if (!userIsLeader) {
      console.error(`Non-leader tried to load consent form for booking: ${bookingId}`);
      return res.status(401).send("Not allowed");
    }

    console.log("user is leader");

    const participant = await userService.readOne(booking.user, {
      fields: ["*", "role.name"]
    });

    console.log("got participant", participant);

    let parent = null;

    if (participant.role.name === "junior") {
      parent = await userService.readOne(participant.parent);
    }

    const emergencyContacts = await emergencyContactsService.readByQuery({
      filter: {
        user: {
          _eq: participant.id
        }
      }
    });

    const emergencyContact = emergencyContacts?.length ? emergencyContacts[0] : null;

    const medicalInfoService = new ItemsService("medical_info", {
      knex: database,
      schema: req.schema,
      accountability: AdminAccountability
    });

    const medicalInfos = await medicalInfoService.readByQuery({
      filter: {
        user: {
          _eq: participant.id
        }
      }
    });

    console.log("got medical infos", medicalInfos);

    const medicalInfo = medicalInfos?.length ? medicalInfos[0] : null;

    console.log("got medical info", medicalInfo);

    const address = [
      participant.street_address,
      participant.city,
      participant.county,
      participant.postcode
    ].filter(p => p && p.trim() !== "").join(", ");

    const result = {
      eventName: event.title,
      startDate: event.start_date,
      fullName: `${participant.first_name} ${participant.last_name}`,
      emailAddress: participant.email,
      dob: participant.dob,
      parentName: parent ? `${parent.first_name} ${parent.last_name}` : null,
      address,
      mobile: participant.mobile,
      emergencyContact: emergencyContact.full_name,
      emergencyContactNumber: emergencyContact.contact_number,
      medical_consent: booking.medical_consent,
      photography_consent: booking.photography_consent,
      allergies: medicalInfo?.allergies,
      asthma: medicalInfo?.asthma,
      epilepsy: medicalInfo?.epilepsy,
      diabetes: medicalInfo?.diabetes,
      other: medicalInfo?.other,
      otherDetails: medicalInfo?.details
    };

    console.log(`Consent for for ${participant.id} requested by ${userId} for booking ${bookingId}`);

    return res.send(result);
  } catch (err: any) {
    console.error("Error fetching events", err);
    return res.status(500).send("Error fetching events");
  }
}


export async function get(req: any, res: any, services: any, database: any) {
  const {
    ItemsService
  } = services;

  try {
    const start = new Date(decodeURIComponent(req.query.start));
    const end = new Date(decodeURIComponent(req.query.end));
    const types = req.query.types as string[] | undefined;
    const count = req.query.count as number | undefined;

    const fields = [
      "id",
      "title",
      "start_date",
      "end_date",
      "last_occurrence",
      "is_recurring",
      "status",
      "type",
      "rrule",
      "allowed_roles",
      "allow_booking_after_start",
      "min_age",
      "parent_event",
      "max_spaces"
    ];

    const eventsService = new ItemsService("events", {
      knex: database,
      schema: req.schema,
      accountability: AdminAccountability
    });

    const filter: any = {
      _and: [
        {
          status: {_eq: "published"}
        },
        {
          start_date: {_lte: end}
        },
        {
          _or: [
            {
              end_date: {_gt: start}
            },
            {
              _and: [
                {
                  is_recurring: {_eq: true}
                },
                {
                  last_occurence: {_null: true}
                },
              ]
            },
          ]
        }
      ]
    };

    if (types?.length) {
      filter._and.push({
        type: {
          _in: types
        }
      });
    }

    let events = await eventsService.readByQuery({
      fields,
      filter,
      limit: count
    });

    events = events?.filter((e: any) => {
      if (e.is_recurring) {
        if (e.rrule) {
          const rule = RRule.fromString(e.rrule);
          const occurrences = rule.between(start, end, true).length;
          return occurrences > 0;
        }

        return false;
      }

      return true;
    });

    const eventBookingService = new ItemsService("event_bookings", {
      knex: database,
      schema: req.schema,
      accountability: AdminAccountability
    });

    for (const event of events) {
      const filter = {
        _and: [
          {
            event: {
              _eq: event.id
            }
          }
        ]
      };

      // TODO: Figure out how to get recurring event booking stats

      const bookings = await eventBookingService.readByQuery({
        filter
      });
      event.bookings = bookings.length;
    }

    return res.send(events);
  } catch (err) {
    console.error("Error fetching events", err);
    return res.status(500).send("Error fetching events");
  }
}
