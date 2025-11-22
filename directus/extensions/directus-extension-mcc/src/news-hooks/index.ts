import {defineHook} from "@directus/extensions-sdk";
import {sendEmail} from "../mail-forwards";

async function handleHook(context: any, schema: any, services: any, database: any, logger: any) {
  const {payload} = context;
  const {ItemsService, MailService} = services;

  if (payload.status === "published") {
    const accountability = {
      admin: true
    };

    logger.info("ready to notify!",);

    const newsService = new ItemsService("news", {schema, accountability});
    const key = context.key || context.keys[0];

    const newsItem = await newsService.readOne(key);
    logger.info(newsItem, "Loaded news item");
    if (!newsItem.users_notified) {
      logger.info("NOTIFY USERS!");

      const subscribersService = new ItemsService("news_subscribers", {schema, accountability});

      const subscribers = await subscribersService.readByQuery({
        fields: [
          "user.email",
          "id",
          "unsubscribe_token"
        ]
      });

      logger.info(subscribers, "news subscribers");
      if (subscribers?.length) {
        const mailService = new MailService({schema, knex: database});

        const publicUrl = process.env.PUBLIC_URL;
        const newsPostUrl = `${publicUrl}/news/${newsItem.id}`;

        for (const subscriber of subscribers) {
          const encodedId = encodeURIComponent(btoa(subscriber.id));
          const encodedToken = encodeURIComponent(btoa(subscriber.unsubscribe_token));
          const unsubscribeLink = `${publicUrl}/news/unsubscribe?i=${encodedId}&t=${encodedToken}`;

          logger.info(subscriber.user.email, "Sending news post notification to user");
          const htmlBody = await mailService.renderTemplate("new-news-post", {
            newsPostUrl,
            newsTitle: newsItem.title,
            unsubscribeLink
          });

          await sendEmail({
            To: subscriber.user.email,
            From: `notifications@${process.env.EMAIL_DOMAIN}`,
            Subject: `New Post: ${newsItem.title}`,
            HtmlBody: htmlBody
          });
        }
      }

      await newsService.updateOne(key, {users_notified: true});
      logger.info("Done!");
    }
  }
}

export default defineHook(({action}, {services, database, logger}) => {

  action("items.create", async (context, {schema}) => {
    if (context.collection !== "news") {
      return;
    }

    await handleHook(context, schema, services, database, logger);
  });

  action("items.update", async (context, {schema}) => {
    try {
      if (context.collection !== "news") {
        return;
      }

      await handleHook(context, schema, services, database, logger);
    } catch (err) {
      logger.error(err, "Error handling news post update");
    }
  });

});
