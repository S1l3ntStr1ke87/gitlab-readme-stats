import axios from "axios";
import { excludeRepositories } from "../common/envs";
import { CustomError, MissingParamError } from "../common/error";

const getToken = (): string => {
  const token = process.env.PAT_1 || process.env.PAT_2;
  if (!token) throw new CustomError("No GitLab token found.", CustomError.NO_TOKENS);
  return token;
};

/**
 * Fetch all projects for a user via REST.
 */
const fetchUserProjects = async (
  username: string,
  token: string,
): Promise<GitLabProject[]> => {
  let page = 1;
  const allProjects: GitLabProject[] = [];

  while (true) {
    const res = await axios.get<GitLabProject[]>(
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
 * Fetch language breakdown for a single project.
 * GitLab returns e.g. { "JavaScript": 67.5, "CSS": 32.5 } (percentages).
 */
const fetchProjectLanguages = async (
  projectId: number,
  token: string,
): Promise<Record<string, number>> => {
  try {
    const res = await axios.get<Record<string, number>>(
      `https://gitlab.com/api/v4/projects/${projectId}/languages`,
      { headers: { "PRIVATE-TOKEN": token } },
    );
    return res.data;
  } catch (_) {
    return {};
  }
};

/**
 * Fetch top languages for a given GitLab username.
 */
const fetchTopLanguages = async (
  username: string,
  exclude_repo: string[] = [],
  size_weight = 1,
  count_weight = 0,
): Promise<TopLangData> => {
  if (!username) {
    throw new MissingParamError(["username"]);
  }

  const token = getToken();

  let projects: GitLabProject[];
  try {
    projects = await fetchUserProjects(username, token);
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } }).response?.status;
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
  const languageResults: Record<string, number>[] = [];
  for (let i = 0; i < projects.length; i += CHUNK_SIZE) {
    const chunk = projects.slice(i, i + CHUNK_SIZE);
    const results = await Promise.all(
      chunk.map((p) => fetchProjectLanguages(p.id, token)),
    );
    languageResults.push(...results);
  }

  const langMap: Record<string, LangEntry> = {};

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
    .reduce<TopLangData>((result, key) => {
      result[key] = langMap[key];
      return result;
    }, {} as TopLangData);

  return topLangs;
};

const getLanguageColor = (name: string): string => {
  const colors = require("../common/languageColors.json");
  return colors[name] ?? "#858585";
};

export { fetchTopLanguages };
export default fetchTopLanguages;