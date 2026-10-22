import {AdminAccountability, isUserLeader} from "./utils";
import {RRule} from "rrule";
import { startOfDay } from "date-fns";
import { utcToZonedTime } from 'date-fns-tz';

const timeZone = "Europe/London";

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

    const event = await eventsService.readOne(booking.event);

    if (!event) {
      console.error("Unknown event on booking");
      return res.status(400).send("Unknown event on booking");
    }

    const userIsLeader = await isUserLeader(req, services, database, event.id, userId);
    if (!userIsLeader) {
      console.error(`Non-leader tried to load consent form for booking: ${bookingId}`);
      return res.status(401).send("Not allowed");
    }

    const participant = await userService.readOne(booking.user, {
      fields: ["*", "role.name"]
    });

    let parent = null;

    if (participant.role.name === "Junior") {
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

    const medicalInfo = medicalInfos?.length ? medicalInfos[0] : null;

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
      parentEmail: parent ? parent.email : null,
      parentNumber: parent ? parent.mobile || parent.home_tel : null,
      address,
      mobile: participant.mobile,
      emergencyContact: emergencyContact?.full_name,
      emergencyContactNumber: emergencyContact?.contact_number,
      first_aid_consent: booking.medical_consent === undefined || booking.medical_consent === null
        ? medicalInfo?.first_aid_consent
        : booking.medical_consent,
      photography_consent: booking.photography_consent === undefined || booking.photography_consent === null
        ? medicalInfo?.photography_consent
        : booking.photography_consent,
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

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).send("Invalid start or end date");
    }

    // Query params always arrive as strings (or arrays of strings for repeated keys)
    const types: string[] = req.query.types === undefined
      ? []
      : [req.query.types].flat().filter((t: unknown) => typeof t === "string" && t !== "");
    const parsedCount = parseInt(req.query.count, 10);
    const count = Number.isFinite(parsedCount) && parsedCount > 0 ? parsedCount : undefined;
    // Booking counts are returned unless explicitly turned off, the upcoming lists rely on them
    const includeBookings = req.query.bookings !== "false";

    const fields = [
      "id",
      "title",
      "start_date",
      "end_date",
      "last_occurence",
      "is_recurring",
      "status",
      "type",
      "rrule",
      "allowed_roles",
      "allow_booking_after_start",
      "min_age",
      "parent_event.id",
      "parent_event.status",
      "max_spaces",
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

    if (types.length) {
      filter._and.push({
        type: {
          _in: types
        }
      });
    }

    // Without an explicit limit Directus silently caps results at 100 rows
    const eventResults = await eventsService.readByQuery({
      fields,
      filter,
      sort: ["start_date"],
      limit: -1
    });

    // Ensure 'start' and 'end' are in 'Europe/London' time zone
    const startLondon = utcToZonedTime(start, timeZone);
    const endLondon = utcToZonedTime(end, timeZone);

    let events: any[] = [];

    for (const event of eventResults) {
      if (event.parent_event && event.parent_event.status === "cancelled") {
        continue;
      }

      if (!event.is_recurring) {
        events.push(event);
        continue;
      }

      if (!event.rrule) {
        console.warn(`Found recurring date without an rrrule: ${event.id}`);
        continue;
      }

      // Parse event start and end dates in 'Europe/London' time zone
      const eventStartDate = utcToZonedTime(event.start_date, timeZone);
      const eventEndDate = utcToZonedTime(event.end_date, timeZone);
      const duration = eventEndDate.getTime() - eventStartDate.getTime();

      // Parse RRULE with time zone information
      const ruleOptions = RRule.parseString(event.rrule);
      ruleOptions.dtstart = eventStartDate;
      ruleOptions.tzid = timeZone;

      const rule = new RRule(ruleOptions);

      // Get occurrences in the specified time range
      const occurrences = rule.between(startLondon, endLondon, true);

      if (!occurrences.length) {
        continue;
      }

      // Occurrences in the range are consecutive, so only the first one's instance number
      // needs counting from the start of the series, the rest follow on from it
      const firstInstance = rule.between(startOfDay(eventStartDate), occurrences[0]!, true).length - 1;

      occurrences.forEach((occurrence, index) => {
        // occurrence is in 'Europe/London' time zone
        events.push({
          ...event,
          start_date: occurrence,
          end_date: new Date(occurrence.getTime() + duration),
          instance: firstInstance + index
        });
      });
    }

    if (events.length) {
      const eventExceptionService = new ItemsService("event_exception", {
        knex: database,
        schema: req.schema,
        accountability: AdminAccountability
      });

      const eventIds = [...new Set(events.map(e => e.id))];

      const exceptions = await eventExceptionService.readByQuery({
        fields: ["event", "instance"],
        filter: {
          _and: [
            {
              event: {
                _in: eventIds
              }
            },
            {
              is_cancelled: {
                _eq: true
              }
            }
          ]
        },
        limit: -1
      });

      // instance is an integer column, compare as strings so the types always line up
      const cancelledInstances = new Set(exceptions.map((e: any) => `${e.event}:${e.instance}`));

      events = events.filter(e => e.instance === undefined || !cancelledInstances.has(`${e.id}:${e.instance}`));
    }

    events.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

    if (count && events.length > count) {
      events = events.slice(0, count);
    }

    if (includeBookings && events.length) {
      const eventBookingService = new ItemsService("event_bookings", {
        knex: database,
        schema: req.schema,
        accountability: AdminAccountability
      });

      // Sessions of a multi-date event share the bookings of their parent
      const bookingEventIds = [...new Set(events.map(e => e.parent_event?.id ?? e.id))];

      // One grouped count instead of a query per event
      const bookingCounts = await eventBookingService.readByQuery({
        aggregate: {
          count: ["*"]
        },
        group: ["event", "instance"],
        filter: {
          _and: [
            {
              event: {
                _in: bookingEventIds
              }
            },
            {
              status: {
                _neq: "cancelled"
              }
            }
          ]
        },
        limit: -1
      });

      const countsByEvent = new Map<string, number>();
      const countsByInstance = new Map<string, number>();

      for (const row of bookingCounts) {
        const total = Number(row.count);
        countsByEvent.set(row.event, (countsByEvent.get(row.event) ?? 0) + total);
        countsByInstance.set(`${row.event}:${row.instance}`, total);
      }

      for (const event of events) {
        const eventId = event.parent_event?.id ?? event.id;

        event.bookings = event.instance === undefined
          ? countsByEvent.get(eventId) ?? 0
          : countsByInstance.get(`${eventId}:${event.instance}`) ?? 0;
      }
    }

    return res.send(events);
  } catch (err) {
    console.error("Error fetching events", err);
    return res.status(500).send("Error fetching events");
  }
}
