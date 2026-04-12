import axios from "axios";
import { MissingParamError } from "../common/error";
const languageTypes = require("./snippetsFileTypes.json");

const calculatePrimaryLanguage = (files: SnippetsFile[]) => {
  for (const file of files) {
    const ext = file.path.split(".").pop()?.toLowerCase() || "";
    if (/** @type {Record<string, string>} */ (languageTypes)[ext]) {
      return /** @type {Record<string, string>} */ (languageTypes)[ext];
    }
  }
  return "Unknown";
};

const fetchSnippet = async (id: SnippetsFile[]) => {
  if (!id) {
    throw new MissingParamError(["id"], "/api/gist?id=SNIPPET_ID");
  }

  const token = process.env.GITLAB_TOKEN;
  const headers = token ? { "PRIVATE-TOKEN": token } : {};

  const [snippetRes] = await Promise.all([
    axios.get(`https://gitlab.com/api/v4/snippets/${id}`, { headers })
  ]);

  if (!snippetRes.data) {
    throw new Error("Snippet not found");
  }

  const data = snippetRes.data;

  return {
    name: data.title,
    nameWithOwner: `${data.author.username}/${data.title}`,
    description: data.description || "",
    language: calculatePrimaryLanguage(data.files),
    starsCount: 0,
    forksCount: 0,
  };
};

export { fetchSnippet };
export default fetchSnippet;
