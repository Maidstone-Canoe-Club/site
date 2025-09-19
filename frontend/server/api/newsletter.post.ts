import { ofetch } from "ofetch";

export default defineEventHandler(async (event) => {
  const data = await readBody(event);
  const token = data.token;

  if (!token) {
    throw createError({
      statusCode: 422,
      statusMessage: "Token not provided"
    });
  }

  const verify = await verifyTurnstileToken(token);
  if (!verify.success) {
    throw createError({
      statusCode: 422,
      statusMessage: "Unable to verify token"
    });
  }

  let result = null;
  try {
    result = await ofetch("/newsletters/subscribe", {
      method: "POST",
      baseURL: process.env.NUXT_PUBLIC_DIRECTUS_URL,
      body: data
    });
  } catch (e) {
    console.error("error sending contact us message to directus", e);
    throw createError({
      statusCode: 500,
      statusMessage: "Error sending contact us message"
    });
  }

  return result;
});
