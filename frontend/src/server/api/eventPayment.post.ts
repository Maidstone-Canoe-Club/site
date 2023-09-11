import Stripe from "stripe";
import { Directus } from "@directus/sdk";
import { format } from "date-fns";

const stripe = new Stripe(process.env.STRIPE_KEY);

const directus = new Directus<Types>(process.env.NUXT_DIRECTUS_URL!);
const events = directus.items("events");
const customers = directus.items("stripe_customers");
const users = directus.items("directus_users");

async function getOrCreateCustomer (user: any) {
  const existingCustomers = await customers.readByQuery({
    filter: {
      user: {
        _eq: user.id
      }
    }
  });

  const customer = existingCustomers.data && existingCustomers.data.length ? existingCustomers.data[0] : null;
  if (customer) {
    return customer.customer_id;
  }

  const newCustomer = await stripe.customers.create({
    name: `${user.first_name} ${user.last_name}`,
    email: user.email
  });

  await customers.createOne({
    customer_id: newCustomer.id,
    user: user.id
  });

  return newCustomer.id;
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";

  const eventId = query.eventId;
  const userId = query.userId;
  const instance = query.instance;

  try {
    // TODO: Move call to load data needed for the checkout session create to an extension

    const eventItem = await events.readOne(eventId);

    if (!eventItem) {
      throw new Error("Could not load event");
    }

    const user = await users.readOne(userId);
    if (!user) {
      throw new Error("Could not load user");
    }

    // TODO: if recurring event, calculate event date from recurring_event_pattern
    const eventDate = format(new Date(eventItem.start_date), "do MMMM yyyy");
    const productName = `${eventItem.title}: ${eventDate}`;

    const price = eventItem.price;

    // if user role === junior && junior query flag passed, set price to event.junior

    const customerId = await getOrCreateCustomer(user);

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
      success_url: `${baseUrl}/payments/success`,
      cancel_url: `${baseUrl}/payments/cancel`
    });

    return sendRedirect(event, session.url, 302);
  } catch (e) {
    throw createError({
      statusCode: 500,
      statusMessage: "Unable to submit payment: " + e.message
    });
  }
});
