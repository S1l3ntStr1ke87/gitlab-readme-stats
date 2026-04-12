// @ts-check

import { MissingParamError } from "../common/error.js";
import axios from "axios";

/**
 * @param {{ path: string }[]} files
 * @returns {string}
 */
const calculatePrimaryLanguage = (files) => {
  /** @type {Record<string, string>} */
  const extMap = {
    ts: "TypeScript", js: "JavaScript", jsx: "JavaScript",
    tsx: "TypeScript", html: "HTML", css: "CSS", scss: "SCSS",
    sass: "SASS", vue: "Vue", svelte: "Svelte",
    py: "Python", rb: "Ruby", java: "Java", go: "Go",
    rs: "Rust", cpp: "C++", c: "C", cs: "C#", php: "PHP",
    swift: "Swift", kt: "Kotlin", ex: "Elixir", exs: "Elixir",
    erl: "Erlang", hs: "Haskell", lua: "Lua", r: "R",
    dart: "Dart", scala: "Scala", clj: "Clojure",
    sh: "Shell", bash: "Shell", zsh: "Shell", fish: "Shell",
    ps1: "PowerShell", dockerfile: "Dockerfile",
    md: "Markdown", json: "JSON", yaml: "YAML", yml: "YAML",
    toml: "TOML", xml: "XML", csv: "CSV", sql: "SQL",
    graphql: "GraphQL", proto: "Protobuf",
  };

  for (const file of files) {
    const ext = file.path.split(".").pop()?.toLowerCase() || "";
    if (extMap[ext]) return extMap[ext];
  }
  return "Unknown";
};

/**
 * @typedef {{ name: string, nameWithOwner: string, description: string, language: string, starsCount: number, forksCount: number }} SnippetData
 */

/**
 * Fetch GitLab snippet information by ID.
 *
 * @param {string} id GitLab snippet ID.
 * @returns {Promise<SnippetData>}
 */
const fetchSnippet = async (id) => {
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