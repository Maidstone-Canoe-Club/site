import {defineEndpoint} from "@directus/extensions-sdk";

export default defineEndpoint((router, {services}) => {
  const {ItemsService} = services;
  const adminAccountability = {
    admin: true
  };

  router.post("/orders", async (req, res) => {
    try{
      const orders = req.body.orders;

      const ordersService = new ItemsService("orders", {
        schema: req.schema,
        accountability: adminAccountability
      });

      const orderIds = await ordersService.createMany(orders);
      console.log("created orders", orderIds);
      return res.send(orderIds);
    }catch(e){
      console.error("error creating orders", e);
      return res.status(500).send("error creating orders");
    }
  });

  router.post("/handle/event", async (req, res) => {
    try {
      const sessionWithLineItems = req.body.sessionWithLineItems;
      const metadata = sessionWithLineItems.metadata;

      console.log("session with line items", JSON.stringify(sessionWithLineItems));
      console.log("metadata", metadata);

      if(!sessionWithLineItems){
        return res.status(400).send("missing data");
      }

      // TODO: payments will be for different things like memberships, boat storage, keys, ect, need to handle for them

      const bookingService = new ItemsService("event_bookings", {
        schema: req.schema,
        accountability: adminAccountability
      });

      // TODO: Check for pre-existing cancelled booking and update to paid if found

      const userIds = metadata.user_ids.split(",");
      const eventBookings = [];

      for(const userId of userIds){
        eventBookings.push({
          user: userId,
          event: metadata.event_id,
          instance: metadata.event_instance,
          status: "paid"
        });
      }

      await bookingService.createMany(eventBookings);

      const ordersService = new ItemsService("orders", {
        schema: req.schema,
        accountability: adminAccountability
      });

      const orderIds = metadata.order_ids.split(",");
      const orders = orderIds
        .map(id => ({
          id,
          status: "paid",
          payment_intent: sessionWithLineItems.payment_intent,
        }));

      await ordersService.updateBatch(orders);

      return res.send("ok");
    }catch(e){
      console.error("error handling event payment", e);
      return res.status(500).send("error handling event payment");
    }
  });
});
