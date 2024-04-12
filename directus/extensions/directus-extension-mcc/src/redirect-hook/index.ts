import {defineHook} from "@directus/extensions-sdk";

export default defineHook(({filter}, {services}) => {
  filter("items.update", async (payload: any, meta: any, context: any) => {
    try {
      if (meta.collection === "events") {
        await handleEventRename(payload, meta, services, context);
      } else if (meta.collection === "news") {
        await handleNewsRename(payload, meta, services, context);
      }
    } catch (err) {
      console.error("error in event update hook", err);
    }

    return payload;
  });
});

async function handleNewsRename(payload: any, meta: any, services: any, context: any) {
  if (!payload.title) {
    return;
  }

  await handlePayloadTitleChange(payload, "news", meta, services, context);
}

async function handleEventRename(payload: any, meta: any, services: any, context: any) {
  if (!payload.title) {
    return;
  }
  await handlePayloadTitleChange(payload, "events", meta, services, context);
}

async function handlePayloadTitleChange(payload: any, collection: string, meta: any, services: any, context: any) {
  const {ItemsService} = services;
  const accountability = {
    admin: true
  };

  const itemsService = new ItemsService(collection, {schema: context.schema, accountability});
  const redirectService = new ItemsService("redirects", {schema: context.schema, accountability});

  const item = await itemsService.readOne(meta.keys[0], {
    fields: ["title", "id"]
  });

  const newSlug = slugify(payload.title);
  const oldSlug = slugify(item.title);

  const oldUrl = `/${collection}/${item.id}/${oldSlug}`;
  const newUrl = `/${collection}/${item.id}/${newSlug}`;

  if (oldUrl !== newUrl) {

    const existing = await redirectService.readByQuery({
      fields: ["url_old", "url_new", "id"],
      filter: {
        _and: [
          {
            url_old: {_eq: oldUrl}
          },
          {
            url_new: {_eq: newUrl}
          }
        ]
      }
    });

    if (existing && existing.length) {
      console.log("A matching redirect already exists, skipping");
      return;
    }

    const matching = await redirectService.readByQuery({
      fields: ["url_old", "url_new", "id"],
      filter: {
        url_new: {
          _eq: oldUrl
        }
      }
    });

    if (matching && matching.length) {
      for (const match of matching) {
        if (match.url_old === newUrl) {
          await redirectService.deleteOne(match.id);
        } else {
          await redirectService.updateOne(match.id, {
            url_new: newUrl
          });
        }
      }
    }

    await redirectService.createOne({
      url_old: oldUrl,
      url_new: newUrl,
      response_code: "301"
    });

    console.log(`new redirect: ${oldUrl} -> ${newUrl}`);
  } else {
    console.error(`Cannot create redirect with same URLs: ${oldSlug}`);
  }
}

const slugify = (input: string) => {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .trim()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, "-");
};
