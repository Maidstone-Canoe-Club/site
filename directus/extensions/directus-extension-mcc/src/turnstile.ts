import {ofetch} from "ofetch";

const verifyUrl = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

type VerifyResult = {
  success: boolean,
  "error-codes"?: string[]
}

// Express middleware for the public forms. Directus is reachable directly, so the Turnstile token is checked here
// rather than only in the website's API routes, otherwise the forms could be spammed by skipping the website
export async function requireTurnstile(req: any, res: any, next: any) {
  const token = req.body?.token;

  if (!token || typeof token !== "string") {
    return res.status(422).send("Token not provided");
  }

  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    console.error("TURNSTILE_SECRET_KEY is not set, so form submissions can't be verified");
    return res.status(500).send("Unable to verify token");
  }

  try {
    const result = await ofetch<VerifyResult>(verifyUrl, {
      method: "POST",
      body: {
        secret,
        response: token
      }
    });

    if (!result.success) {
      console.warn("Turnstile verification failed", result["error-codes"]);
      return res.status(422).send("Unable to verify token");
    }
  } catch (e) {
    console.error("error verifying Turnstile token", e);
    return res.status(500).send("Unable to verify token");
  }

  return next();
}
