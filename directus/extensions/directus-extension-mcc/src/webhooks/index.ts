import {defineEndpoint} from "@directus/extensions-sdk";
import {ofetch} from "ofetch";
import {customAlphabet} from "nanoid";
import {alphanumeric} from "nanoid-dictionary";
import {
  MailingList,
  InboundEmail,
  FullAddress,
  OutboundEmail, Subscriber
} from "../types";

const postmarkUrl = "https://api.postmarkapp.com";

const nanoid = customAlphabet(alphanumeric, 11);


export default defineEndpoint((router, {services}) => {
  const {ItemsService} = services;
  const adminAccountability = {
    admin: true
  };

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

      for (let i = 0; i < toAddresses.length; i++) {
        const toAddress = toAddresses[i]!;
        await handleMailingList(data, toAddress, mailingListsService, mailingListSubscribersService);
        await handleMailForward(data, toAddress, mailThreadsService, mailForwardsService);
      }

      return res.status(200).send("ok");
    } catch (e) {
      console.log("something went wrong", e);
      return res.status(500).send(e.message);
    }
  });
});

async function handleMailingList(data: InboundEmail, toAddress: FullAddress, mailingListsService: any, mailingListSubscribersService: any) {

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
          fields: ["list", "user.email"],
          filter: {
            list: {
              _eq: mailingList.id
            }
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

          const emailsToSend = chunk.map(subscriber => ({
            To: subscriber.user.email,
            From: `${data.FromName} via ${mailingList.name} <${mailingList.email_name}@${process.env.EMAIL_DOMAIN}>`,
            Subject: data.Subject,
            TextBody: data.StrippedTextReply,
            HtmlBody: data.HtmlBody,
            ReplyTo: buildReplyToEmailAddress(mailingList),
            TrackOpens: true,
            TrackLinks: "None",
            MessageStream: "broadcast"
          }));

          console.log("sending emails!", emailsToSend);
          await sendBatchEmail(emailsToSend, {
            "Precedence": "list",
            "List-Id": `${mailingList.name} <${mailingList.email_name}@${process.env.EMAIL_DOMAIN}>`,
            "List-Unsubscribe": `<${process.env.PUBLIC_URL}/unsubscribe?list=${mailingList.email_name}>`,
            "Original-Sender": data.From
          });
        }
      } else {
        console.log("there are no subscribers for mailing list:", emailName);
      }
    } else {
      console.log("could not find mailing list:", emailName);
    }
  }catch(e){
    console.log("something went wrong handling mailing list email", e, e.message, e.data);
  }
}

async function handleMailForward(data: InboundEmail, toAddress: FullAddress, mailThreadsService: any, mailForwardsService: any) {

  if (toAddress.Email.startsWith("reply+")) {
    const threadId = toAddress.MailboxHash;

    try {
      const existingThread = await mailThreadsService.readOne(threadId);

      if (existingThread) {
        if (data.FromFull.Email.toLowerCase() === existingThread.target_email.toLowerCase()) {
          let fromName = `forwards@${process.env.EMAIL_DOMAIN}`;

          const forwards = await mailForwardsService.readByQuery({
            filter: {
              target_email: {
                _eq: data.FromFull.Email.toLowerCase()
              }
            }
          });

          const forward = forwards.length ? forwards[0] : null;

          if (forward && forward.from_name) {
            fromName = `${forward.from_name} <${fromName}>`;
          }

          await sendEmail({
            From: fromName,
            To: existingThread.sender_email,
            HtmlBody: data.HtmlBody,
            Subject: data.Subject,
            ReplyTo: `reply+${existingThread.id}@${process.env.EMAIL_DOMAIN}`,
            TrackLinks: "None",
            Tag: "forwards",
            Attachments: data.Attachments
          });
        } else if (data.FromFull.Email.toLowerCase() === existingThread.sender_email.toLowerCase()) {
          let fromName = `forwards@${process.env.EMAIL_DOMAIN}`;

          if (data.FromName) {
            fromName = `${data.FromName} <${fromName}>`;
          }

          await sendEmail({
            From: fromName,
            To: existingThread.target_email,
            HtmlBody: data.HtmlBody,
            Subject: data.Subject,
            ReplyTo: `reply+${existingThread.id}@${process.env.EMAIL_DOMAIN}`,
            TrackLinks: "None",
            Tag: "forwards",
            Attachments: data.Attachments
          });
        } else {
          console.log("no thread found for", threadId);
        }
      } else {
        console.log("something went wrong, unknown from address for thread");
      }
    } catch (e) {
      console.log("something went wrong continuing mail thread", threadId, e, e.message, e.data);
    }
  } else {
    // We have received a new email to forward
    try {
      const name = toAddress.Email.split("@")[0];

      // if toAddress is to a forward address
      const forwards = await mailForwardsService.readByQuery({
        filter: {
          name: {
            _eq: name
          }
        }
      });

      const forward = forwards && forwards.length ? forwards[0] : null;

      if (forward) {
        const newThreadId = nanoid();

        await mailThreadsService.createOne({
          id: newThreadId,
          target_email: forward.target_email,
          sender_email: data.FromFull.Email
        });

        let fromAddress = `<forwards@${process.env.EMAIL_DOMAIN}>`;

        if (data.FromName) {
          fromAddress = `${data.FromName} ${fromAddress}`;
        }

        // send email to target
        await sendEmail({
          From: fromAddress,
          To: forward.target_email,
          HtmlBody: data.HtmlBody,
          Subject: data.Subject,
          ReplyTo: `reply+${newThreadId}@${process.env.EMAIL_DOMAIN}`,
          TrackLinks: "None",
          Tag: "forwards",
          Attachments: data.Attachments
        });
      } else {
        console.log("no forward found for", name);
      }
    } catch (e) {
      console.log("something went wrong creating a new mail thread", e, e.message, e.data);
    }
  }
}

async function sendEmail(email: OutboundEmail) {
  return await ofetch("/email", {
    baseURL: postmarkUrl,
    method: "POST",
    headers: {
      "X-Postmark-Server-Token": process.env.EMAIL_SMTP_PASSWORD!
    },
    body: email
  }).catch((err) => {
    console.log("send mail error: ", err.data);
  });
}

async function sendBatchEmail(data: any, headers?: any) {
  return await ofetch("/email/batch", {
    method: "POST",
    baseURL: postmarkUrl,
    body: data,
    headers: {
      "X-Postmark-Server-Token": process.env.EMAIL_SMTP_PASSWORD,
      ...headers
    }
  }).catch((err) => {
    console.log("send mail error: ", err.data);
  });
}

function chunkArray<T>(input: T[], size: number): T[][] {
  const result = [];

  for (let i = 0; i < input.length; i += size) {
    result.push(input.slice(i, i + size));
  }

  return result;
}

// function buildFromEmailAddress(mailingList: MailingList, subscriber: Subscriber) {
//   return `${subscriber.user.first_name} ${subscriber.user.last_name} <${mailingList.email_name}@${process.env.EMAIL_DOMAIN}>`;
// }

function buildReplyToEmailAddress(mailingList: MailingList) {
  return `${mailingList.email_name}@${process.env.EMAIL_DOMAIN}`;
}
