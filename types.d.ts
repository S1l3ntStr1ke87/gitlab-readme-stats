export {};

declare global {
type ThemeNames = keyof typeof import("./src/themes/");
type RankIcon = "default" | "github" | "percentile";

const toEmoji: {
  get(input: string): string | undefined;
};

type GistData = {
  name: string;
  nameWithOwner: string;
  description: string | null;
  language: string | null;
  starsCount: number;
  forksCount: number;
};

type RepositoryData = {
  name: string;
  nameWithOwner: string;
  isPrivate: boolean;
  isArchived: boolean;
  isTemplate: boolean;
  stargazers: { totalCount: number };
  description: string;
  primaryLanguage: {
    color: string;
    id: string;
    name: string;
  };
  forkCount: number;
  starCount: number;
};

type StatsData = {
  name: string;

  totalPRs: number;
  totalPRsMerged: number;
  mergedPRsPercentage: number;

  totalReviews: number;

  totalCommits: number;

  totalIssues: number;

  totalStars: number;

  totalDiscussionsStarted: number;
  totalDiscussionsAnswered: number;

  contributedTo: number;

  rank: {
    level: string;
    percentile: number;
  };
};

type Lang = {
  name: string;
  color: string;
  size: number;
};

type GitLabUser = {
  id: number;
  username: string;
  name?: string;
  state?: string;
};

type LangEntry = {
  name: string;
  color: string;
  size: number;
  count: number;
};

type GitLabProject = {
  id: number;
  name: string;
  forked_from_project?: unknown;
};

type MergeRequestStats = {
  total: number;
  merged: number;
};

type IssueStats = {
  open: number;
  closed: number;
};

type GitLabEvent = {
  project_id?: number;
  action_name?: string;
};

type GraphQLStatsResponse = {
  data?: {
    user?: {
      name?: string;
      username: string;
    };
  };
  errors?: Array<{
    message?: string;
    type?: string;
  }>;
  statusText?: string;
};

type StatsFetcherInput = {
  username: string;
};

type RankInput = {
  all_commits: boolean;
  commits: number;
  prs: number;
  reviews: number;
  issues: number;
  repos: number;
  stars: number;
  followers: number;
};

type TopLangData = Record<string, Lang>;

type WakaTimeData = {
  categories: {
    digital: string;
    hours: number;
    minutes: number;
    name: string;
    percent: number;
    text: string;
    total_seconds: number;
  }[];
  daily_average: number;
  daily_average_including_other_language: number;
  days_including_holidays: number;
  days_minus_holidays: number;
  editors: {
    digital: string;
    hours: number;
    minutes: number;
    name: string;
    percent: number;
    text: string;
    total_seconds: number;
  }[];
  holidays: number;
  human_readable_daily_average: string;
  human_readable_daily_average_including_other_language: string;
  human_readable_total: string;
  human_readable_total_including_other_language: string;
  id: string;
  is_already_updating: boolean;
  is_coding_activity_visible: boolean;
  is_including_today: boolean;
  is_other_usage_visible: boolean;
  is_stuck: boolean;
  is_up_to_date: boolean;
  languages: {
    digital: string;
    hours: number;
    minutes: number;
    name: string;
    percent: number;
    text: string;
    total_seconds: number;
  }[];
  operating_systems: {
    digital: string;
    hours: number;
    minutes: number;
    name: string;
    percent: number;
    text: string;
    total_seconds: number;
  }[];
  percent_calculated: number;
  range: string;
  status: string;
  timeout: number;
  total_seconds: number;
  total_seconds_including_other_language: number;
  user_id: string;
  username: string;
  writes_only: boolean;
};

type WakaTimeLang = {
  name: string;
  text: string;
  percent: number;
};

type CommonOptions = {
  title_color: string;
  icon_color: string;
  text_color: string;
  bg_color: string;
  theme: ThemeNames;
  border_radius: number;
  border_color: string;
  locale: string;
  hide_border: boolean;
};

type StatCardOptions = CommonOptions & {
  hide: string[];
  show_icons: boolean;
  hide_title: boolean;
  card_width: number;
  hide_rank: boolean;
  include_all_commits: boolean;
  commits_year: number;
  line_height: number | string;
  custom_title: string;
  disable_animations: boolean;
  number_format: string;
  number_precision: number;
  ring_color: string;
  text_bold: boolean;
  rank_icon: RankIcon;
  show: string[];
};

type RepoCardOptions = CommonOptions & {
  show_owner: boolean;
  description_lines_count: number;
};

type TopLangOptions = CommonOptions & {
  hide_title: boolean;
  card_width: number;
  hide: string[];
  layout: "compact" | "normal" | "donut" | "donut-vertical" | "pie";
  custom_title: string;
  langs_count: number;
  disable_animations: boolean;
  hide_progress: boolean;
  stats_format: "percentages" | "bytes";
};

type WakaTimeOptions = CommonOptions & {
  hide_title: boolean;
  hide: string[];
  card_width: number;
  line_height: string;
  hide_progress: boolean;
  custom_title: string;
  layout: "compact" | "normal";
  langs_count: number;
  display_format: "time" | "percent";
  disable_animations: boolean;
};

type GistCardOptions = CommonOptions & {
  show_owner: boolean;
};
}