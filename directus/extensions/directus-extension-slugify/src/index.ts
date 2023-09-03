import {defineHook} from '@directus/extensions-sdk';

const events = ["items.create", "items.update"];
const collections = ["content_page"];

type Content = {
    title?: string,
    slug: string,
}
export default defineHook(({filter, action}, {services}) => {
    const {ItemsService} = services;
    const accountability = {
        admin: true
    };

    const handleChange = async (itemId: string, schema: any) => {
        try {
            const contentService = new ItemsService("content_page", {schema, accountability});
            const path = await buildPath(itemId, contentService)

            const pathService = new ItemsService("content_paths", {schema, accountability});

            const existingPaths = await pathService.readByQuery({
                filter: {
                    content: {
                        _eq: itemId
                    }
                }
            });

            if (existingPaths && existingPaths.length) {
                const existingPath = existingPaths[0];
                console.log("updating existing path", existingPath.id, path);
                await pathService.updateOne(existingPath.id, {
                    path
                });
            } else {
                console.log("creating new path", path);
                await pathService.createOne({
                    content: itemId,
                    path
                });
            }

        } catch (e) {
            console.log("something went wrong creating a path for", itemId, e);
        }
    };

    action("items.create", async ({key, collection}, {schema}) => {
        if (collections.includes(collection)) {
            await handleChange(key, schema);
        }
    });

    action("items.update", async ({keys, collection}, {schema}) => {
        if (collections.includes(collection)) {
            await handleChange(keys[0], schema);
        }
    });

    action("items.delete", async ({keys, collection}, {schema}) => {
        if (collections.includes(collection)) {
            const pathService = new ItemsService("content_paths", {schema, accountability});
            await pathService.deleteMany(keys);
        }
    });

    filter("*.*", async (payload, meta) => {
        if (events.includes(meta.event) && collections.includes(meta.collection)) {
            const item = payload as Content;

            if (item.title) {
                item.slug = slugify(item.title);
            }

            return item;
        }

        return payload;
    });
});

async function buildPath(itemId: any, itemsService: any) {
    const parts = [];
    let currentItemId = itemId;

    while (!!currentItemId) {
        const item = await itemsService.readOne(currentItemId);
        parts.push(item.slug);
        currentItemId = item.related_page_id;
    }

    return `/${parts.reverse().join("/")}`;
}

const slugify = (input: string) => {
    return input
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase()
        .trim()
        .replace(/[^a-z0-9 ]/g, '')
        .replace(/\s+/g, '-');
}
