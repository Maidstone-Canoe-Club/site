import sanitizeHtml from "sanitize-html";

const textStyles = {
  "color": [/^[#a-z0-9(),.%\s]+$/i],
  "background-color": [/^[#a-z0-9(),.%\s]+$/i],
  "text-align": [/^(left|right|center|justify)$/],
  "text-decoration": [/^[a-z\s-]+$/]
};

// Covers what the website's editor and the Directus editor produce (checked against the existing events and
// news content), and drops anything that can run script: <script>, on* attributes, javascript: links and so on
const options: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "div", "span", "strong", "b", "em", "i", "u", "s", "sup", "sub", "wbr",
    "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "pre", "code",
    "ul", "ol", "li", "a", "img",
    "table", "thead", "tbody", "tfoot", "tr", "th", "td", "hr"
  ],
  allowedAttributes: {
    "*": ["class", "style", "dir"],
    "a": ["href", "target", "rel"],
    "img": ["src", "alt", "width", "height", "loading"],
    "tr": ["align", "valign"],
    "td": ["colspan", "rowspan", "align", "valign"],
    "th": ["colspan", "rowspan", "align", "valign"]
  },
  allowedStyles: {
    "*": textStyles
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: {
    img: ["http", "https", "data"]
  },
  allowProtocolRelative: false,
  // Links that open a new tab can't reach back into the page
  transformTags: {
    a: (tagName, attribs) => {
      if (attribs.target === "_blank") {
        attribs.rel = "noopener noreferrer";
      }
      return {tagName, attribs};
    }
  }
};

export function sanitiseRichText(html: string) {
  return sanitizeHtml(html, options);
}
