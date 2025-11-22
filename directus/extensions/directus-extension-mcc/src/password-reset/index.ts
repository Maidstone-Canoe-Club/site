import {defineEndpoint} from "@directus/extensions-sdk";
import {sendResetPasswordEmail} from "../send-email";
import {randomBytes, createHash} from "node:crypto";

export default defineEndpoint((router, {services, database}) => {
  const {UsersService, ItemsService} = services;
  const adminAccountability = {
    admin: true
  };

  router.post("/request", async (req: any, res: any) => {
    try {
      const email = req.body.email;

      console.log("Creating password reset request for email", email);

      if (!email) {
        return res.status(400).send("Missing email");
      }

      const userService = new UsersService({
        knex: database,
        schema: req.schema,
        accountability: adminAccountability
      });
      const users = await userService.readByQuery({
        fields: ["*"],
        filter: {
          email: {
            _eq: email
          }
        }
      });

      if (!users || users.length === 0) {
        console.log("No user found with email", email);
        return res.json({success: true});
      }

      const user = users[0];

      console.log("Found user with email", email, user.id);

      const rawToken = randomBytes(32).toString("base64url");
      const token = createHash("sha256").update(rawToken).digest("hex");

      const itemsService = new ItemsService("password_reset_tokens", {
        schema: req.schema,
        accountability: adminAccountability
      });

      await itemsService.updateByQuery(
        {
          user: {_eq: user.id},
          used: {_eq: false}
        },
        {
          used: true
        }
      );

      const newToken = await itemsService.createOne({
        user: user.id,
        token: token,
        expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24)
      });

      console.log("Created new password reset token", newToken);
      await sendResetPasswordEmail(services, req.schema, database, token, email);

      return res.json({success: true});
    } catch (err) {
      console.error("Error creating password reset request", err);
      return res.status(500).send("Error creating password reset request");
    }
  });

  router.post("/confirm", async (req: any, res: any) => {
    try{
      const token = req.body.token;
      const newPassword = req.body.newPassword;

      if(!token){
        return res.status(400).send("Missing token");
      }

      const itemsService = new ItemsService("password_reset_tokens", {
        schema: req.schema,
        accountability: adminAccountability
      });

      const tokens = await itemsService.readByQuery({
        fields: ["*"],
        filter: {
          token: {
            _eq: token
          }
        }
      });

      if(!tokens || tokens.length === 0){
        return res.status(400).send("Invalid token");
      }

      const tokenData = tokens[0];

      if(tokenData.used){
        return res.status(400).send("Token already used");
      }

      if(tokenData.expires_at < new Date()){
        return res.status(400).send("Token expired");
      }

      await itemsService.updateOne(tokenData.id, {used: true});

      const userService = new UsersService({
        knex: database,
        schema: req.schema,
        accountability: adminAccountability
      });

      await userService.updateOne(tokenData.user, {password: newPassword});
      console.log("Changed password for user", tokenData.user);

      return res.json({success: true});
    }catch(err: any){
      console.error("Error confirming password reset", err);
      return res.status(500).send("Error confirming password reset");
    }
  });
});
