<div align="center">
  <img src="https://cdn.worldvectorlogo.com/logos/gitlab.svg" width="100px" alt="GitLab Readme Stats" />
  <h1 style="font-size: 28px; margin: 10px 0;">GitLab Readme Stats</h1>
  <p>Get dynamically generated GitLab stats on your READMEs!</p>
</div>

<p align="center">
  <a href="https://docker.com">
    <img src="./.github/powered-by-docker.png"/>
  </a>
  <a href="https://vercel.com?utm\_source=github\_readme\_stats\_team\&utm\_campaign=oss">
    <img src="./.github/powered-by-vercel.svg"/>
  </a>
</p>

<details>
<summary>Table of contents (Click to show)</summary>

- [GitLab Stats Card](#github-stats-card)
    - [Hiding individual stats](#hiding-individual-stats)
    - [Showing additional individual stats](#showing-additional-individual-stats)
    - [Showing icons](#showing-icons)
    - [Showing commits count for specified year](#showing-commits-count-for-specified-year)
    - [Themes](#themes)
    - [Customization](#customization)
- [GitLab Extra Pins](#github-extra-pins)
    - [Usage](#usage)
    - [Options](#options)
    - [Demo](#demo)
- [GitLab Snippets Pins](#github-gist-pins)
    - [Usage](#usage-1)
    - [Options](#options-1)
    - [Demo](#demo-1)
- [Top Languages Card](#top-languages-card)
    - [Usage](#usage-2)
    - [Options](#options-2)
    - [Language stats algorithm](#language-stats-algorithm)
    - [Exclude individual repositories](#exclude-individual-repositories)
    - [Hide individual languages](#hide-individual-languages)
    - [Show more languages](#show-more-languages)
    - [Compact Language Card Layout](#compact-language-card-layout)
    - [Donut Chart Language Card Layout](#donut-chart-language-card-layout)
    - [Donut Vertical Chart Language Card Layout](#donut-vertical-chart-language-card-layout)
    - [Pie Chart Language Card Layout](#pie-chart-language-card-layout)
    - [Hide Progress Bars](#hide-progress-bars)
    - [Change format of language's stats](#change-format-of-languages-stats)
    - [Demo](#demo-2)
- [WakaTime Stats Card](#wakatime-stats-card)
    - [Options](#options-3)
    - [Demo](#demo-3)
- [All Demos](#all-demos)
  - [Quick Tip (Align The Cards)](#quick-tip-align-the-cards)
    - [Stats and top languages cards](#stats-and-top-languages-cards)
    - [Pinning repositories](#pinning-repositories)
- [Deploy on your own](#deploy-on-your-own)
  - [Self-hosted (Vercel/Other) (Recommended)](#self-hosted-vercelother-recommended)
    - [First step: get your Personal Access Token (PAT)](#first-step-get-your-personal-access-token-pat)
    - [On Vercel](#on-vercel)
    - [Available environment variables](#available-environment-variables)
  - [Keep your fork up to date](#keep-your-fork-up-to-date)
</details>


# GitLab Stats Card

Copy and paste this into your markdown, and that's it. Simple!

Change the `?username=` value to your GitHub username.

```md
[![str1k3r's GitLab stats](https://gitlab-stats.str1k3r.xyz/api?username=S1l3ntStr1ke87)](https://github.com/S1l3ntStr1ke87/gitlab-readme-stats)
```

> [!WARNING]
> By default, the stats card only shows statistics like stars, commits, and pull requests from public repositories. To show private statistics on the stats card, you should [deploy your own instance](#deploy-on-your-own) using your own GitLab API token.

> [!NOTE]
> Available ranks are S (top 1%), A+ (12.5%), A (25%), A- (37.5%), B+ (50%), B (62.5%), B- (75%), C+ (87.5%) and C (everyone). This ranking scheme is based on the [Japanese academic grading](https://wikipedia.org/wiki/Academic_grading_in_Japan) system. The global percentile is calculated as a weighted sum of percentiles for each statistic (number of commits, pull requests, reviews, issues, stars, and followers), based on the cumulative distribution function of the [exponential](https://wikipedia.org/wiki/exponential_distribution) and the [log-normal](https://wikipedia.org/wiki/Log-normal_distribution) distributions. The implementation can be investigated at [src/utils/calculateRank.ts](https://github.com/S1l3ntStr1ke87/gitlab-readme-stats/blob/main/src/utils/calculateRank.ts). The circle around the rank shows 100 minus the global percentile.

Inspired by [gitlab-readme-stats](https://gitlab.com/oregand/gitlab-readme-stats) & [github-readme-stats](https://github.com/anuraghazra/github-readme-stats/)

Made with ❤️ and TypeScript.
