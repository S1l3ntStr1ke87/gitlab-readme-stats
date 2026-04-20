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

- [GitLab Stats Card](#gitlab-stats-card)
    - [Showing icons](#showing-icons)
    - [Themes](#themes)
    - [Customization](#customization)
      - [Common Options](#common-options)
        - [Gradient in bg\_color](#gradient-in-bg_color)
        - [Available locales](#available-locales)
- [GitLab Pins](#gitlab-pins)
    - [Usage](#usage)
    - [Options](#options)
    - [Demo](#demo)
- [GitHub Snippet Pins](#github-snippet-pins)
    - [Usage](#usage-1)
    - [Options](#options-1)
    - [Demo](#demo-1)
- [Top Languages Card](#top-languages-card)
    - [Usage](#usage-2)
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

### Showing icons

To enable icons, you can pass `&show_icons=true` in the query param, like so:

```md
![str1k3r's GitLab stats](https://gitlab-stats.str1k3r.xyz/api?username=S1l3ntStr1ke87&show_icons=true)
```

### Themes

With inbuilt themes, you can customize the look of the card without doing any [manual customization](#customization).

Use `&theme=THEME_NAME` parameter like so :

```md
![str1k3r's GitLab stats](https://gitlab-stats.str1k3r.xyz/api?username=S1l3ntStr1ke87&show_icons=true&theme=radical)
```

### Customization

You can customize the appearance of all your cards however you wish with URL parameters.

#### Common Options

| Name | Description | Type | Default value |
| --- | --- | --- | --- |
| `title_color` | Card's title color. | string (hex color) | `2f80ed` |
| `text_color` | Body text color. | string (hex color) | `434d58` |
| `icon_color` | Icons color if available. | string (hex color) | `4c71f2` |
| `border_color` | Card's border color. Does not apply when `hide_border` is enabled. | string (hex color) | `e4e2e2` |
| `bg_color` | Card's background color. | string (hex color or a gradient in the form of *angle,start,end*) | `fffefe` |
| `hide_border` | Hides the card's border. | boolean | `false` |
| `theme` | Name of the theme, choose from [all available themes](themes/README.md). | enum | `default` |
| `cache_seconds` | Sets the cache header manually (min: 21600, max: 86400). | integer | `21600` |
| `locale` | Sets the language in the card, you can check full list of available locales [here](#available-locales). | enum | `en` |
| `border_radius` | Corner rounding on the card. | number | `4.5` |

> [!WARNING]
> I use caching to decrease the load on my server. 24 Hours

##### Gradient in bg\_color

You can provide multiple comma-separated values in the bg\_color option to render a gradient with the following format:

    &bg_color=DEG,COLOR1,COLOR2,COLOR3...COLOR10

##### Available locales

Here is a list of all available locales:

<table>
<tr><td>

| Code | Locale |
| --- | --- |
| `ar` | Arabic |
| `az` | Azerbaijani |
| `bn` | Bengali |
| `bg` | Bulgarian |
| `my` | Burmese |
| `ca` | Catalan |
| `cn` | Chinese |
| `zh-tw` | Chinese (Taiwan) |
| `cs` | Czech |
| `nl` | Dutch |
| `en` | English |
| `fil` | Filipino |
| `fi` | Finnish |
| `fr` | French |
| `de` | German |
| `el` | Greek |

</td><td>

| Code | Locale |
| --- | --- |
| `he` | Hebrew |
| `hi` | Hindi |
| `hu` | Hungarian |
| `id` | Indonesian |
| `it` | Italian |
| `ja` | Japanese |
| `kr` | Korean |
| `ml` | Malayalam |
| `np` | Nepali |
| `no` | Norwegian |
| `fa` | Persian (Farsi) |
| `pl` | Polish |
| `pt-br` | Portuguese (Brazil) |
| `pt-pt` | Portuguese (Portugal) |
| `ro` | Romanian |

</td><td>

| Code | Locale |
| --- | --- |
| `ru` | Russian |
| `sa` | Sanskrit |
| `sr` | Serbian (Cyrillic) |
| `sr-latn` | Serbian (Latin) |
| `sk` | Slovak |
| `es` | Spanish |
| `sw` | Swahili |
| `se` | Swedish |
| `ta` | Tamil |
| `th` | Thai |
| `tr` | Turkish |
| `uk-ua` | Ukrainian |
| `ur` | Urdu |
| `uz` | Uzbek |
| `vi` | Vietnamese |

</td></tr>
</table>

If we don't support your language, please consider contributing

# GitLab Pins

GitLab Pins allow you to pin repositories in your profile using a GitHub readme profile.

### Usage

Copy-paste this code into your readme and change the links.

Endpoint: `api/pin?username=S1l3ntStr1ke87&repo=gitlab-readme-stats-example`

```md
[![Readme Card](https://gitlab-stats.str1k3r.xyz/api/pin/?username=S1l3ntStr1ke87&repo=gitlab-readme-stats-example)](https://github.com/S1l3ntStr1ke87/gitlab-readme-stats)
```

### Options

You can customize the appearance and behavior of the pinned repository card using the [common options](#common-options) and exclusive options listed in the table below.

| Name | Description | Type | Default value |
| --- | --- | --- | --- |
| `show_owner` | Shows the repo's owner name. | boolean | `false` |
| `description_lines_count` | Manually set the number of lines for the description. Specified value will be clamped between 1 and 3. If this parameter is not specified, the number of lines will be automatically adjusted according to the actual length of the description. | number | `null` |

### Demo

![Readme Card](https://gitlab-stats.str1k3r.xyz/api/pin/?username=S1l3ntStr1ke87\&repo=gitlab-readme-stats-example)

Use `show_owner` query option to include the repo's owner username

![Readme Card](https://gitlab-stats.str1k3r.xyz/api/pin/?username=S1l3ntStr1ke87\&repo=gitlab-readme-stats-example\&show_owner=true)

# GitHub Snippet Pins

GitHub Snippet pins allow you to pin snippets in your GitHub profile using a GitHub readme profile.

### Usage

Copy-paste this code into your readme and change the links.

Endpoint: `api/snippets?id=5982226`

```md
[![Snippet Card](https://gitlab-stats.str1k3r.xyz/api/snippets?id=5982226)](https://gitlab.com/-/snippets/5982226)
```

### Options

You can customize the appearance and behavior of the snippet card using the [common options](#common-options) and exclusive options listed in the table below.

| Name | Description | Type | Default value |
| --- | --- | --- | --- |
| `show_owner` | Shows the snippet's owner name. | boolean | `false` |

### Demo

![Snippet Card](https://gitlab-stats.str1k3r.xyz/api/snippets?id=5982226)

Use `show_owner` query option to include the snippet's owner username

![Snippet Card](https://gitlab-stats.str1k3r.xyz/api/snippets?id=5982226\&show_owner=true)

# Top Languages Card

The top languages card shows a GitHub user's most frequently used languages.

> [!WARNING]
> By default, the language card shows language results only from public repositories. To include languages used in private repositories, you should [deploy your own instance](#deploy-on-your-own) using your own GitHub API token.

> [!NOTE]
> Top Languages does not indicate the user's skill level or anything like that; it's a GitLab metric to determine which languages have the most code.

### Usage

Copy-paste this code into your readme and change the links.

Endpoint: `api/top-langs?username=S1l3ntStr1ke87`

```md
[![Top Langs](https://gitlab-stats.str1k3r.xyz/api/top-langs/?username=S1l3ntStr1ke87)](https://github.com/S1l3ntStr1ke87/gitlab-readme-stats)
```

### Exclude individual repositories

You can use the `&exclude_repo=repo1,repo2` parameter to exclude individual repositories.

```md
![Top Langs](https://gitlab-stats.str1k3r.xyz/api/top-langs/?username=S1l3ntStr1ke87&exclude_repo=github-readme-stats-example)
```

### Hide individual languages

You can use `&hide=language1,language2` parameter to hide individual languages.

```md
![Top Langs](https://gitlab-stats.str1k3r.xyz/api/top-langs/?username=S1l3ntStr1ke87&hide=typescript)
```

### Show more languages

You can use the `&langs_count=` option to increase or decrease the number of languages shown on the card. Valid values are integers between 1 and 20 (inclusive). By default it was set to `5` for `normal` & `donut` and `6` for other layouts.

```md
![Top Langs](https://gitlab-stats.str1k3r.xyz/api/top-langs/?username=S1l3ntStr1ke87&langs_count=8)
```

### Compact Language Card Layout

You can use the `&layout=compact` option to change the card design.

```md
![Top Langs](https://gitlab-stats.str1k3r.xyz/api/top-langs/?username=S1l3ntStr1ke87&layout=compact)
```

### Donut Chart Language Card Layout

You can use the `&layout=donut` option to change the card design.

```md
[![Top Langs](https://gitlab-stats.str1k3r.xyz/api/top-langs/?username=S1l3ntStr1ke87&layout=donut)](https://github.com/S1l3ntStr1ke87/gitlab-readme-stats)
```

### Donut Vertical Chart Language Card Layout

You can use the `&layout=donut-vertical` option to change the card design.

```md
[![Top Langs](https://gitlab-stats.str1k3r.xyz/api/top-langs/?username=S1l3ntStr1ke87&layout=donut-vertical)](https://github.com/S1l3ntStr1ke87/gitlab-readme-stats)
```

### Pie Chart Language Card Layout

You can use the `&layout=pie` option to change the card design.

```md
[![Top Langs](https://gitlab-stats.str1k3r.xyz/api/top-langs/?username=S1l3ntStr1ke87&layout=pie)](https://github.com/S1l3ntStr1ke87/gitlab-readme-stats)
```

### Hide Progress Bars

You can use the `&hide_progress=true` option to hide the percentages and the progress bars (layout will be automatically set to `compact`).

```md
![Top Langs](https://gitlab-stats.str1k3r.xyz/api/top-langs/?username=S1l3ntStr1ke87&hide_progress=true)
```

### Change format of language's stats

You can use the `&stats_format=bytes` option to display the stats in bytes instead of percentage.

```md
![Top Langs](https://gitlab-stats.str1k3r.xyz/api/top-langs/?username=S1l3ntStr1ke87&stats_format=bytes)
```


### Demo

![Top Langs](https://gitlab-stats.str1k3r.xyz/api/top-langs/?username=S1l3ntStr1ke87)

*   Compact layout

![Top Langs](https://gitlab-stats.str1k3r.xyz/api/top-langs/?username=S1l3ntStr1ke87\&layout=compact)

*   Donut Chart layout

[![Top Langs](https://gitlab-stats.str1k3r.xyz/api/top-langs/?username=S1l3ntStr1ke87\&layout=donut)](https://github.com/S1l3ntStr1ke87/gitlab-readme-stats)

*   Donut Vertical Chart layout

[![Top Langs](https://gitlab-stats.str1k3r.xyz/api/top-langs/?username=S1l3ntStr1ke87\&layout=donut-vertical)](https://github.com/S1l3ntStr1ke87/gitlab-readme-stats)

*   Pie Chart layout

[![Top Langs](https://gitlab-stats.str1k3r.xyz/api/top-langs/?username=S1l3ntStr1ke87\&layout=pie)](https://github.com/S1l3ntStr1ke87/gitlab-readme-stats)

*   Hidden progress bars

![Top Langs](https://gitlab-stats.str1k3r.xyz/api/top-langs/?username=S1l3ntStr1ke87\&hide_progress=true)


*  Display bytes instead of percentage

![Top Langs](https://gitlab-stats.str1k3r.xyz/api/top-langs/?username=S1l3ntStr1ke87\&stats_format=bytes)

Inspired by [gitlab-readme-stats](https://gitlab.com/oregand/gitlab-readme-stats) & [github-readme-stats](https://github.com/S1l3ntStr1ke87/gitlab-readme-stats/)

Made with ❤️ and TypeScript.
