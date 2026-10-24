import {createHash, timingSafeEqual} from "node:crypto";

function digest(value: string) {
  return createHash("sha256").update(value).digest();
}

// Postmark posts inbound email with basic auth taken from the webhook URL
// (https://user:password@.../webhooks/mail-inbound). Without it anyone could post fake emails, for example to
// a mailing list as one of its subscribers. A 401 makes Postmark retry, so mail isn't lost while the
// credentials are being set up.
export function requireInboundAuth(req: any, res: any, next: any) {
  const username = process.env.INBOUND_WEBHOOK_USERNAME;
  const password = process.env.INBOUND_WEBHOOK_PASSWORD;

  if (!username || !password) {
    console.error("INBOUND_WEBHOOK_USERNAME and INBOUND_WEBHOOK_PASSWORD are not set, so inbound email is refused");
    return res.status(401).send("Unauthorized");
  }

  const header: string = req.headers.authorization ?? "";
  const supplied = header.startsWith("Basic ") ? Buffer.from(header.slice(6), "base64").toString("utf8") : "";

  // Compare hashes so the check takes the same time whatever was sent
  if (!timingSafeEqual(digest(supplied), digest(`${username}:${password}`))) {
    console.warn("Refused inbound email webhook with missing or wrong credentials");
    res.set("WWW-Authenticate", "Basic realm=\"inbound\"");
    return res.status(401).send("Unauthorized");
  }

  return next();
}
