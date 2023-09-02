import {nanoid} from "nanoid";
import {createError} from "@directus/errors";

const MailSendError = createError("VERIFY_MAIL_SEND_ERROR", "Unable to send verify email address email");

async function sendNew (services: any, input: any, schema: any, database: any) {
    const {MailService} = services;
    const mailService = new MailService({schema, knex: database});
    const token = nanoid(34);

    input.confirm_token = token;
    input.confirm_token_create_date = new Date();
    input.email_confirmed = false;

    const publicUrl = process.env.PUBLIC_URL;
    const url = `${publicUrl}/confirm-email?t=${token}`;

    try {
        await mailService.send({
            to: input.email,
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

export default sendNew;
