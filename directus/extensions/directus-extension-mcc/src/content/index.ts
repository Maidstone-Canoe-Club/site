import { defineEndpoint } from "@directus/extensions-sdk";

export default defineEndpoint((router) => {
  router.get("/", (req, res) => {

    console.log("got content request", req);

    return res.send("Hello, World!");
  });
});

