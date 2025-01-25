import {defineEndpoint} from "@directus/extensions-sdk";
import {getUserCount} from "./user-count";
import {send} from "./send";

export default defineEndpoint((router, {services, database}) => {

  router.get("/user-count", async (req: any, res: any) => {
    return await getUserCount(req, res, services, database);
  });

  router.post("/send", async (req: any, res: any) => {
    return await send(req, res, services, database);
  });
});
