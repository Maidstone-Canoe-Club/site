import {RRule} from "rrule";

const adminAccountability = {
  admin: true
};


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
      accountability: adminAccountability
    });

    const filter = {
      _and: [
        {
          status: {_neq: "cancelled"}
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
      accountability: adminAccountability
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
