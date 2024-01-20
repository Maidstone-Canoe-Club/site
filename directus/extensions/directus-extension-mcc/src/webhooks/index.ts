import {defineEndpoint} from "@directus/extensions-sdk";
import {
  MailingList,
  InboundEmail,
  FullAddress,
  Subscriber
} from "../types";
import {handleMailForward, sendEmail} from "../mail-forwards";
import {chunkArray, sendBatchEmail} from "../send-email";

export default defineEndpoint((router, {services, database}) => {
  const {ItemsService, MailService} = services;
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

    if (!mailingList) {
      console.log("could not find mailing list:", emailName);
      return;
    }

    let subscribers: Subscriber[] = await mailingListSubscribersService
      .readByQuery({
        fields: ["list", "email"],
        filter: {
          list: {
            _eq: mailingList.id
          }
        }
      });

    if (!(subscribers && subscribers.length)) {
      console.log("there are no subscribers for mailing list:", emailName);
      return;
    }

    if (!subscribers.some(s => s.email.toLowerCase() === data.From.toLowerCase())) {
      console.log(`${data.From} tried to send email to ${emailName.toLowerCase()} mailing list but not a subscriber`);
      await sendEmail({
        From: `web@${process.env.EMAIL_DOMAIN}`,
        To: data.From,
        TextBody: "You have tried to send an email to a mailing list you are not subscribed to. Please reply to this email if you wish to subscribe.",
        Subject: "Unable to email mailing list"
      });
      return;
    }

    subscribers = subscribers.filter(s => s.email.toLowerCase() !== data.From.toLowerCase());

    console.log(`found ${subscribers.length} subscribers`);
    const subscriberChunks = chunkArray<Subscriber>(subscribers, 50);

    for (let j = 0; j < subscriberChunks.length; j++) {
      const chunk = subscriberChunks[j];
      if (!chunk) {
        continue;
      }

      let from: string;
      if (!data.FromName || data.FromName === "") {
        const emailNamePart = data.From.split("@")[0];
        from = `${emailNamePart} via ${mailingList.name} <${mailingList.email_name}@${process.env.EMAIL_DOMAIN}>`;
      } else {
        from = `${data.FromName} via ${mailingList.name} <${mailingList.email_name}@${process.env.EMAIL_DOMAIN}>`;
      }

      const emailsToSend = [];

      for (const subscriber of chunk) {
        const bodyInput = data.HtmlBody || data.TextBody;
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

      console.log(`sending ${emailsToSend.length} emails`);
      await sendBatchEmail(emailsToSend);
    }
  } catch (e) {
    console.log("something went wrong handling mailing list email", e, e.message, e.data);
  }
}

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
