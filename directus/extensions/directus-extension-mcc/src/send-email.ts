import {nanoid} from "nanoid";
import {createError} from "@directus/errors";
import {ofetch} from "ofetch";
const MailSendError = createError("VERIFY_MAIL_SEND_ERROR", "Unable to send verify email address email");
const postmarkUrl = "https://api.postmarkapp.com";

export async function sendConfirmAccountEmail (services: any, input: any, schema: any, database: any) {

  if(input.email_confirmed){
    return input;
  }

  const {MailService} = services;
  const mailService = new MailService({schema, knex: database});
  const token = nanoid(34);

  input.confirm_token = token;
  input.confirm_token_create_date = new Date();
  input.email_confirmed = false;

  if(process.env.IGNORE_MAIL){
    console.log("not sending mail");
    return input;
  }

  const publicUrl = process.env.PUBLIC_URL;
  const url = `${publicUrl}/confirm-email?t=${token}`;

  try {
    await mailService.send({
      to: input.email,
      from: `confirm@${process.env.EMAIL_DOMAIN}`,
      subject: "Confirm email",
      template: {
        name: "confirm-email",
        data: {
          url
        }
      }
    });
  } catch (e) {
    console.log("unable to send email", e);
    throw new MailSendError();
  }

  return input;
}

export async function sendBatchEmail(data: any) {
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

export function chunkArray<T>(input: T[], size: number): T[][] {
  const result : T[][] = [];

  for (let i = 0; i < input.length; i += size) {
    result.push(input.slice(i, i + size));
  }

  return result;
}

