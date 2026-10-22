import {defineEndpoint} from "@directus/extensions-sdk";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_KEY!);

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
      const userId = req.accountability?.user;

      if (!userId) {
        return res.status(401).send("not logged in");
      }

      if (!Array.isArray(req.body.orders)) {
        return res.status(400).send("missing orders");
      }

      // Only take the fields checkout sets, orders always start pending and belong to the logged in user
      const orders = req.body.orders.map((order: any) => ({
        user: userId,
        status: "pending",
        amount: order.amount,
        customer_id: order.customer_id,
        description: order.description,
        payment_reference: order.payment_reference,
        metadata: order.metadata
      }));

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
      // This endpoint is public, so only the session id is taken from the request and everything
      // else is read back from Stripe. Older callers send the whole session, so fall back to its id.
      const sessionId = req.body.sessionId ?? req.body.sessionWithLineItems?.id;

      if (typeof sessionId !== "string" || !sessionId.startsWith("cs_")) {
        return res.status(400).send("missing session id");
      }

      let session: Stripe.Checkout.Session;
      try {
        session = await stripe.checkout.sessions.retrieve(sessionId);
      } catch (e: any) {
        console.error("unable to retrieve checkout session", sessionId, e.message);
        return res.status(400).send("unknown session");
      }

      if (session.status !== "complete" || session.payment_status !== "paid") {
        console.warn("checkout session is not paid", sessionId, session.status, session.payment_status);
        return res.status(400).send("session not paid");
      }

      const metadata: any = session.metadata ?? {};
      console.log("handling paid checkout session", sessionId, metadata);

      if (!metadata.event_id || !metadata.user_ids || !metadata.order_ids) {
        console.error("checkout session is missing booking metadata", sessionId);
        return res.status(400).send("missing booking metadata");
      }

      const ordersService = new ItemsService("orders", {
        schema: req.schema,
        accountability: adminAccountability
      });

      const orderIds = metadata.order_ids.split(",");

      // Stripe can deliver the same webhook more than once, don't book people twice
      const alreadyPaid = await ordersService.readByQuery({
        fields: ["id"],
        filter: {
          _and: [
            {
              id: {
                _in: orderIds
              }
            },
            {
              status: {
                _eq: "paid"
              }
            }
          ]
        },
        limit: -1
      });

      if (alreadyPaid.length) {
        console.log("checkout session already handled", sessionId);
        return res.send("ok");
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

      const orders = orderIds
        .map((id: string) => ({
          id,
          status: "paid",
          payment_intent: session.payment_intent,
        }));

      await ordersService.updateBatch(orders);

      return res.send("ok");
    }catch(e){
      console.error("error handling event payment", e);
      return res.status(500).send("error handling event payment");
    }
  });
});
