import {nanoid} from "nanoid";
import {createError} from "@directus/errors";
import {ofetch} from "ofetch";
import {sendEmail} from "./mail-forwards";

const MailSendError = createError("VERIFY_MAIL_SEND_ERROR", "Unable to send verify email address email");
const postmarkUrl = "https://api.postmarkapp.com";

export async function sendConfirmAccountEmail (services: any, input: any, schema: any, database: any) {

  if (input.email_confirmed) {
    return input;
  }

  const {MailService} = services;
  const mailService = new MailService({schema, knex: database});
  const token = nanoid(34);

  input.confirm_token = token;
  input.confirm_token_create_date = new Date();
  input.email_confirmed = false;

  if (process.env.IGNORE_MAIL) {
    console.log("not sending mail");
    return input;
  }

  const publicUrl = process.env.PUBLIC_URL;
  const url = `${publicUrl}/confirm-email?t=${token}`;
  const htmlBody = await mailService.renderTemplate("confirm-email", {
    url
  });

  try {
    await sendEmail({
      To: input.mail,
      From: `confirm@${process.env.EMAIL_DOMAIN}`,
      Subject: "Confirm email",
      HtmlBody: htmlBody
    });
  } catch (err: any) {
    console.error("Enable to send email", err);
    throw new MailSendError();
  }

  return input;
}

export async function sendResetPasswordEmail(services: any, schema: any, database: any, token: string, targetEmail: string) {

  const publicUrl = process.env.PUBLIC_URL;
  const url = `${publicUrl}/reset-password?token=${token}`;

  const {MailService} = services;
  const mailService = new MailService({schema, knex: database});

  const htmlBody = await mailService.renderTemplate("password-reset", {
    url
  });

  console.log("sending reset email to: ", targetEmail);
  console.log(htmlBody);

  await sendEmail({
    From: `reset@${process.env.EMAIL_DOMAIN}`,
    To: targetEmail,
    Subject: "Reset password",
    HtmlBody: htmlBody
  });
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
  const result: T[][] = [];

  for (let i = 0; i < input.length; i += size) {
    result.push(input.slice(i, i + size));
  }

  return result;
}

