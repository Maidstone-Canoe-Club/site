import {defineHook} from "@directus/extensions-sdk";
import sendConfirmAccountEmail from "../send-email";
import express from "express";
export default defineHook(({filter, init}, {services}) => {

  // TODO: MOVE THIS TO IT'S OWN EXTENSION
  init("middlewares.before", async ({app}) => {
    app.use(express.json({
      verify: (req, _, buf) => {
        req.rawBody = buf.toString();
      }
    }));
  } );

  filter("users.create", async (input, _, {schema, database}) => {
    try {
      return await sendConfirmAccountEmail(services, input, schema, database);
    }catch(e){
      console.log("unable to send confirm account email", e);
    }
  });
});
