import {defineEndpoint} from "@directus/extensions-sdk";

export default defineEndpoint((router, {services}) => {
  const {ItemsService} = services;
  const adminAccountability = {
    admin: true
  };

  router.post("/orders/cancel", async (req: any, res: any) => {
    try{
      const orderIds: string[] = req.body.orderIds;
      const userId = req.accountability.user;

      if(!orderIds || !orderIds.length){
        return res.status(400).send("missing order ids");
      }

      const ordersService = new ItemsService("orders", {
        schema: req.schema,
        accountability: adminAccountability
      });

      const orders = await ordersService.readMany(orderIds, {
        fields: [
          "id",
          "user.id",
          "status"
        ],
        filter: {
          status: {
            _neq: "paid"
          }
        }
      });

      if(orders && orders.length) {

        if(orders.length !== orderIds.length){
          console.warn("difference in order count when cancelling");
        }

        for (const order of orders) {
          if (order.user.id !== userId) {
            console.error("trying to cancel order that does not belong to user", userId, order.user.id);
            return res.status(401).send("not allowed to cancel that order");
          }
        }

        console.log("cancelling " + orders.length + " orders");
        await ordersService.updateBatch(orders.map(x => ({
          id: x.id,
          status: "cancelled"
        })));
      }else{
        console.warn("no orders to cancel");
      }

    }catch(e){
      console.error("error cancelling orders", e);
      return res.status(500).send("error cancelling orders");
    }

    return res.send("ok");
  });

  router.post("/orders", async (req: any, res: any) => {
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

  router.post("/handle/event", async (req: any, res: any) => {
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
        .map((id: string) => ({
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
