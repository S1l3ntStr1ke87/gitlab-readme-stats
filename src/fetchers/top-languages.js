// @ts-check
import axios from "axios";
import { excludeRepositories } from "../common/envs.js";
import { CustomError, MissingParamError } from "../common/error.js";

/**
 * @returns {string}
 */
const getToken = () => {
  const token = process.env.PAT_1 || process.env.PAT_2;
  if (!token) throw new CustomError("No GitLab token found.", CustomError.NO_TOKENS);
  return token;
};

/**
 * @param {string} username
 * @param {string} token
 * @returns {Promise<any[]>}
 */
const fetchUserProjects = async (username, token) => {
  let page = 1;
  const allProjects = [];
  while (true) {
    const res = await axios.get(
      `https://gitlab.com/api/v4/users/${encodeURIComponent(username)}/projects`,
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
 * @param {number} projectId
 * @param {string} token
 * @returns {Promise<Record<string, number>>}
 */
const fetchProjectLanguages = async (projectId, token) => {
  try {
    const res = await axios.get(
      `https://gitlab.com/api/v4/projects/${projectId}/languages`,
      { headers: { "PRIVATE-TOKEN": token } },
    );
    return res.data;
  } catch (_) {
    return {};
  }
};

const languageColors = require("../common/languageColors.json");
/**
 * @param {string} name
 * @returns {string}
 */
const getLanguageColor = (name) => {
  return /** @type {Record<string, string>} */ (languageColors)[name] ?? "#858585";
};

/**
 * @param {string} username
 * @param {string[]} exclude_repo
 * @param {number} size_weight
 * @param {number} count_weight
 * @returns {Promise<Record<string, any>>}
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

  /** @type {any[]} */
  let projects;
  try {
    projects = await fetchUserProjects(username, token);
  } catch (err) {
    const status = /** @type {any} */ (err)?.response?.status;
    if (status === 404) {
      throw new CustomError("Could not fetch user.", CustomError.USER_NOT_FOUND);
    }
    throw new CustomError(
      "Could not fetch user projects.",
      CustomError.GITHUB_REST_API_ERROR,
    );
  }

  const allExcludedRepos = [...exclude_repo, ...excludeRepositories];
  const repoToHide = new Set(allExcludedRepos);

  projects = projects.filter(
    (p) =>
      !repoToHide.has(p.name) &&
      !p.forked_from_project &&
      p.name.toLowerCase() !== username.toLowerCase(),
  );

  const CHUNK_SIZE = 10;
  /** @type {Record<string, number>[]} */
  const languageResults = [];
  for (let i = 0; i < projects.length; i += CHUNK_SIZE) {
    const chunk = projects.slice(i, i + CHUNK_SIZE);
    const results = await Promise.all(
      chunk.map((p) => fetchProjectLanguages(p.id, token)),
    );
    languageResults.push(...results);
  }

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
      langMap[name].size += percentage;
      langMap[name].count += 1;
    });
  });

  Object.keys(langMap).forEach((name) => {
    langMap[name].size =
      Math.pow(langMap[name].size, size_weight) *
      Math.pow(langMap[name].count, count_weight);
  });

  const topLangs = Object.keys(langMap)
    .sort((a, b) => langMap[b].size - langMap[a].size)
    .reduce((result, key) => {
      result[key] = langMap[key];
      return result;
    }, /** @type {Record<string, any>} */ ({}));

  return topLangs;
};

export { fetchTopLanguages };
export default fetchTopLanguages;