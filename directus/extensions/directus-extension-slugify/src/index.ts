import {defineHook} from '@directus/extensions-sdk';

const events = ["items.create", "items.update"];
const collections = ["news"];

type Content = {
    title?: string,
    slug: string,
}
export default defineHook(({filter, action}, {services}) => {
    const {ItemsService} = services;
    const accountability = {
        admin: true
    };

    const handleContentChange = async (itemId: string, schema: any) => {
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

                await pathService.updateOne(existingPath.id, {
                    path
                });

                const item = await contentService.readOne(itemId);

                if (item.child_pages && item.child_pages.length) {

                    for (let i = 0; i < item.child_pages.length; i++) {
                        await handleContentChange(item.child_pages[i], schema);
                    }
                }

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

    const handleContentDelete = async (keys: any, schema: any) => {
        console.log("handling delete!")
        try {
            const pathService = new ItemsService("content_paths", {schema, accountability});
            await pathService.deleteMany(keys);
            const contentService = new ItemsService("content_page", {schema, accountability});

            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                const item = contentService.readOne(key);

                if (item.child_pages && item.child_pages.length) {
                    await handleContentDelete(item.child_pages, schema);
                }
            }
        } catch (e) {
            console.log("something went wrong deleting paths", e);
        }
    };

    action("items.create", async ({key, collection}, {schema}) => {
        if (collection === "content_page") {
            // if (collections.includes(collection)) {
            console.log("handling create!")
            await handleContentChange(key, schema);
        }
    });

    action("items.update", async ({keys, collection}, {schema}) => {
        if (collection === "content_page") {
            // if (collections.includes(collection)) {
            console.log("handling update!")
            await handleContentChange(keys[0], schema);
        }
    });

    action("items.delete", async ({keys, collection}, {schema}) => {
        if (collection === "content_page") {
            // if (collections.includes(collection)) {
            await handleContentDelete(keys, schema);
        }
    });

    filter("*.*", async (payload, meta) => {
        if (events.includes(meta.event) && (collections.includes(meta.collection) || meta.collection === "content_page")) {
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
