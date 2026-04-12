// @ts-check

import { renderError } from "./render.js";
import { blacklist } from "./blacklist.js";
import { whitelist, snippetsWhitelist } from "./envs.js";

const NOT_WHITELISTED_USERNAME_MESSAGE = "This username is not whitelisted";
const NOT_WHITELISTED_snippets_MESSAGE = "This snippets ID is not whitelisted";
const BLACKLISTED_MESSAGE = "This username is blacklisted";

/**
 * Guards access using whitelist/blacklist.
 *
 * @param {Object} args The parameters object.
 * @param {any} args.res The response object.
 * @param {string} args.id Resource identifier (username or snippets id).
 * @param {"username"|"snippets"|"wakatime"} args.type The type of identifier.
 * @param {{ title_color?: string, text_color?: string, bg_color?: string, border_color?: string, theme?: string }} args.colors Color options for the error card.
 * @returns {{ isPassed: boolean, result?: any }} The result object indicating success or failure.
 */
const guardAccess = ({ res, id, type, colors }) => {
  if (!["username", "snippets", "wakatime"].includes(type)) {
    throw new Error(
      'Invalid type. Expected "username", "snippets", or "wakatime".',
    );
  }

  const currentWhitelist = type === "snippets" ? snippetsWhitelist : whitelist;
  const notWhitelistedMsg =
    type === "snippets"
      ? NOT_WHITELISTED_snippets_MESSAGE
      : NOT_WHITELISTED_snippets_MESSAGE;

  if (Array.isArray(currentWhitelist) && !currentWhitelist.includes(id)) {
    const result = res.send(
      renderError({
        message: notWhitelistedMsg,
        secondaryMessage: "Please deploy your own instance",
        renderOptions: {
          ...colors,
          show_repo_link: false,
        },
      }),
    );
    return { isPassed: false, result };
  }

  if (
    type === "username" &&
    currentWhitelist === undefined &&
    blacklist.includes(id)
  ) {
    const result = res.send(
      renderError({
        message: BLACKLISTED_MESSAGE,
        secondaryMessage: "Please deploy your own instance",
        renderOptions: {
          ...colors,
          show_repo_link: false,
        },
      }),
    );
    return { isPassed: false, result };
  }

  return { isPassed: true };
};

export { guardAccess };
