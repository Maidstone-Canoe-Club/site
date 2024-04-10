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

async function handlePayloadTitleChange(payload: any, collection: string,  meta: any, services: any, context: any){
  const {ItemsService} = services;
  const accountability = {
    admin: true
  };

  const newSlug = slugify(payload.title);
  console.log(`new ${collection} slug`, newSlug);

  const itemsService = new ItemsService(collection, {schema: context.schema, accountability});
  const redirectService = new ItemsService("redirects", {schema: context.schema, accountability});

  const item = await itemsService.readOne(meta.keys[0], {
    fields: ["title", "id"]
  });

  const oldSlug = slugify(item.title);

  const oldUrl = `/${collection}/${item.id}/${oldSlug}`;
  const newUrl = `/${collection}/${item.id}/${newSlug}`;

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
    console.log(`created new ${collection} redirect: ${oldUrl} -> ${newUrl}`);
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
