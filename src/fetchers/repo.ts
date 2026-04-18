import { MissingParamError } from "../common/error";
import { request } from "../common/http";
import { retryer } from "../common/retryer";

const fetcher = (
  variables: Record<string, unknown>,
  token: string | undefined,
): any => {
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

const fetchRepo = async (
  username: string,
  reponame: string,
): Promise<any> => {
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
