import {defineEndpoint} from '@directus/extensions-sdk';

async function getRole(name: string, rolesService: any) {
    const roles = await rolesService.readByQuery({
        filter: {
            name: {
                _eq: name
            }
        }
    });

    if (!roles || !roles.length) {
        return null;
    }

    if (roles.length > 1) {
        throw new Error("Found multiple roles with the same name: " + name)
    }

    return roles[0];
}

export default defineEndpoint((router, {services, database}) => {
    const {
        ItemsService,
        RolesService,
        UsersService
    } = services

    const adminAccountability = {
        admin: true
    };

    router.post('/', async (req, res) => {
        const user = req.body.user;
        const inviteId = req.body.inviteId;
        const emergencyContacts = req.body.emergencyContacts;
        const medicalInfo = req.body.medicalInfo;

        console.log("got user", user);
        console.log("got invite id", inviteId);
        console.log("got contacts", emergencyContacts);
        console.log("got medical info", medicalInfo);

        if (!user) {
            return res.status(400).send("missing user");
        }

        if (!emergencyContacts || !emergencyContacts.length) {
            return res.status(400).send("missing emergency contacts")
        }

        if (!medicalInfo) {
            return res.status(400).send("missing medical info");
        }

        const rolesService = new RolesService({knex: database, schema: req.schema, accountability: adminAccountability})

        if (inviteId) {
            const memberRole = await getRole("Member", rolesService);
            user.role = memberRole.id;
            // get member role
            // set user.role to member role
        } else {
            const unverifiedRole = await getRole("Unverified", rolesService);
            console.log("found unverified role", unverifiedRole);
            user.role = unverifiedRole.id;
            // get unverified role
            // set user.role to unverified role id
        }

        const usersService = new UsersService({knex: database, schema: req.schema, accountability: adminAccountability});

        // create the user
        const newUserId = await usersService.createOne(user);
        console.log("created new user id", newUserId);

        medicalInfo.user = newUserId;
        for(let i = 0; i < emergencyContacts.length; i++){
            emergencyContacts[i].user = newUserId;
        }

        // save the emergency contact info
        const emergencyContactsService = new ItemsService("emergency_contacts", {knex: database, schema: req.schema, accountability: adminAccountability});
        const contactsResult = await emergencyContactsService.createMany(emergencyContacts);
        console.log("created emergency contacts", contactsResult);

        // save the medical info
        const medicalInfoService = new ItemsService("medical_info", {knex: database, schema: req.schema, accountability: adminAccountability});
        const medialResult = await medicalInfoService.createOne(medicalInfo);
        console.log("created medical info", medialResult);

        if (inviteId) {
            const inviteService = new ItemsService("member_invites", {knex: database, schema: req.schema, accountability: adminAccountability})
            // complete the invite
            const invite = await inviteService.readOne(inviteId);
            console.log("found existing invite");
            invite.accepted = true;
            const inviteAcceptedResult = await inviteService.updateOne(inviteId, invite);
            console.log("invite accepted", inviteAcceptedResult);
        }

        return res.send(newUserId);
    });
});
