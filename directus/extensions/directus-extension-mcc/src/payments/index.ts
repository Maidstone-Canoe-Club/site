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

      if(!sessionWithLineItems){
        return res.status(400).send("missing data");
      }

      // TODO: payments will be for different things like memberships, boat storage, keys, ect, need to handle for them

      const bookingService = new ItemsService("event_bookings", {
        schema: req.schema,
        accountability: adminAccountability
      });

      // TODO: status paid?
      await bookingService.createOne({
        user: metadata.user_id,
        event: metadata.event_id,
        instance: metadata.event_instance
      });

      const ordersService = new ItemsService("orders", {
        schema: req.schema,
        accountability: adminAccountability
      });

      await ordersService.createOne({
        user: metadata.user_id,
        amount: sessionWithLineItems.amount_total,
        customer_id: sessionWithLineItems.customer,
        description: `${metadata.event_name} - ${metadata.date}`,
        payment_intent: sessionWithLineItems.payment_intent,
        metadata: JSON.stringify({
          event_id: metadata.event_id,
          instance: metadata.event_instance,
        })
      });

      // TODO: send payment complete email to user

      return res.send("ok");
    }catch(e){
      console.error("error handling event payment", e);
      return res.status(500).send("error handling event payment");
    }
  });
});
