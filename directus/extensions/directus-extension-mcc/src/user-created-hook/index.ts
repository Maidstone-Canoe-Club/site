import {defineHook} from "@directus/extensions-sdk";
import sendNew from "../send-email";

export default defineHook(({filter}, {services}) => {
  filter("users.create", async (input, _, {schema, database}) => {
    // TODO: only send if input.email_confirmed = false
    return await sendNew(services, input, schema, database);
  });
});
