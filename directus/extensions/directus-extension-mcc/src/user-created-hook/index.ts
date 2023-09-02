import {defineHook} from '@directus/extensions-sdk';
import sendNew from "../send-email";

export default defineHook(({filter}, {services}) => {
	filter('users.create', async (input, _, {schema, database}) => {
		return await sendNew(services, input, schema, database);
	});
});
