// @ts-check
import axios from "axios";
import * as dotenv from "dotenv";
import { calculateRank } from "../utils/calculateRank.js";
import { retryer } from "../common/retryer.js";
import { logger } from "../common/log.js";
import { excludeRepositories } from "../common/envs.js";
import { CustomError, MissingParamError } from "../common/error.js";
import { wrapTextMultiline } from "../common/fmt.js";
import { request } from "../common/http.js";
dotenv.config();

const GITLAB_REST_URL = "https://gitlab.com/api/v4";

const GRAPHQL_STATS_QUERY = `
  query userStats($username: String!) {
    user(username: $username) {
      name
      username
      state
    }
  }
`;

const fetcher = (variables, token) => {
  return request(
    { query: GRAPHQL_STATS_QUERY, variables },
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  );
};

const statsFetcher = async ({ username }) => {
  return retryer(fetcher, { username });
};

const getToken = () => {
  const token = process.env.GITLAB_TOKEN || process.env.PAT_1;
  if (!token) throw new CustomError("No GitLab token found.", CustomError.NO_TOKENS);
  return token;
};

const fetchUserId = async (username, token) => {
  const res = await axios.get(`${GITLAB_REST_URL}/users`, {
    params: { username },
    headers: { "PRIVATE-TOKEN": token },
  });
  if (!res.data.length) {
    throw new CustomError("User not found.", CustomError.USER_NOT_FOUND);
  }
  return res.data[0].id;
};

/**
 * Fetch all projects for a user via REST (supports pagination).
 * Uses star_count (REST field name, not starCount).
 */
const fetchProjects = async (username, token) => {
  let page = 1;
  let allProjects = [];
  while (true) {
    const res = await axios.get(
      `${GITLAB_REST_URL}/users/${encodeURIComponent(username)}/projects`,
      {
        params: { per_page: 100, page, order_by: "star_count" },
        headers: { "PRIVATE-TOKEN": token },
      },
    );
    allProjects.push(...res.data);
    const nextPage = res.headers["x-next-page"];
    if (!nextPage || process.env.FETCH_MULTI_PAGE_STARS !== "true") break;
    page = parseInt(nextPage, 10);
  }
  return allProjects;
};

const fetchTotalCommits = async (username, token) => {
  const res = await axios.get(
    `${GITLAB_REST_URL}/users/${encodeURIComponent(username)}/contributions_calendar`,
    { headers: { "PRIVATE-TOKEN": token } },
  );
  return Object.values(res.data).reduce((sum, n) => sum + /** @type {number} */ (n), 0);
};

const fetchMergeRequestStats = async (userId, token) => {
  const [allRes, mergedRes] = await Promise.all([
    axios.get(`${GITLAB_REST_URL}/merge_requests`, {
      params: { author_id: userId, scope: "all", per_page: 1 },
      headers: { "PRIVATE-TOKEN": token },
    }),
    axios.get(`${GITLAB_REST_URL}/merge_requests`, {
      params: { author_id: userId, scope: "all", state: "merged", per_page: 1 },
      headers: { "PRIVATE-TOKEN": token },
    }),
  ]);
  return {
    total: parseInt(allRes.headers["x-total"] ?? "0", 10),
    merged: parseInt(mergedRes.headers["x-total"] ?? "0", 10),
  };
};

const fetchIssueStats = async (userId, token) => {
  const [openRes, closedRes] = await Promise.all([
    axios.get(`${GITLAB_REST_URL}/issues`, {
      params: { author_id: userId, scope: "all", state: "opened", per_page: 1 },
      headers: { "PRIVATE-TOKEN": token },
    }),
    axios.get(`${GITLAB_REST_URL}/issues`, {
      params: { author_id: userId, scope: "all", state: "closed", per_page: 1 },
      headers: { "PRIVATE-TOKEN": token },
    }),
  ]);
  return {
    open: parseInt(openRes.headers["x-total"] ?? "0", 10),
    closed: parseInt(closedRes.headers["x-total"] ?? "0", 10),
  };
};

const fetchContributedTo = async (username, token) => {
  try {
    const res = await axios.get(
      `${GITLAB_REST_URL}/users/${encodeURIComponent(username)}/events`,
      {
        params: { action: "pushed", per_page: 100 },
        headers: { "PRIVATE-TOKEN": token },
      },
    );
    const uniqueProjects = new Set(
      res.data.map((e) => e.project_id).filter(Boolean),
    );
    return uniqueProjects.size;
  } catch (_) {
    return 0;
  }
};

const fetchStats = async (
  username,
  include_all_commits = false,
  exclude_repo = [],
  include_merged_pull_requests = false,
  include_discussions = false,
  include_discussions_answers = false,
  commits_year,
) => {
  if (!username) {
    throw new MissingParamError(["username"]);
  }

  const stats = {
    name: "",
    totalPRs: 0,
    totalPRsMerged: 0,
    mergedPRsPercentage: 0,
    totalReviews: 0,
    totalCommits: 0,
    totalIssues: 0,
    totalStars: 0,
    totalDiscussionsStarted: 0,
    totalDiscussionsAnswered: 0,
    contributedTo: 0,
    rank: { level: "C", percentile: 100 },
  };

  // 1. GraphQL — user profile (name/username only)
  const res = await statsFetcher({ username });

  if (res.data.errors) {
    logger.error(res.data.errors);
    if (
      res.data.errors[0].type === "NOT_FOUND" ||
      res.data.errors[0].message?.toLowerCase().includes("not found")
    ) {
      throw new CustomError(
        res.data.errors[0].message || "Could not fetch user.",
        CustomError.USER_NOT_FOUND,
      );
    }
    if (res.data.errors[0].message) {
      throw new CustomError(
        wrapTextMultiline(res.data.errors[0].message, 90, 1)[0],
        res.statusText,
      );
    }
    throw new CustomError(
      "Something went wrong while trying to retrieve the stats data using the GraphQL API.",
      CustomError.GRAPHQL_ERROR,
    );
  }

  const user = res.data.data.user;
  if (!user) {
    throw new CustomError("Could not fetch user.", CustomError.USER_NOT_FOUND);
  }

  stats.name = user.name || user.username;

  // 2. REST — token + user ID
  const token = getToken();
  const userId = await fetchUserId(username, token);

  // 3. Projects + stars via REST (projects field doesn't exist on UserCore in GraphQL)
  const allProjects = await fetchProjects(username, token);
  const repoToHide = new Set([...exclude_repo, ...excludeRepositories]);
  const visibleProjects = allProjects.filter((p) => !repoToHide.has(p.name));
  stats.totalStars = visibleProjects.reduce((sum, p) => sum + (p.star_count ?? 0), 0);

  // 4. Commits from contributions calendar
  if (include_all_commits) {
    try {
      stats.totalCommits = await fetchTotalCommits(username, token);
    } catch (err) {
      logger.log("Could not fetch commit count:", err.message);
    }
  }

  // 5. Merge requests
  const mrStats = await fetchMergeRequestStats(userId, token);
  stats.totalPRs = mrStats.total;
  if (include_merged_pull_requests) {
    stats.totalPRsMerged = mrStats.merged;
    stats.mergedPRsPercentage =
      mrStats.total > 0 ? (mrStats.merged / mrStats.total) * 100 : 0;
  }

  // 6. Issues
  const issueStats = await fetchIssueStats(userId, token);
  stats.totalIssues = issueStats.open + issueStats.closed;

  // 7. Contributed to (unique projects with push events)
  stats.contributedTo = await fetchContributedTo(username, token);

  // 8. Rank
  stats.rank = calculateRank({
    all_commits: include_all_commits,
    commits: stats.totalCommits,
    prs: stats.totalPRs,
    reviews: stats.totalReviews,
    issues: stats.totalIssues,
    repos: visibleProjects.length,
    stars: stats.totalStars,
    followers: 0,
  });

  return stats;
};

export { fetchStats };
export default fetchStats;