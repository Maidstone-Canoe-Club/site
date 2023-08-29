import {defineEndpoint} from '@directus/extensions-sdk';

export default defineEndpoint((router, {services, database}) => {
    const {ItemsService} = services;

    const adminAccountability = {
        admin: true
    };

    router.post('/check', async (req, res) => {

        const email = req.body.email;
        const bcNumber = req.body.bcNumber;

        if (!email) {
            return res.status(400).send("missing email");
        }

        if (!bcNumber) {
            return res.status(400).send("missing bc number");
        }

        const itemService = new ItemsService("member_invites", {knex: database, schema: req.schema, accountability: adminAccountability})

        const foundInvites = await itemService.readByQuery({
            filter: {
                email: {
                    _eq: email
                },
                bc_number: {
                    _eq: bcNumber
                }
            }
        });

        if (!foundInvites || foundInvites.length === 0) {
            return res.json({
                result: false,
                statusCode: 101,
                message: "No invite found"
            });
        }

        const invite = foundInvites[0];

        if (invite.accepted) {
            return res.json({
                result: false,
                statusCode: 102,
                message: "Invite has already been accepted",
            });
        }

        return res.json({
            result: true,
            statusCode: 100,
            message: null,
            id: invite.id
        });
    });

    router.get("/", async (req, res) => {
        const id = req.query.id;
        const email = req.query.email;

        console.log("got id", id, "got email", email)
        if (!id && !email) {
            return res.status(404);
        }

        const itemService = new ItemsService("member_invites", {knex: database, schema: req.schema, accountability: adminAccountability})

        let invite;

        if (id) {
            invite = await itemService.readOne(id);
        } else if (email) {
            const invites = await itemService.readByQuery({
                filter: {
                    email: {
                        _eq: email
                    }
                }
            });

            invite = invites.length ? invites[0] : null;
        }

        if (!invite) {
            return res.status(404);
        }

        return res.json(invite);
    })
});
