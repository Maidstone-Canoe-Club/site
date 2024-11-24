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
    const types = req.query.types as string[] | undefined;
    const count = req.query.count as number | undefined;
    const bookings = req.query as boolean | undefined;

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

    if (types?.length) {
      filter._and.push({
        type: {
          _in: types
        }
      });
    }

    const eventResults = await eventsService.readByQuery({
      fields,
      filter,
      limit: count
    });

    let events = [];

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

      // Parse RRULE with time zone information
      const ruleOptions = RRule.parseString(event.rrule);
      ruleOptions.dtstart = eventStartDate;
      ruleOptions.tzid = timeZone;

      const rule = new RRule(ruleOptions);

      // Ensure 'start' and 'end' are in 'Europe/London' time zone
      const startLondon = utcToZonedTime(start, timeZone);
      const endLondon = utcToZonedTime(end, timeZone);

      // Get occurrences in the specified time range
      const occurrences = rule.between(startLondon, endLondon, true);

      const eventStartDay = startOfDay(eventStartDate);

      for (const occurrence of occurrences) {
        // occurrence is in 'Europe/London' time zone
        // Adjust end date based on duration
        const duration = eventEndDate.getTime() - eventStartDate.getTime();
        const combinedEndDate = new Date(occurrence.getTime() + duration);

        // Calculate instance number
        const instances = rule.between(eventStartDay, occurrence, true);

        events.push({
          ...event,
          start_date: occurrence,
          end_date: combinedEndDate,
          instance: instances.length - 1,
        });
      }
    }

    if (count && events.length > count) {
      events = events.slice(0, count);
    }

    if (events.length) {
      const eventExceptionService = new ItemsService("event_exception", {
        knex: database,
        schema: req.schema,
        accountability: AdminAccountability
      });

      const eventIds = [...new Set(events.map(e => e.id))];

      const exceptions = await eventExceptionService.readByQuery({
        filter: {
          event: {
            _in: eventIds
          }
        }
      });

      const isInstanceCancelled = (event: any, instance: string) => {
        return exceptions?.find((e: any) => e.event === event.id && e.instance === instance)?.is_cancelled ?? false;
      };

      if (exceptions && exceptions.length) {
        events = events.filter(e => {
          if (e.instance !== undefined) {
            if (isInstanceCancelled(e, `${e.instance}`)) {
              return false;
            }
          }

          return true;
        });
      }

      if (bookings) {
        const eventBookingService = new ItemsService("event_bookings", {
          knex: database,
          schema: req.schema,
          accountability: AdminAccountability
        });

        for (const event of events) {
          let filter = {};

          const eventId = event.parent_event?.id ?? event.id;

          if (event.instance !== undefined) {
            filter = {
              _and: [
                {
                  event: {
                    _eq: eventId
                  },
                },
                {
                  instance: {
                    _eq: event.instance
                  }
                }
              ]
            };
          } else {
            filter = {
              event: {
                _eq: eventId
              }
            };
          }

          const bookings = await eventBookingService.readByQuery({
            filter: {
              ...filter,
              status: {
                _neq: "cancelled"
              }
            }
          });
          event.bookings = bookings.length;
        }
      }
    }

    return res.send(events);
  } catch (err) {
    console.error("Error fetching events", err);
    return res.status(500).send("Error fetching events");
  }
}
