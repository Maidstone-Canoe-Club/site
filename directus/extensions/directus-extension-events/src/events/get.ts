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
    const fields = [
      "id",
      "title",
      "start_date",
      "end_date",
      "last_occurrence",
      "is_recurring",
      "status",
      "type",
      "rrule"
    ];

    const eventsService = new ItemsService("events", {
      knex: database,
      schema: req.schema,
      accountability: adminAccountability
    });

    let events = await eventsService.readByQuery({
      fields,
      filter: {
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
      }
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

    return res.send(events);
  } catch (err) {
    console.error("Error fetching events", err);
    return res.status(500).send("Error fetching events");
  }
}
