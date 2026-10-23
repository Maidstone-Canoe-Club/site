import {defineEndpoint} from "@directus/extensions-sdk";
import {sendResetPasswordEmail} from "../send-email";
import {randomBytes, createHash} from "node:crypto";

// Only a hash of the token is stored, so a leaked database row can't be used to reset a password
function hashToken(rawToken: string) {
  return createHash("sha256").update(rawToken).digest("hex");
}

export default defineEndpoint((router, {services, database}) => {
  const {UsersService, ItemsService} = services;
  const adminAccountability = {
    admin: true
  };

  router.post("/request", async (req: any, res: any) => {
    try {
      const email = req.body.email;


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
        console.log("Password reset requested for an unknown email address");
        return res.json({success: true});
      }

      const user = users[0];

      console.log("Creating password reset token for user", user.id);

      const rawToken = randomBytes(32).toString("base64url");
      const token = hashToken(rawToken);

      const itemsService = new ItemsService("password_reset_tokens", {
        schema: req.schema,
        accountability: adminAccountability
      });

      // Requesting a new link cancels any earlier ones. Older rows were saved with used as null, so match that too
      await itemsService.updateByQuery(
        {
          filter: {
            user: {_eq: user.id},
            _or: [
              {used: {_eq: false}},
              {used: {_null: true}}
            ]
          }
        },
        {
          used: true
        }
      );

      const newToken = await itemsService.createOne({
        user: user.id,
        token: token,
        used: false,
        expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24)
      });

      console.log("Created new password reset token", newToken);
      // The email gets the raw token, the database keeps the hash
      await sendResetPasswordEmail(services, req.schema, database, rawToken, email);

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

      if(!token || typeof token !== "string"){
        return res.status(400).send("Missing token");
      }

      // Matches the minimum length on the reset password page
      if(typeof newPassword !== "string" || newPassword.length < 8){
        return res.status(400).send("Password must be at least 8 characters");
      }

      const itemsService = new ItemsService("password_reset_tokens", {
        schema: req.schema,
        accountability: adminAccountability
      });

      const tokens = await itemsService.readByQuery({
        fields: ["*"],
        filter: {
          token: {
            _eq: hashToken(token)
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

      // Directus returns the date as a string, which can't be compared to a Date directly
      if(new Date(tokenData.expires_at).getTime() < Date.now()){
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
