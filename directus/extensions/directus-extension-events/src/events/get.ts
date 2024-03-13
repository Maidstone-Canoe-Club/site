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

    const eventsService = new ItemsService("events", {
      knex: database,
      schema: req.schema,
      accountability: adminAccountability
    });

    let events = await eventsService.readByQuery({
      fields: ["*"], // TODO: Optimize
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
                end_date: {_null: true}
              },
              {
                last_occurence: {_gt: start}
              },
              {
                last_occurence: {_null: true}
              }
            ]
          }
        ]
      }
    });

    console.log("got events", events.length, events);

    events = events?.filter((e: any) => {
      if (e.is_recurring) {
        if (e.rrule) {

          console.log("checking recurring event", e.title);
          const rule = RRule.fromString(e.rrule);
          const occurrences = rule.between(start, end, true).length;
          console.log("occurrences: " + occurrences);
          return occurrences > 0;
        }
        console.warn("recurring event missing rrule", e.title);
        return false;
      }

      return true;
    });

    console.log("filtered events", events.length, events);

    return res.send(events);
  } catch (err) {
    console.error("Error fetching events", err);
    return res.status(500).send("Error fetching events");
  }
}

