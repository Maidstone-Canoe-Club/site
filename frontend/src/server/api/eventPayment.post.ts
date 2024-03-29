﻿import Stripe from "stripe";
import { addDays, addMonths, addWeeks, addYears, format } from "date-fns";
import { ofetch } from "ofetch";

const stripe = new Stripe(process.env.STRIPE_KEY);

export function getDateFromInstance (date: string, instance: number, recurringType?: string) {
  let result = new Date(date);
  if (instance && recurringType) {
    switch (recurringType) {
    case "0": // daily
      result = addDays(new Date(date), instance - 1);
      break;
    case "1": // weekly
      result = addWeeks(new Date(date), instance - 1);
      break;
    case "2": // monthly
      result = addMonths(new Date(date), instance - 1);
      break;
    case "3": // yearly
      result = addYears(new Date(date), instance - 1);
      break;
    default:
      throw new Error("Invalid recurring pattern type: " + recurringType);
    }
  }

  return result;
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const body = await readBody(event);
  const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";

  const eventId = query.eventId;
  const userId = query.userId;
  const instance = query.instance;
  const patternType = query.patternType;
  const userIds = body.userIds;

  try {
    const checkoutData = await ofetch(`/checkout/data?eventId=${eventId}`, {
      method: "POST",
      baseURL: process.env.NUXT_PUBLIC_DIRECTUS_URL,
      body: {
        userIds
      }
    });

    const eventItem = checkoutData.event;
    const users = checkoutData.users;

    const date = getDateFromInstance(eventItem.start_date, instance, patternType);
    const eventDate = format(date, "do MMMM yyyy");
    const productName = `${eventItem.title}: ${eventDate}`;

    const authToken = getCookie(event, "directus_token");
    const customerId = await ofetch(`/checkout/customer?userId=${userId}`, {
      method: "GET",
      baseURL: process.env.NUXT_PUBLIC_DIRECTUS_URL,
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });

    let redirectUrl = `/events/${eventItem.id}`;
    if (instance) {
      redirectUrl += `?instance=${instance}`;
    }
    redirectUrl = encodeURIComponent(btoa(redirectUrl));

    const lineItems = [];
    const orders = [];

    console.log("product name", productName);

    for (const user of users) {
      console.log("adding user", user.id);

      let name = productName;

      let price = eventItem.price;
      let isJunior = false;

      if (eventItem.advanced_pricing) {
        switch (user.role.name.toLowerCase()) {
        case "member":
          name += " (Member pricing)";
          price = eventItem.member_price;
          break;
        case "non_member":
          name += " (Non-member pricing)";
          price = eventItem.non_member_price;
          break;
        case "committee":
        case "coach":
          name += " (Coach pricing)";
          price = eventItem.coach_price;
          break;
        default:
          console.warn("Unhandled user role when setting price: " + user.role.name);
          break;
        }
      } else if (user.role.name === "Junior") {
        name += " (Junior)";
        price = eventItem.junior_price;
        isJunior = true;
      }

      lineItems.push({
        quantity: 1,
        price_data: {
          currency: "GBP",
          unit_amount: price ?? 0,
          product_data: {
            name
          }
        }
      });

      orders.push({
        user: userId,
        amount: price,
        customer_id: customerId,
        status: "pending",
        description: name,
        metadata: JSON.stringify({
          event_id: eventId,
          instance,
          booked_user: user.id,
          is_junior: isJunior
        })
      });
    }

    const orderIds = await ofetch("/payments/orders", {
      method: "POST",
      baseURL: process.env.NUXT_PUBLIC_DIRECTUS_URL,
      body: {
        orders
      }
    });

    console.log("created orders");

    const formattedOrderIds = Array.isArray(orderIds) ? orderIds.join(",") : orderIds;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      metadata: {
        date: eventDate,
        event_name: eventItem.title,
        event_id: eventItem.id,
        customer_user_id: userId,
        user_ids: Array.isArray(userIds) ? userIds.join(",") : userIds,
        order_ids: formattedOrderIds,
        event_instance: instance
      },
      line_items: lineItems,
      mode: "payment",
      success_url: `${baseUrl}/payments/success?redirect=${redirectUrl}`,
      cancel_url: `${baseUrl}/payments/cancel?redirect=${redirectUrl}&o=${encodeURIComponent(btoa(formattedOrderIds))}`
    });

    console.log("created session");

    return sendRedirect(event, session.url, 302);
  } catch (e) {
    console.error("Unable to submit payment", e.message);
    throw createError({
      statusCode: 500,
      statusMessage: "Unable to submit payment"
    });
  }
});
