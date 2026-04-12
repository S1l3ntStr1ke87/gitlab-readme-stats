const whitelist = process.env.WHITELIST
  ? process.env.WHITELIST.split(",")
  : undefined;

const snippetsWhitelist = process.env.SNIPPETS_WHITELIST
  ? process.env.SNIPPETS_WHITELIST.split(",")
  : undefined;

const excludeRepositories = process.env.EXCLUDE_REPO
  ? process.env.EXCLUDE_REPO.split(",")
  : [];

export { whitelist, snippetsWhitelist, excludeRepositories };
