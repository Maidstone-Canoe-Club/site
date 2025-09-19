import Stripe from "stripe";
import { format } from "date-fns";
import { RRule } from "rrule";
import { DirectusUser } from "nuxt-directus/dist/runtime/types";
import type { EventItem } from "~/types";

const stripe = new Stripe(process.env.STRIPE_KEY);

export function getDatesOfInstance (event: EventItem, instance: number) {
  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);

  if (!event.is_recurring) {
    return {
      start: startDate,
      end: endDate
    };
  }

  const duration = endDate.getTime() - startDate.getTime();
  const ruleData = RRule.fromString(event.rrule!);

  // TODO: This will need some optimisation in the future.
  // Has to iterator over each date to get to the current instance
  const all = ruleData.all((_, i) => {
    return i < instance + 1;
  });

  const start = all[instance];
  start.setHours(startDate.getHours(), startDate.getMinutes(), startDate.getSeconds());
  const end = new Date(endDate.getTime() + duration);

  return {
    start,
    end
  };
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const body = await readBody(event);
  const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";

  const eventId = query.eventId;
  const userId = query.userId;
  const instance = query.instance as number;
  const userIds = body.userIds;
  const paymentReference = query.ref;

  try {
    const checkoutData = await $fetch<{
      event: EventItem,
      users: DirectusUser[]
    }>(`/checkout/data?eventId=${eventId}`, {
      method: "POST",
      baseURL: process.env.NUXT_PUBLIC_DIRECTUS_URL,
      body: {
        userIds
      }
    });

    const eventItem = checkoutData.event;
    const users = checkoutData.users;

    const date = getDatesOfInstance(checkoutData.event, instance).start;
    const eventDate = format(date, "do MMMM yyyy");
    const productName = `${eventItem.title}: ${eventDate}`;

    const authToken = getCookie(event, "directus_token");
    const customerId = await $fetch<string>(`/checkout/customer?userId=${userId}`, {
      method: "GET",
      baseURL: process.env.NUXT_PUBLIC_DIRECTUS_URL,
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });

    let redirectUrl = `/events/${eventItem.id}`;
    if (instance !== null && instance !== undefined) {
      redirectUrl += `?instance=${instance}`;
    }
    redirectUrl = encodeURIComponent(btoa(redirectUrl));

    const lineItems = [];
    const orders = [];

    for (const user of users) {
      let name = productName;

      let price = eventItem.price;
      let isJunior = false;
      const role = user.role.name.toLowerCase();

      if (eventItem.advanced_pricing) {
        if (role === "junior") {
          isJunior = true;
          if (eventItem.non_member_junior_price) {
            if (user.bc_number) {
              name += " (Junior member)";
              price = eventItem.junior_price;
            } else {
              name += " (Junior non-member)";
              price = eventItem.non_member_junior_price;
            }
          } else {
            name += " (Junior)";
            price = eventItem.junior_price;
          }
        } else if (role === "coach" || user.is_coach) {
          name += " (Coach pricing)";
          price = eventItem.coach_price;
        } else if (role === "member" || role === "committee") {
          name += " (Member pricing)";
          price = eventItem.member_price;
        } else if (role === "unapproved") {
          name += " (Non-member pricing)";
          price = eventItem.non_member_price;
        } else {
          console.warn(`Unhandled role when setting line item price: ${role}`);
        }
      } else if (role === "junior") {
        isJunior = true;
        name += " (Junior)";
        price = eventItem.junior_price;
      } else {
        price = eventItem.price;
      }

      if (!price || price === 0) {
        console.warn(`Zero price for user: ${user.id}`);
        continue;
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
        payment_reference: paymentReference,
        metadata: JSON.stringify({
          event_id: eventId,
          instance,
          booked_user: user.id,
          is_junior: isJunior
        })
      });
    }

    if (!lineItems.length) {
      console.warn("No line items found when creating payment");
    }

    const orderIds = await $fetch<string[]>("/payments/orders", {
      method: "POST",
      baseURL: process.env.NUXT_PUBLIC_DIRECTUS_URL,
      body: {
        orders
      }
    });

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
        event_instance: instance,
        payment_reference: paymentReference
      },
      line_items: lineItems,
      mode: "payment",
      success_url: `${baseUrl}/payments/success?redirect=${redirectUrl}`,
      cancel_url: `${baseUrl}/payments/cancel?redirect=${redirectUrl}&o=${encodeURIComponent(btoa(formattedOrderIds))}`
    });

    return sendRedirect(event, session.url, 302);
  } catch (e) {
    console.error("Unable to submit payment", e.message);
    throw createError({
      statusCode: 500,
      statusMessage: "Unable to submit payment"
    });
  }
});
