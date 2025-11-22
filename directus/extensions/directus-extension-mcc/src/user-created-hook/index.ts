import {defineHook} from "@directus/extensions-sdk";
import {sendConfirmAccountEmail} from "../send-email";

export default defineHook(({filter}, {services}) => {
  filter("users.create", async (input, _, {schema, database}) => {
    try {
      return await sendConfirmAccountEmail(services, input, schema, database);
    }catch(e){
      console.log("unable to send confirm account email", e);
    }
  });
});
