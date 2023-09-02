import {defineEndpoint} from '@directus/extensions-sdk';
import {ofetch} from "ofetch";
import {customAlphabet} from "nanoid";
import {alphanumeric} from "nanoid-dictionary";

const postmarkUrl = "https://api.postmarkapp.com";

const nanoid = customAlphabet(alphanumeric, 11);

type FullAddress = {
    Email: string,
    Name: string,
    MailboxHash: string
}

type Header = {
    Name: string,
    Value: string
}

type Attachment = {
    Name: string,
    Content: string,
    ContentType: string,
    ContentLength: number
}

type OutboundEmail = {
    From: string,
    To: string,
    Cc?: string,
    Bcc?: string,
    Subject?: string,
    Tag?: string,
    HtmlBody?: string,
    TextBody?: string
    ReplyTo?: string,
    Headers?: string[],
    TrackOpens?: boolean,
    TrackLinks?: string,
    Metadata?: object,
    Attachments?: Attachment[],
    MessageStream?: string
}

type InboundEmail = {
    FromName: string,
    MessageStream: string,
    From: string,
    FromFull: FullAddress,
    To: string,
    ToFull: FullAddress[],
    Cc: string,
    CcFull: FullAddress[],
    Bcc: string,
    BccFull: FullAddress[],
    OriginalRecipient: string,
    Subject: string,
    MessageID: string,
    MailboxHash: string,
    Date: string,
    TextBody: string,
    HtmlBody: string,
    StrippedTextReply: string,
    Tag: string;
    Headers: Header[],
    Attachments: Attachment[]
}

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
                console.log("No to email addresses")
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

            for (let i = 0; i < toAddresses.length; i++) {
                const toAddress = toAddresses[i]!;
                handleMailingList(data, toAddress, null);
                await handleMailForward(data, toAddress, mailThreadsService, mailForwardsService);
            }

            return res.status(200).send("ok");
        } catch (e) {
            console.log("something went wrong", e);
            return res.status(500).send(e.message);
        }
    });
});

function handleMailingList(data: InboundEmail, toAddress: ToAddress, itemsService: any) {

}

async function handleMailForward(data: InboundEmail, toAddress: FullAddress, mailThreadsService: any, mailForwardsService: any) {

    if (toAddress.Email.startsWith("reply+")) {
        const threadId = toAddress.MailboxHash;

        try {
            const existingThread = await mailThreadsService.readOne(threadId);
            console.log("got thread id", threadId, existingThread)
            console.log("inbound mail", data)

            if (existingThread) {
                if (data.FromFull.Email.toLowerCase() === existingThread.target_email.toLowerCase()) {
                    let fromName = `forwards@${process.env.EMAIL_DOMAIN}`

                    const forwards = await mailForwardsService.readByQuery({
                        filter: {
                            target_email: {
                                _eq: data.FromFull.Email.toLowerCase()
                            }
                        }
                    });

                    const forward = forwards.length ? forwards[0] : null;

                    if(forward && forwards.from_name){
                        fromName = `${forward.from_name} <${fromName}>`
                    }

                    // send  to sender_email
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

                    if(data.FromName){
                        fromName = `${data.FromName} <${fromName}>`
                    }

                    // send to target_email
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
                    console.log("no thread found for", threadId)
                }
            } else {
                console.log("something went wrong, unknown from address for thread")
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
                console.log("created new thread id", newThreadId)
                await mailThreadsService.createOne({
                    id: newThreadId,
                    target_email: forward.target_email,
                    sender_email: data.FromFull.Email
                });

                let fromAddress = `<forwards@${process.env.EMAIL_DOMAIN}>`;

                if(data.FromName){
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
    console.log("sending mail", email)
    return await ofetch("/email", {
        baseURL: postmarkUrl,
        method: "POST",
        headers: {
            "X-Postmark-Server-Token": process.env.EMAIL_SMTP_PASSWORD!
        },
        body: email
    }).catch((err) => {
        console.log("ofetch error: ", err.data)
    });
}
