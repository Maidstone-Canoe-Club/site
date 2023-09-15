import Stripe from "stripe";
import { Directus } from "@directus/sdk";
import { format } from "date-fns";
import { ofetch } from "ofetch";

const stripe = new Stripe(process.env.STRIPE_KEY);

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";

  const eventId = query.eventId;
  const userId = query.userId;
  const instance = query.instance;

  // const headers = getHeaders(event);
  // console.log("HEADERS", headers);

  try {
    const checkoutData = await ofetch(`/checkout/data?eventId=${eventId}&userId=${userId}`, {
      method: "GET",
      baseURL: process.env.NUXT_DIRECTUS_URL
    });

    const eventItem = checkoutData.event;
    const user = checkoutData.user;

    // TODO: if recurring event, calculate event date from recurring_event_pattern
    const eventDate = format(new Date(eventItem.start_date), "do MMMM yyyy");
    const productName = `${eventItem.title}: ${eventDate}`;

    const price = eventItem.price;

    // TODO: if user role === junior && junior query flag passed, set price to event.junior

    const authToken = getCookie(event, "directus_token");
    const customerId = await ofetch(`/checkout/customer?userId=${user.id}`, {
      method: "GET",
      baseURL: process.env.NUXT_DIRECTUS_URL,
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });

    let redirectUrl = `/events/${eventItem.id}`;
    if (instance) {
      redirectUrl += `?instance=${instance}`;
    }
    redirectUrl = encodeURIComponent(btoa(redirectUrl));

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      metadata: {
        date: eventDate,
        event_name: eventItem.title,
        event_id: eventItem.id,
        user_id: userId,
        event_instance: instance
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "GBP",
            unit_amount: price,
            product_data: {
              name: productName
            }
          }
        }
      ],
      mode: "payment",
      success_url: `${baseUrl}/payments/success?redirect=${redirectUrl}`,
      cancel_url: `${baseUrl}/payments/cancel?redirect=${redirectUrl}`
    });

    return sendRedirect(event, session.url, 302);
  } catch (e) {
    throw createError({
      statusCode: 500,
      statusMessage: "Unable to submit payment: " + e.message
    });
  }
});
