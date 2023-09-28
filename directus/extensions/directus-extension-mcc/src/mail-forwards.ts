import {FullAddress, InboundEmail, OutboundEmail} from "./types";
import {ofetch} from "ofetch";
import {alphanumeric} from "nanoid-dictionary";
import {customAlphabet} from "nanoid";

const postmarkUrl = "https://api.postmarkapp.com";
const nanoid = customAlphabet(alphanumeric, 11);

async function extractForwardTarget(targetName: string, mailForwardsService: any){

  const forwards = await mailForwardsService.readByQuery({
    filter: {
      name: {
        _eq: targetName
      }
    }
  });

  let foundForward = forwards && forwards.length ? forwards[0] : null;

  if(foundForward){
    if(foundForward.target_email.endsWith("@maidstonecanoeclub.net")){
      console.log("Mail forward target is another mail forward, searching for target email: " + foundForward.target_email);
      // this email points to a different mail forward
      // find the target email THAT mail forward points to
      const name = foundForward.target_email.split("@")[0];
      foundForward = await extractForwardTarget(name, mailForwardsService);
    }
  }

  return foundForward;
}

export async function handleMailForward(data: InboundEmail, toAddress?: FullAddress, forward?: any, mailThreadsService: any, mailForwardsService: any) {

  if (toAddress && toAddress.Email.startsWith("reply+")) {
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
            TextBody: data.TextBody,
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
            TextBody: data.TextBody,
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

      let foundForward = forward;
      if(!forward && toAddress) {
        const name = toAddress.Email.split("@")[0];
        foundForward = await extractForwardTarget(name, mailForwardsService);
      }

      if (foundForward) {
        const newThreadId = nanoid();

        await mailThreadsService.createOne({
          id: newThreadId,
          target_email: foundForward.target_email,
          sender_email: data.FromFull.Email
        });

        let fromAddress = `<forwards@${process.env.EMAIL_DOMAIN}>`;

        if (data.FromName) {
          fromAddress = `${data.FromName} ${fromAddress}`;
        }

        // send email to target
        await sendEmail({
          From: fromAddress,
          To: foundForward.target_email,
          HtmlBody: data.HtmlBody,
          TextBody: data.TextBody,
          Subject: data.Subject,
          ReplyTo: `reply+${newThreadId}@${process.env.EMAIL_DOMAIN}`,
          TrackLinks: "None",
          Tag: "forwards",
          Attachments: data.Attachments
        });
      } else {
        console.log("no mail forward found or provided");
      }
    } catch (e) {
      console.log("something went wrong creating a new mail thread", e, e.message, e.data);
    }
  }
}

export async function sendEmail(email: OutboundEmail) {

  if(process.env.IGNORE_MAIL){
    console.log("not sending email:", email);
    return;
  }

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
