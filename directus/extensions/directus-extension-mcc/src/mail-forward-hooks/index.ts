import {defineHook} from '@directus/extensions-sdk';
// import {ofetch} from "ofetch";

const postmarkUrl = "https://api.postmarkapp.com";

export default defineHook(({filter}) => {

    filter('items.create', async (payload, meta) => {
        console.log("items.create");
        await handleMailForwardCreate(payload, meta);
    });

    filter('items.update', async (payload, meta) => {
        console.log("items.update");
        await handleMailForwardUpdate(payload, meta);
    });
});

function handleMailForwardCreate(payload: any, meta: Record<string, any>) {
    if (meta.collection === "mail_forwards") {
        // const signatureName = payload.name;
        // const signatureFromName = payload.from_name;
    console.log("mail forward created", payload);
        // const res = await ofetch("/senders", {
        //     method: "POST",
        //     baseURL: postmarkUrl,
        //     headers: {
        //         "X-Postmark-Account-Token": process.env.EMAIL_ACCOUNT_TOKEN!
        //     },
        //     body: {
        //         FromEmail: `${signatureName}@${process.env.EMAIL_DOMAIN}`,
        //         Name: signatureFromName
        //     }
        //
        // }).catch((err) => {
        //     console.log("unable to create sender signature for mail forward", err.data)
        // });
        // payload.sender_signature_id = res.data.id;
    }
    return payload;
}

function handleMailForwardUpdate(payload: any, meta: Record<string, any>) {
    if (meta.collection === "mail_forwards") {
        // const signatureName = payload.name;
        // const signatureFromName = payload.from_name;
        // const signatureId = payload.sender_signature_id;

        console.log("mail forward changed", payload);

        // TODO: if payload.name change, api call to delete old signature, api call to create new one with new name
        // else if payload from name change, api call to update existing one from sender_signature_id

        // name changed
        if (false) {
        } else {
            // await ofetch(`/senders/${signatureId}`, {
            //     method: "PUT",
            //     baseURL: postmarkUrl,
            //     headers: {
            //         "X-Postmark-Account-Token": process.env.EMAIL_ACCOUNT_TOKEN!
            //     },
            //     body: {
            //         FromEmail: `${signatureName}@${process.env.EMAIL_DOMAIN}`,
            //         Name: signatureFromName
            //     }
            // }).catch((err) => {
            //     console.log("unable to create sender signature for mail forward", err.data)
            // });
        }
    }
    return payload;
}

