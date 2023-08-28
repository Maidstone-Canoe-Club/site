import {defineEndpoint} from '@directus/extensions-sdk';
import sendNew from "../send-email";

export default defineEndpoint((router, {services, database}) => {
	const {UsersService} = services;
	const adminAccountability = {
		admin: true
	};

	router.post("/new", async (req: any, res: any) => {
		const userService = new UsersService({knex: database, schema: req.schema, accountability: adminAccountability});

		const userId = req.accountability.user;

		const user = await userService.readOne(userId);

		if (user.email_confirmed) {
			return res.json({
				result: false,
				statusCode: 101,
				message: "Email already verified"
			});
		}

		const newUserData = await sendNew(services, user, req.schema, database);

		const userDataToUpdate = {
			confirm_token: newUserData.confirm_token,
			confirm_token_create_date: newUserData.confirm_token_create_date
		};

		await userService.updateOne(userId, userDataToUpdate);

		return res.json({
			result: true,
			statusCode: 100,
			message: null
		});
	})

	router.post('/', async (req: any, res: any) => {

		const token = req.query.t;

		if(!token){
			return res.status(400).send("Missing token");
		}

		const userService = new UsersService({knex: database, schema: req.schema, accountability: adminAccountability});

		const users = await userService
			.readByQuery({
				filter: {
					confirm_token: {
						_eq: token
					}
				}
			});

		const user = users.length > 0 ? users[0] : null;

		if (!user) {
			return res.json({
				result: false,
				statusCode: 101,
				message: "Unknown token"
			});
		}

		if (user.email_confirmed) {
			return res.json({
				result: false,
				statusCode: 102,
				message: "You have already confirmed your email address"
			})
		}

		const now = Date.now();
		const then = new Date(user.confirm_token_create_date).getTime();
		const expireTimeMs = 24 * 60 * 60 * 1000; // 24 hours

		if (now - then > expireTimeMs) {
			return res.json({
				result: false,
				statusCode: 103,
				message: "This email confirmation link has has expired"
			})
		}

		await userService.updateOne(user.id, {
			email_confirmed: true
		});

		return res.json({
			result: false,
			statusCode: 103,
			message: null
		});
	});
});
