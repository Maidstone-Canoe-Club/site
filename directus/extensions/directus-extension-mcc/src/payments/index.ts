import {defineEndpoint} from "@directus/extensions-sdk";

export default defineEndpoint((router, {services}) => {
  const {ItemsService} = services;
  const adminAccountability = {
    admin: true
  };

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

      const orders = [];

      for(const lineItem of sessionWithLineItems.line_items.data){
        orders.push({
          user: lineItem.price.metadata.customer_user_id,
          amount: lineItem.amount_total,
          customer_id: sessionWithLineItems.customer,
          description: lineItem.description,
          payment_intent: sessionWithLineItems.payment_intent,
          metadata: JSON.stringify({
            event_id: metadata.event_id,
            instance: metadata.event_instance,
            booked_user: lineItem.price.metadata.user_id
          })
        });
      }

      await ordersService.createMany(orders);

      // for(const userId of userIds){
      //   orders.push({
      //
      //   });
      // }

      // await ordersService.createOne({
      //   user: metadata.user_id,
      //   amount: sessionWithLineItems.amount_total,
      //   customer_id: sessionWithLineItems.customer,
      //   description: `${metadata.event_name} - ${metadata.date}`,
      //   payment_intent: sessionWithLineItems.payment_intent,
      //   metadata: JSON.stringify({
      //     event_id: metadata.event_id,
      //     instance: metadata.event_instance,
      //   })
      // });

      return res.send("ok");
    }catch(e){
      console.error("error handling event payment", e);
      return res.status(500).send("error handling event payment");
    }
  });
});
