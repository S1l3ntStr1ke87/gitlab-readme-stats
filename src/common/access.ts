import { renderError } from "./render";
import { blacklist } from "./blacklist";
import { whitelist, snippetsWhitelist } from "./envs";
import type { Response } from "express-serve-static-core";

type AccessType = "username" | "snippets" | "wakatime";

interface ColorOptions {
  title_color?: string;
  text_color?: string;
  bg_color?: string;
  border_color?: string;
  theme?: string;
  show_repo_link?: boolean;
}

interface GuardAccessResult {
  isPassed: boolean;
  result?: Response;
}

const NOT_WHITELISTED_USERNAME_MESSAGE = "This username is not whitelisted";
const NOT_WHITELISTED_SNIPPETS_MESSAGE = "This snippet ID is not whitelisted";
const BLACKLISTED_MESSAGE = "This username is blacklisted";

// Guards access using whitelist/blacklist.
const guardAccess = ({
  res,
  id,
  type,
  colors,
}: {
  res: Response;
  id: string;
  type: AccessType;
  colors: ColorOptions;
}): GuardAccessResult => {
  if (!["username", "snippets", "wakatime"].includes(type)) {
    throw new Error(
      'Invalid type. Expected "username", "snippets", or "wakatime".',
    );
  }

  const currentWhitelist = type === "snippets" ? snippetsWhitelist : whitelist;
  const notWhitelistedMsg =
    type === "snippets"
      ? NOT_WHITELISTED_SNIPPETS_MESSAGE
      : NOT_WHITELISTED_USERNAME_MESSAGE;

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
