import {defineHook} from '@directus/extensions-sdk';
import {ofetch} from "ofetch";

const postmarkUrl = "https://api.postmarkapp.com";

async function postmark(url: string, method: string, body: any) {
    return await ofetch(url, {
        method,
        baseURL: postmarkUrl,
        body,
        headers: {
            "X-Postmark-Account-Token": process.env.EMAIL_ACCOUNT_TOKEN!
        }
    })
}

export default defineHook(({filter}) => {

    filter('items.create', async (payload, meta) => {
        // return await handleMailForwardCreate(payload, meta);
    });

    filter('items.update', async (payload, meta) => {
        // return await handleMailForwardUpdate(payload, meta);
    });

    filter("items.delete", async (payload, meta) => {
        // return await handleMailForwardDelete(payload, meta);
    })
});

async function handleMailForwardCreate(payload: any, meta: Record<string, any>) {
    if (meta.collection !== "mail_forwards") {
        return payload;
    }
    const signatureName = payload.name;
    const signatureFromName = payload.from_name;
    // console.log("mail forward created", payload);
    const res = await ofetch("/senders", {
        method: "POST",
        baseURL: postmarkUrl,
        headers: {
            "X-Postmark-Account-Token": process.env.EMAIL_ACCOUNT_TOKEN!
        },
        body: {
            FromEmail: `${signatureName}@${process.env.EMAIL_DOMAIN}`,
            Name: signatureFromName
        }

    }).catch((err) => {
        console.log("unable to create sender signature for mail forward", err.data)
    });
    payload.sender_signature_id = res.data.id;
    return payload;
}

function handleMailForwardUpdate(payload: any, meta: Record<string, any>) {
    if (meta.collection !== "mail_forwards") {
        return payload;
    }

    // Name: The pretty name associated with the sender signature
    // from_name: The name part of the email that is the sender signature <name>@domain.com

    const signatureName = payload.name;
    const signatureFromName = payload.from_name;
    const signatureId = payload.sender_signature_id;

    console.log("mail forward changed", payload);

    // TODO: if payload.from_name change, api call to delete old signature, api call to create new one with new name
    // else if payload.name change, api call to update existing one from sender_signature_id

    // name changed
    if (signatureFromName) {
        // load old signature to get the from name
        // delete old signature
        // create new one
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
    return payload;
}

async function handleMailForwardDelete(payload: any, meta: Record<string, any>) {
    if (meta.collection !== "mail_forwards") {
        return;
    }

    console.log("mail forward deleted", payload);
}

