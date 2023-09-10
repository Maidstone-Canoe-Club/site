import {defineEndpoint} from '@directus/extensions-sdk';
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
    const {ItemsService} = services;

    router.post("/book", async (req, res) => {
        try {

            const eventId = req.query.eventId;
            const userId = req.query.userId;
            const instance = req.query.instance;

            if (!eventId) {
                return res.status(400).send("missing event id");
            }

            if (!userId) {
                return res.status(400).send("missing user id");
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

            const event = eventsService.readOne(eventId);

            const existingBookings = await eventBookingService.readByQuery({
                filter: {
                    event: {
                        _eq: eventId
                    }
                }
            });

            const currentBookings = existingBookings.length;
            const maxBookings = event.max_spaces;

            if (currentBookings + 1 > maxBookings) {
                return res.json({
                    result: false,
                    statusCode: 101,
                    message: "Event is full"
                });
            }

            const selfBooking = existingBookings?.filter(x => x.user === userId);
            if (selfBooking?.length) {
                return res.json({
                    result: false,
                    statusCode: 102,
                    message: "That user is already booked"
                });
            }

            const bookingId = await eventBookingService.createOne({
                user: userId,
                event: eventId,
                instance: instance
            });

            return res.json({
                result: true,
                statusCode: 100,
                data: bookingId
            });
        } catch (e) {
            console.log("error booking on to event", e);
            return res.status(500).send("something went wrong");
        }
    });

    router.post('/create', async (req, res) => {
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
            junior_price: eventItem.junior_price
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
            has_multiple: true
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
                parent_event: firstEventId
            });
        }

        const newIds = await eventService.createMany(newEvents);

        return res.send([firstEventId, ...newIds])
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
            last_occurance: endDate,
            is_recurring: true,
        });

        const recurringPattern = {
            event: newEventId,
            type: mapRecurringType(eventDates.recurring.recurringType.id),
            max_occurences: eventDates.recurring.maxOccurrences
        }

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
        }

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
            throw new Error(`Unknown recurring type: ${id}`)
    }
}
