export function buildQueryParams (params: Record<string, string> | object) {
  const parts = ["?"];

  Object.entries(params)
    .forEach(([k, v]) => {
      parts.push(`${k}=${v}&`);
    });

  let result = parts.join("");
  result = result.replace(/[&?]$/, "");

  return result;
}

export function isExternal (url: string) {
  return /^(https?:|mailto:|tel:)/.test(url);
}
