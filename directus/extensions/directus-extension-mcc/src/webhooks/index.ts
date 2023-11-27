import {defineEndpoint} from "@directus/extensions-sdk";
import {ofetch} from "ofetch";
import {
  MailingList,
  InboundEmail,
  FullAddress,
  Subscriber
} from "../types";
import Stripe from "stripe";
import {handleMailForward} from "../mail-forwards";

const postmarkUrl = "https://api.postmarkapp.com";

const stripe = new Stripe(process.env.STRIPE_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export default defineEndpoint((router, {services, database}) => {
  const {ItemsService, MailService} = services;
  const adminAccountability = {
    admin: true
  };

  // REPLACED with nuxt server endpoint
  // router.post("/payment", async (req, res) => {
  //   try {
  //     if (!endpointSecret) {
  //       console.error("Webhook error: No endpoint secret");
  //       return res.status(500).send("Webhook error: No endpoint secret");
  //     }
  //
  //     const sig = req.header("Stripe-Signature");
  //     if (!sig) {
  //       console.error("Webhook error: No stripe signature in header");
  //       return res.send(400).send("Webhook error: No stripe signature in header");
  //     }
  //
  //     const bodyBuffer = req.rawBody;
  //     const stripeEvent: Stripe.Event = stripe.webhooks.constructEvent(bodyBuffer, sig, endpointSecret);
  //
  //     if (stripeEvent.type === "checkout.session.completed") {
  //       console.log("checkout completed!");
  //
  //       const sessionWithLineItems = await stripe.checkout.sessions.retrieve(stripeEvent.data.object.id,
  //         {
  //           expand: ["line_items"]
  //         });
  //
  //       const metadata = sessionWithLineItems.metadata;
  //
  //       console.log("checkout data", sessionWithLineItems, metadata);
  //
  //       // TODO: payments will be for different things like memberships, boats, ect, need to handle for them
  //
  //       const bookingService = new ItemsService("event_bookings", {
  //         schema: req.schema,
  //         accountability: adminAccountability
  //       });
  //
  //       // TODO: status paid?
  //       await bookingService.createOne({
  //         user: metadata.user_id,
  //         event: metadata.event_id,
  //         instance: metadata.event_instance
  //       });
  //
  //       const ordersService = new ItemsService("orders", {
  //         schema: req.schema,
  //         accountability: adminAccountability
  //       });
  //
  //       await ordersService.createOne({
  //         user: metadata.user_id,
  //         amount: sessionWithLineItems.amount_total,
  //         customer_id: sessionWithLineItems.customer,
  //         description: `${metadata.event_name} - ${metadata.date}`,
  //         payment_intent: sessionWithLineItems.payment_intent,
  //         metadata: JSON.stringify({
  //           event_id: metadata.event_id,
  //           instance: metadata.event_instance,
  //         })
  //       });
  //
  //       // TODO: send payment complete email to user
  //     }
  //
  //     return res.send(`handled ${stripeEvent.type}`);
  //   } catch (e) {
  //     console.error("Webhook error: Error validating webhook event", e);
  //     return res.status(400).send("Webhook error: Error validating webhook event");
  //   }
  // });

  router.post("/mail-inbound", async (req, res) => {
    try {
      const data: InboundEmail = req.body;

      const toAddresses = data.ToFull;

      if (!toAddresses || !toAddresses.length) {
        console.log("No to email addresses");
        return res.status(200).send("ok");
      }

      const mailThreadsService = new ItemsService("mail_threads", {
        schema: req.schema,
        accountability: adminAccountability
      });

      const mailForwardsService = new ItemsService("mail_forwards", {
        schema: req.schema,
        accountability: adminAccountability
      });

      const mailingListsService = new ItemsService("mailing_lists", {
        schema: req.schema,
        accountability: adminAccountability
      });

      const mailingListSubscribersService = new ItemsService("mailing_list_subscriber", {
        schema: req.schema,
        accountability: adminAccountability
      });

      const mailService = new MailService({schema: req.schema, knex: database});

      for (let i = 0; i < toAddresses.length; i++) {
        const toAddress = toAddresses[i]!;
        await handleMailingList(data, toAddress, mailingListsService, mailingListSubscribersService, mailService);
        await handleMailForward(data, toAddress, null, mailThreadsService, mailForwardsService);
      }

      return res.status(200).send("ok");
    } catch (e) {
      console.log("something went wrong", e);
      return res.status(500).send(e.message);
    }
  });
});

async function handleMailingList(data: InboundEmail, toAddress: FullAddress, mailingListsService: any, mailingListSubscribersService: any, mailService: any) {

  try {
    const to = toAddress.Email;
    const emailName = to.split("@")[0]!;

    console.log("trying to handle mailing list email");

    const foundLists: MailingList[] = await mailingListsService
      .readByQuery({
        filter: {
          email_name: {
            _eq: emailName.toLowerCase()
          }
        }
      });

    const mailingList: MailingList | null | undefined = foundLists.length > 0 ? foundLists[0] : null;

    console.log("found mailing list", mailingList);

    if (mailingList) {
      const subscribers: Subscriber[] = await mailingListSubscribersService
        .readByQuery({
          fields: ["list", "email"],
          filter: {
            _and: [
              {
                list: {
                  _eq: mailingList.id
                }
              },
              {
                email: {
                  _neq: data.From
                }
              }
            ]
          }
        });

      if (subscribers && subscribers.length) {
        console.log("found subscribers", subscribers);
        const subscriberChunks = chunkArray<Subscriber>(subscribers, 50);

        for (let j = 0; j < subscriberChunks.length; j++) {
          const chunk = subscriberChunks[j];
          if (!chunk) {
            continue;
          }

          let from: string;
          if(!data.FromName || data.FromName === ""){
            const emailNamePart = data.From.split("@")[0];
            from = `${emailNamePart} via ${mailingList.name} <${mailingList.email_name}@${process.env.EMAIL_DOMAIN}>`;
          }else{
            from = `${data.FromName} via ${mailingList.name} <${mailingList.email_name}@${process.env.EMAIL_DOMAIN}>`;
          }

          const emailsToSend = [];

          for(const subscriber of chunk){
            const bodyInput = data.HtmlBody || data.StrippedTextReply || data.TextBody;
            const body = await renderMailBody(bodyInput, mailingList.id, mailService);
            const unsubscribeUrl = getUnsubscribeUrl(mailingList.id);

            emailsToSend.push(
              {
                To: subscriber.email,
                From: from,
                Subject: data.Subject,
                // TextBody: data.StrippedTextReply,
                HtmlBody: body,
                ReplyTo: buildReplyToEmailAddress(mailingList),
                TrackOpens: true,
                TrackLinks: "None",
                MessageStream: "broadcast",
                Attachments: data.Attachments,
                Headers: [
                  {
                    name: "Precedence",
                    value: "list"
                  },
                  {
                    name: "List-Id",
                    value: `${mailingList.name} <${mailingList.email_name}@${process.env.EMAIL_DOMAIN}>`,
                  },
                  {
                    name: "List-Unsubscribe",
                    value: unsubscribeUrl
                  },
                  {
                    name: "Original-Sender",
                    value: data.From
                  }
                ]
              }
            );
          }

          // const emailsToSend = chunk.map(subscriber => ());

          console.log("sending emails!", emailsToSend);
          await sendBatchEmail(emailsToSend);
        }
      } else {
        console.log("there are no subscribers for mailing list:", emailName);
      }
    } else {
      console.log("could not find mailing list:", emailName);
    }
  } catch (e) {
    console.log("something went wrong handling mailing list email", e, e.message, e.data);
  }
}

async function sendBatchEmail(data: any) {
  console.log("Sending batch emails");
  return await ofetch("/email/batch", {
    method: "POST",
    baseURL: postmarkUrl,
    body: data,
    headers: {
      "X-Postmark-Server-Token": process.env.EMAIL_SMTP_PASSWORD!
    }
  }).catch((err) => {
    console.log("send mail error: ", err.data);
  });
}

function chunkArray<T>(input: T[], size: number): T[][] {
  const result : T[][] = [];

  for (let i = 0; i < input.length; i += size) {
    result.push(input.slice(i, i + size));
  }

  return result;
}

// function buildFromEmailAddress(mailingList: MailingList, subscriber: Subscriber) {
//   return `${subscriber.user.first_name} ${subscriber.user.last_name} <${mailingList.email_name}@${process.env.EMAIL_DOMAIN}>`;
// }

function getUnsubscribeUrl(listId: string){
  const encodedList = encodeURIComponent(btoa(listId));
  return `${process.env.PUBLIC_URL}/unsubscribe/mailing-list?l=${encodedList}`;
}

async function renderMailBody(htmlBody: string, listId: string, mailService: any){
  return await mailService.renderTemplate("broadcast-email", {
    content: htmlBody,
    url: getUnsubscribeUrl(listId)
  });
}

function buildReplyToEmailAddress(mailingList: MailingList) {
  return `${mailingList.email_name}@${process.env.EMAIL_DOMAIN}`;
}
