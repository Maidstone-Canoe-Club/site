import { FetchError, ofetch } from "ofetch";

export default defineEventHandler(async (event) => {
  const data = await readBody(event);
  const token = data.token;

  if (!token) {
    throw createError({
      statusCode: 422,
      statusMessage: "Token not provided"
    });
  }

  // Directus verifies the token itself. A token can only be checked once, so it isn't verified here as well
  try {
    await ofetch("/contact-us/user", {
      method: "POST",
      baseURL: process.env.NUXT_PUBLIC_DIRECTUS_URL,
      body: data
    });
  }
  catch (e) {
    // Directus answers 422 when it rejects the Turnstile token
    if (e instanceof FetchError && e.statusCode === 422) {
      throw createError({
        statusCode: 422,
        statusMessage: "Unable to verify token"
      });
    }

    console.error("error sending contact us message to directus", e);
    throw createError({
      statusCode: 500,
      statusMessage: "Error sending contact us message"
    });
  }

  return true;
});
