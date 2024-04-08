import {defineHook} from "@directus/extensions-sdk";

export default defineHook(({filter}, {services}) => {

  const {ItemsService} = services;
  const accountability = {
    admin: true
  };

  filter("items.update", async (payload: any, meta: any, context: any) => {
    try {
      if (meta.collection !== "events") {
        return;
      }

      if (payload.title) {
        const newSlug = slugify(payload.title);
        console.log("new slug", newSlug);

        const eventsService = new ItemsService("events", {schema: context.schema, accountability});
        const redirectService = new ItemsService("redirects", {schema: context.schema, accountability});

        const event = await eventsService.readOne(meta.keys[0], {
          fields: ["title", "id"]
        });

        const oldSlug = slugify(event.title);

        const oldUrl = `/events/${event.id}/${oldSlug}`;
        const newUrl = `/events/${event.id}/${newSlug}`;

        if (oldUrl !== newUrl) {

          const existing = await redirectService.readByQuery({
            fields: ["url_old", "url_new", "id"],
            filter: {
              _and: [
                {
                  url_old: {_eq: newUrl},
                },
                {
                  url_new: {_eq: oldUrl}
                }
              ]
            }
          });

          if (existing && existing.length) {
            console.log(`found ${existing.length} opposite redirect(s) to new redirect, deleting...`);
            await redirectService.deleteMany(existing.map((e: any) => e.id));
          }

          await redirectService.createOne({
            url_old: oldUrl,
            url_new: newUrl,
            response_code: "301"
          });
          console.log(`created new redirect: ${oldUrl} -> ${newUrl}`);
        } else {
          console.error(`Cannot create redirect with same URLs: ${oldSlug}`);
        }
      }
    } catch (err) {
      console.error("error in event update hook", err);
    }

    return payload;
  });
});

const slugify = (input: string) => {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .trim()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, "-");
};
