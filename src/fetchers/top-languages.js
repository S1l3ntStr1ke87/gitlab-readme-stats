// @ts-check
import axios from "axios";
import { excludeRepositories } from "../common/envs.js";
import { CustomError, MissingParamError } from "../common/error.js";

const GITLAB_REST_URL = "https://gitlab.com/api/v4";

/**
 * @typedef {import("./types").TopLangData} TopLangData Top languages data.
 */

const getToken = () => {
  const token = process.env.GITLAB_TOKEN || process.env.PAT_1;
  if (!token) throw new CustomError("No GitLab token found.", CustomError.NO_TOKENS);
  return token;
};

/**
 * Fetch all projects for a user via REST.
 *
 * @param {string} username
 * @param {string} token
 * @returns {Promise<any[]>}
 */
const fetchUserProjects = async (username, token) => {
  let page = 1;
  let allProjects = [];
  while (true) {
    const res = await axios.get(
      `${GITLAB_REST_URL}/users/${encodeURIComponent(username)}/projects`,
      {
        params: { per_page: 100, page },
        headers: { "PRIVATE-TOKEN": token },
      },
    );
    allProjects.push(...res.data);
    const nextPage = res.headers["x-next-page"];
    if (!nextPage) break;
    page = parseInt(nextPage, 10);
  }
  return allProjects;
};

/**
 * Fetch language breakdown for a single project.
 * GitLab returns { "JavaScript": 67.5, "CSS": 32.5 } (percentages).
 *
 * @param {number} projectId
 * @param {string} token
 * @returns {Promise<Record<string, number>>}
 */
const fetchProjectLanguages = async (projectId, token) => {
  try {
    const res = await axios.get(
      `${GITLAB_REST_URL}/projects/${projectId}/languages`,
      { headers: { "PRIVATE-TOKEN": token } },
    );
    return res.data;
  } catch (_) {
    return {};
  }
};

/**
 * Fetch top languages for a given GitLab username.
 *
 * @param {string} username GitLab username.
 * @param {string[]} exclude_repo List of repositories to exclude.
 * @param {number} size_weight Weightage to be given to size.
 * @param {number} count_weight Weightage to be given to count.
 * @returns {Promise<TopLangData>} Top languages data.
 */
const fetchTopLanguages = async (
  username,
  exclude_repo = [],
  size_weight = 1,
  count_weight = 0,
) => {
  if (!username) {
    throw new MissingParamError(["username"]);
  }

  const token = getToken();

  // 1. Get all user projects
  let projects;
  try {
    projects = await fetchUserProjects(username, token);
  } catch (err) {
    if (err?.response?.status === 404) {
      throw new CustomError("Could not fetch user.", CustomError.USER_NOT_FOUND);
    }
    throw new CustomError(
      "Could not fetch user projects.",
      CustomError.GITHUB_REST_API_ERROR,
    );
  }

  // 2. Filter out excluded repos
  const allExcludedRepos = [...exclude_repo, ...excludeRepositories];
  const repoToHide = new Set(allExcludedRepos);
  projects = projects.filter(
    (p) =>
      !repoToHide.has(p.name) &&
      !p.forked_from_project &&
      p.name.toLowerCase() !== username.toLowerCase(),
  );

  // 3. Fan out — fetch language data for each project in parallel
  //    Cap concurrency to avoid hammering the API
  const CHUNK_SIZE = 10;
  const languageResults = [];
  for (let i = 0; i < projects.length; i += CHUNK_SIZE) {
    const chunk = projects.slice(i, i + CHUNK_SIZE);
    const results = await Promise.all(
      chunk.map((p) => fetchProjectLanguages(p.id, token)),
    );
    languageResults.push(...results);
  }

  // 4. Aggregate — GitLab returns percentages, so we treat each project's
  //    percentage as a "size" unit and count how many projects use each language.
  //    percentage as a "size" unit and count how many projects use each language.
  /** @type {Record<string, { name: string, color: string, size: number, count: number }>} */
  const langMap = {};

  languageResults.forEach((langs) => {
    Object.entries(langs).forEach(([name, percentage]) => {
      if (!langMap[name]) {
        langMap[name] = {
          name,
          color: getLanguageColor(name),
          size: 0,
          count: 0,
        };
      }
      langMap[name].size += /** @type {number} */ (percentage);
      langMap[name].count += 1;
    });
  });

  // 5. Apply weights (same formula as the GitHub version)
  Object.keys(langMap).forEach((name) => {
    langMap[name].size =
      Math.pow(langMap[name].size, size_weight) *
      Math.pow(langMap[name].count, count_weight);
  });

  // 6. Sort and return
  const topLangs = Object.keys(langMap)
    .sort((a, b) => langMap[b].size - langMap[a].size)
    .reduce((result, key) => {
      result[key] = langMap[key];
      return result;
    }, {});

  return topLangs;
};

/**
 * Best-effort language color lookup.
 * GitLab REST doesn't return colors — we use a small map of common languages.
 * Falls back to a neutral grey for unknowns.
 *
 * @param {string} name
 * @returns {string} Hex color string.
 */
const getLanguageColor = (name) => {
  const colors = {
    JavaScript: "#f1e05a",
    TypeScript: "#3178c6",
    Python: "#3572A5",
    Ruby: "#701516",
    Java: "#b07219",
    Go: "#00ADD8",
    Rust: "#dea584",
    "C++": "#f34b7d",
    C: "#555555",
    "C#": "#178600",
    PHP: "#4F5D95",
    Swift: "#F05138",
    Kotlin: "#A97BFF",
    Scala: "#c22d40",
    Shell: "#89e051",
    HTML: "#e34c26",
    CSS: "#563d7c",
    SCSS: "#c6538c",
    Vue: "#41b883",
    Svelte: "#ff3e00",
    Dart: "#00B4AB",
    Elixir: "#6e4a7e",
    Haskell: "#5e5086",
    Lua: "#000080",
    R: "#198CE7",
    "Jupyter Notebook": "#DA5B0B",
  };
  return colors[name] || "#858585";
};

export { fetchTopLanguages };
export default fetchTopLanguages;