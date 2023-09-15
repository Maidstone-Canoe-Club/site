import Stripe from "stripe";
import { ofetch } from "ofetch";

const stripe = new Stripe(process.env.STRIPE_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export default defineEventHandler(async (event) => {
  if (!endpointSecret) {
    throw createError({
      statusCode: 400,
      statusMessage: "Webhook error: No endpoint secret"
    });
  }

  const sig = getRequestHeader(event, "stripe-signature");
  if (!sig) {
    throw createError({
      statusCode: 400,
      statusMessage: "Webhook error: No stripe signature in header"
    });
  }
  const rawBody = await readRawBody(event);
  if (!rawBody) {
    throw createError({
      statusCode: 400,
      statusMessage: "Webhook error: No body"
    });
  }

  let stripeEvent: Stripe.Event;
  const bodyBuffer = Buffer.from(rawBody, "utf-8");

  try {
    stripeEvent = stripe.webhooks.constructEvent(bodyBuffer, sig, endpointSecret);
  } catch (err) {
    console.error(err);
    throw createError({
      statusCode: 400,
      statusMessage: "Webhook error: Error validating webhook event"
    });
  }

  if (stripeEvent.type === "checkout.session.completed") {
    console.log("completed!");
    const sessionWithLineItems = await stripe.checkout.sessions.retrieve(stripeEvent.data.object.id,
      {
        expand: ["line_items"]
      });

    try {
      await ofetch("/payments/handle/event", {
        method: "POST",
        baseURL: process.env.NUXT_DIRECTUS_URL,
        body: {
          sessionWithLineItems
        }
      });
    } catch (e) {
      console.error("Error handling payment", e);
      throw createError({
        statusCode: 500,
        statusMessage: "Error handling payment"
      });
    }
  }

  return `handled ${stripeEvent.type}`;
});
