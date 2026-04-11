import { retryer } from "../common/retryer.js";
import { MissingParamError } from "../common/error.js";
import { request } from "../common/http.js";

const QUERY = `
query gistInfo($gistName: String!) {
    viewer {
        gist(name: $gistName) {
            description
            owner {
                login
            }
            stargazerCount
            forks {
                totalCount
            }
            files {
                name
                language {
                    name
                }
                size
            }
        }
    }
}
`;

const fetcher = async (
  variables: Record<string, unknown>,
  token: string | undefined,
): Promise<any> => {
  return await request(
    { query: QUERY, variables },
    { Authorization: `token ${token}` },
  );
};

const calculatePrimaryLanguage = (
  files: Array<{language: {name: string} | null; size: number}>,
): string | null => {
  const languages: Record<string, number> = {};

  for (const file of files) {
    const languageName = file.language?.name;
    if (languageName) {
      languages[languageName] = (languages[languageName] ?? 0) + file.size;
    }
  }

  const languageNames = Object.keys(languages);
  if (languageNames.length === 0) {
    return null;
  }

  let primaryLanguage = languageNames[0];
  for (const language of languageNames) {
    if (languages[language] > languages[primaryLanguage]) {
      primaryLanguage = language;
    }
  }

  return primaryLanguage;
};

const fetchGist = async (id: string): Promise<any> => {
  if (!id) {
    throw new MissingParamError(["id"], "/api/gist?id=GIST_ID");
  }
  const res = await retryer(fetcher, { gistName: id });
  if (res.data.errors) {
    throw new Error(res.data.errors[0].message);
  }
  if (!res.data.data.viewer.gist) {
    throw new Error("Gist not found");
  }
  const data: any = res.data.data.viewer.gist;
  return {
    name: data.files[Object.keys(data.files)[0]].name,
    nameWithOwner: `${data.owner.login}/${
      data.files[Object.keys(data.files)[0]].name
    }`,
    description: data.description,
    language: calculatePrimaryLanguage(data.files),
    starsCount: data.stargazerCount,
    forksCount: data.forks.totalCount,
  };
};

export { fetchGist };
export default fetchGist;
