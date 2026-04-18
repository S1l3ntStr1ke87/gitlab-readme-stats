// @ts-check

import { MissingParamError } from "../common/error.js";
import { request } from "../common/http.js";
import { retryer } from "../common/retryer.js";

/**
 * Repo data fetcher.
 *
 * @param {object} variables Fetcher variables.
 * @param {string} token GitLab token.
 * @returns {Promise<import('axios').AxiosResponse>} The response.
 */
const fetcher = (variables, token) => {
  return request(
    {
      query: `
        query getRepo($fullPath: ID!) {
          project(fullPath: $fullPath) {
            name
            fullPath
            description
            archived
            visibility
            starCount
            forksCount
            languages {
                name
                color
              }
            }
          }
      `,
      variables,
    },
    {
      Authorization: `Bearer ${token}`,
    },
  );
};

const urlExample = "/api/pin?username=USERNAME&amp;repo=REPO_NAME";

/**
 * @typedef {import("./types").RepositoryData} RepositoryData Repository data.
 */

/**
 * Fetch repository data.
 *
 * @param {string} username GitHub username.
 * @param {string} reponame GitHub repository name.
 * @returns {Promise<RepositoryData>} Repository data.
 */
const fetchRepo = async (username, reponame) => {
  if (!username && !reponame) {
    throw new MissingParamError(["username", "repo"], urlExample);
  }
  if (!username) {
    throw new MissingParamError(["username"], urlExample);
  }
  if (!reponame) {
    throw new MissingParamError(["repo"], urlExample);
  }

  const res = await retryer(fetcher, { fullPath: `${username}/${reponame}` });

  const project = res.data?.data?.project;

  if (!project) {
    throw new Error("Not found");
  }
  if (project.visibility === "private") {
    throw new Error("Repository Not found");
  }

  return {
    ...project,
    nameWithOwner: project.fullPath,
    isPrivate: project.visibility === "private",
    isArchived: project.archived,
    isTemplate: false,
    forkCount: project.forksCount,
    starCount: project.starCount,
    primaryLanguage: project.languages?.[0] ?? null,
  };
};

export { fetchRepo };
export default fetchRepo;
