﻿import {nanoid} from "nanoid";
import {createError} from "@directus/errors";

const MailSendError = createError("VERIFY_MAIL_SEND_ERROR", "Unable to send verify email address email");

async function sendConfirmAccountEmail (services: any, input: any, schema: any, database: any) {

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

export default sendConfirmAccountEmail;
