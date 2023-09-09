import { defineEndpoint } from '@directus/extensions-sdk';

export default defineEndpoint((router, {services, database}) => {
	const {ItemsService} = services;

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

		if(eventType === "single"){
			return await createSingleEvent(eventItem, eventService, res);
		}else if(eventType === "multi"){
			return await createMultiEvent(eventItem, eventDates, eventService, res);
		}else if(eventType === "recurring"){
			return createRecurringEvent(eventItem, eventDates, res);
		}else{
			return res.status(400).send("unknown event type");
		}
	});
});

async function createSingleEvent(eventItem, eventService, res){

	try {
		const result = await eventService.createOne({
			title: eventItem.title,
			description: eventItem.description,
			location: eventItem.location,
			start_date: eventItem.startDate,
			end_date: eventItem.end_date,
			price: eventItem.price,
			junior_price: eventItem.junior_price
		});

		return res.send(result);
	}catch(e){
		console.error("unable to create new event", e);
		return res.status(500).send("unable to create new event");
	}
}

async function createMultiEvent(eventItem, eventDates, eventService, res){

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

		for(let i = 1; i < eventDates.multiple.length; i++){
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
	}catch(e){
		console.error("unable to create new event", e);
		return res.status(500).send("unable to create new event");
	}
}

function createRecurringEvent(eventItem, eventDates, res){
	return res.send("ok");
}
