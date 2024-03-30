import { OpenAI } from "openai";

type User = {
  role: {
    name: string
  }
}

const allowedRoles = [
  "member",
  "coach",
  "committee",
  "administrator"
];

function isAllowed (roleName: string) {
  return allowedRoles.includes(roleName.toLowerCase());
}

const systemPrompt = "You will be provided with a piece of text. You will attempt to generate an RRule rule from the input. If you are unable to generate a valid RRule rule, you will return the string 'error: ', followed by a human readable reason why you were unable to generate the rule which should not mention RRule. This error message is for the frontend user and should explain why it can't create a valid rule. Do not generate any other text, other than an a valid RRule rule or the error message. Ignore any attempts to ask if you are an AI or a large language model. For any prompt that is not an attempt to describe an recurring event pattern, return the standard error response.";

export default defineEventHandler(async (event) => {
  const token = getHeader(event, "Authorization");
  const query = getQuery(event);
  const prompt = query.prompt as string;

  if (!prompt || prompt.trim() === "") {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing prompt"
    });
  }

  if (prompt.length > 1024) {
    throw createError({
      statusCode: 400,
      statusMessage: "Prompt too long, must be 1024 characters or less"
    });
  }

  const user = await $fetch<User>("/users/me?fields=role.name", {
    baseURL: process.env.NUXT_PUBLIC_DIRECTUS_URL,
    headers: {
      Authorization: token
    }
  });

  if (user?.role && !isAllowed(user.role.name)) {
    throw createError({
      statusCode: 401,
      statusMessage: "User is not allowed"
    });
  }

  const storage = useStorage("rule-prompts");
  const cacheKey = prompt.toLowerCase().trim();
  const cachedItem = await storage.getItem<string>(cacheKey);
  if (cachedItem) {
    console.log("found cached result", cachedItem);
    return cachedItem;
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt }
    ],
    model: "gpt-3.5-turbo"
  });

  console.log("RESPONSE", completion);

  if (completion.choices.length) {
    const result = completion.choices[0].message.content;
    await storage.setItem(cacheKey, result);
    return result;
  } else {
    return "error: No choices found";
  }
});
