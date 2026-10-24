import {defineHook} from "@directus/extensions-sdk";
import {sanitiseRichText} from "../sanitise-html";

// Rich text fields that members and trusted users can write, which the website renders as HTML.
// Committee-only content (pages, FAQs, the home page) isn't touched, so its embeds keep working.
const richTextFields: Record<string, string[]> = {
  events: ["description", "disclaimer"],
  news: ["content"]
};

export default defineHook(({filter}) => {
  for (const [collection, fields] of Object.entries(richTextFields)) {
    const sanitisePayload = (payload: any) => {
      for (const field of fields) {
        if (typeof payload?.[field] === "string") {
          payload[field] = sanitiseRichText(payload[field]);
        }
      }

      return payload;
    };

    filter(`${collection}.items.create`, sanitisePayload);
    filter(`${collection}.items.update`, sanitisePayload);
  }
});
