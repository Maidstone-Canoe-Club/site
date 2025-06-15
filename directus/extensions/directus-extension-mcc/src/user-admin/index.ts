import {defineEndpoint} from "@directus/extensions-sdk";
import {update} from "./update";

export default defineEndpoint((router, {services, database}) => {
  router.post("/update-user", async (req: any, res: any) => {
    return await update(req, res, services, database);
  });
});

