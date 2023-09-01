import { defineHook } from '@directus/extensions-sdk';

const events = ["items.create", "items.update"];
const collections = ["content_page", "news"];

type Content = {
	title?: string,
	slug: string
}
export default defineHook(({ filter }) => {

	filter("*.*", (payload, meta) => {
		if(events.includes(meta.event) && collections.includes(meta.collection)){
			const item = payload as Content;

			if(item.title){
				item.slug = slugify(item.title);
			}

			return item;
		}

		return payload;
	});
});

const slugify = (input: string) => {
	return input
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLocaleLowerCase()
		.trim()
		.replace(/[^a-z0-9 ]/g, '')
		.replace(/\s+/g, '-');
}
