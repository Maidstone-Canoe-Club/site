import {FullAddress, InboundEmail, MailForward, OutboundEmail} from "./types";
import {ofetch} from "ofetch";
import {alphanumeric} from "nanoid-dictionary";
import {customAlphabet} from "nanoid";

const postmarkUrl = "https://api.postmarkapp.com";
const nanoid = customAlphabet(alphanumeric, 11);

export async function extractForwardTarget(targetName: string, mailForwardsService: any) {

  console.log("extracting mail forward target email for", targetName);

  const results: MailForward[] = [];

  const forwards: MailForward[] = await mailForwardsService.readByQuery({
    filter: {
      name: {
        _eq: targetName
      }
    }
  });

  if (forwards && forwards.length) {
    for (const forward of forwards) {
      if (forward.target_email.endsWith("@maidstonecanoeclub.net") || forward.target_email.endsWith("@mccdev.co.uk")) {
        console.log("Mail forward target is another mail forward, searching for target email: " + forward.target_email);
        // this email points to a different mail forward
        // find the target email THAT mail forward points to
        const split = forward.target_email.split("@");
        if (!split || split.length !== 2) {
          console.error("Invalid target email address: " + forward.target_email);
          continue;
        }
        const name = split[0]!;
        const found = await extractForwardTarget(name, mailForwardsService);
        results.push(...found);
      } else {
        results.push(forward);
      }
    }
  }

  console.log("found extracted targets", results.map(x => x.target_email));

  return results;
}

export async function handleMailForward(data: InboundEmail, toAddress?: FullAddress, forward?: MailForward, mailThreadsService: any, mailForwardsService: any) {

  console.log("handing mail forward to", toAddress?.Email,"from", data.From);
  if (toAddress && toAddress.Email.startsWith("reply+")) {
    const threadId = toAddress.MailboxHash;

    try {
      const existingThread = await mailThreadsService.readOne(threadId);

      if (existingThread) {
        console.log("found an existing thread");
        if (data.FromFull.Email.toLowerCase() === existingThread.target_email.toLowerCase()) {
          console.log("sending to " + existingThread.sender_email);

          const forwards = await mailForwardsService.readByQuery({
            filter: {
              id: {
                _eq: existingThread.forward
              },
            }
          });

          const forward = forwards && forwards.length ? forwards[0] : null;

          if(forward) {
            let fromName = `forwards@${process.env.EMAIL_DOMAIN}`;

            if (forward && forward.from_name) {
              fromName = `${forward.from_name} <${fromName}>`;
            }

            await sendEmail({
              From: fromName,
              To: existingThread.sender_email,
              Cc: data.Cc,
              Bcc: data.Bcc,
              HtmlBody: data.HtmlBody,
              TextBody: data.TextBody,
              Subject: data.Subject,
              ReplyTo: `reply+${existingThread.id}@${process.env.EMAIL_DOMAIN}`,
              TrackLinks: "None",
              Tag: "forwards",
              Attachments: data.Attachments
            });
          }else{
            console.error("unable to find mail forward for thread: ", existingThread.id, existingThread.forward);
          }
        } else if (data.FromFull.Email.toLowerCase() === existingThread.sender_email.toLowerCase()) {
          console.log("sending to " + existingThread.target_email);
          let fromName = `forwards@${process.env.EMAIL_DOMAIN}`;

          if (data.FromName) {
            fromName = `${data.FromName} <${fromName}>`;
          // }else{
          //   fromName = `(${data.FromFull.Email}) <${fromName}>`;
          }

          await sendEmail({
            From: fromName,
            To: existingThread.target_email,
            Cc: data.Cc,
            Bcc: data.Bcc,
            HtmlBody: data.HtmlBody,
            TextBody: data.TextBody,
            Subject: data.Subject,
            ReplyTo: `reply+${existingThread.id}@${process.env.EMAIL_DOMAIN}`,
            TrackLinks: "None",
            Tag: "forwards",
            Attachments: data.Attachments
          });
        } else {
          console.log(`no thread found for: ${threadId} creating new thread`);
          await handleNewMailThread(data, toAddress, forward, mailThreadsService, mailForwardsService);
        }
      } else {
        console.log("something went wrong, unknown from address for thread");
      }
    } catch (e) {
      console.log("something went wrong continuing mail thread", threadId, e, e.message, e.data);
    }
  } else {
    // We have received a new email to forward
    await handleNewMailThread(data, toAddress, forward, mailThreadsService, mailForwardsService);
  }
}

async function handleNewMailThread(data: InboundEmail, toAddress?: FullAddress, forward?: MailForward, mailThreadsService: any, mailForwardsService: any){
  try {
    let foundForwards: MailForward[] = [];
    if (forward) {
      foundForwards.push(forward);
    }

    if (!forward && toAddress) {
      // we haven't got a mail forward but we do have a to address
      const split = toAddress.Email.split("@");
      if (!split || split.length !== 2) {
        console.error("Invalid to address: " + toAddress.Email);
        return;
      }
      const name = split[0]!;
      foundForwards = await extractForwardTarget(name, mailForwardsService);
    }

    if (foundForwards && foundForwards.length) {
      for (const foundForward of foundForwards) {
        const newThreadId = nanoid();

        await mailThreadsService.createOne({
          id: newThreadId,
          target_email: foundForward.target_email,
          sender_email: data.FromFull.Email,
          forward: foundForward.id
        });

        let fromAddress = `<forwards@${process.env.EMAIL_DOMAIN}>`;

        if (data.FromName) {
          fromAddress = `${data.FromName} ${fromAddress}`;
        // }else{
        //   fromAddress = `(${data.FromFull.Email}) ${fromAddress}`;
        }

        // send email to target
        await sendEmail({
          From: fromAddress,
          To: foundForward.target_email,
          Cc: data.Cc,
          Bcc: data.Bcc,
          HtmlBody: data.HtmlBody,
          TextBody: data.TextBody,
          Subject: `${data.Subject} (#${newThreadId})`,
          ReplyTo: `reply+${newThreadId}@${process.env.EMAIL_DOMAIN}`,
          TrackLinks: "None",
          Tag: "forwards",
          Attachments: data.Attachments
        });
      }
    } else {
      console.log("no mail forward found or provided");
    }
  } catch (e) {
    console.error("something went wrong creating a new mail thread", e, e.message, e.data);
  }
}

export async function sendEmail(email: OutboundEmail) {

  if (process.env.IGNORE_MAIL) {
    console.log("not sending email:", email);
    return;
  }

  console.log("Sending email to " + email.To + " from: " + email.From);

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
