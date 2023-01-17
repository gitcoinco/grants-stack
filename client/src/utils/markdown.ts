import MarkdownIt from "markdown-it";
import { sanitize } from "dompurify";

const markdownIt = new MarkdownIt({
  linkify: true,
  html: false,
});

const defaultLinkOpen =
  markdownIt.renderer.rules.link_open ||
  function defaultLinkOpen(tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };

// Open all links in a new tab and instruct search engines not to follow them
markdownIt.renderer.rules.link_open = function linkOpen(
  tokens,
  idx,
  options,
  env,
  self
) {
  tokens[idx].attrPush(["target", "_blank"]);
  tokens[idx].attrPush(["rel", "nofollow"]);
  return defaultLinkOpen(tokens, idx, options, env, self);
};

export function renderToHTML(value: string) {
  return sanitize(markdownIt.render(value));
}

export function renderToPlainText(value: string) {
  return sanitize(renderToHTML(value), {
    USE_PROFILES: { html: false },
  });
}

export default { renderToHTML, renderToPlainText };
