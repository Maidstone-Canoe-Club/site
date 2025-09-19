export interface ImageOptions {
  width?: number,
  height?: number,
  quality?: number,
  format?: string,
  fit?: string
}

export function generateImageUrl (id: string, width?: number, height?: number, quality?: number, format?: string, fit?: string) {
  return generateImageUrlOptions(id, {
    width,
    height,
    quality,
    format,
    fit
  });
}

export function generateImageUrlOptions (id: string, options?: ImageOptions) {
  const directusUrl = useDirectusUrl();

  let url = `${directusUrl}/assets/${id}`;
  url += buildQueryParams(options);

  return url;
}
