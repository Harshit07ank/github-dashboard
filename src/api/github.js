/**
 * github.js
 *
 * Sole responsibility: fetch GitHub data via GraphQL.
 * Returns one clean stats object — NEVER generates SVG.
 */

import fetch from 'node-fetch';


// ── Public API ────────────────────────────────────────────────

/**
 * Fetch all GitHub statistics for a user.
 *
 * @param {string} username - GitHub username
 * @param {string} token    - GitHub PAT with read:user scope
 * @returns {Promise<object>} Stats object consumed by generators
 */
export async function fetchGitHubStats(username, token) {
  const [contribData, repoData] = await Promise.all([
    queryContributions(username, token),
    queryRepositories(username, token),
  ]);

  const weeks = extractWeeks(contribData);
  const allDays = weeks.flatMap(w => w.contributionDays);

  const totalContributions = contribData.contributionsCollection.contributionCalendar.totalContributions;
  const weeklyContributions = weeks.map((w, i) => ({
    week: i,
    count: w.contributionDays.reduce((sum, d) => sum + d.contributionCount, 0),
  }));

  const { currentStreak, longestStreak } = computeStreaks(allDays);
  const activeDays = allDays.filter(d => d.contributionCount > 0).length;
  const bestWeek = computeBestWeek(weeklyContributions);

  const languages = aggregateLanguages(repoData);
  const repositories = repoData.repositories.nodes.length;

  return {
    totalContributions,
    currentStreak,
    longestStreak,
    activeDays,
    bestWeek,
    languages,
    weeklyContributions,
    repositories,
  };
}


// ── GraphQL queries ───────────────────────────────────────────

const CONTRIB_QUERY = `
query($username: String!) {
  user(login: $username) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            contributionCount
            date
          }
        }
      }
    }
  }
}`;

const REPO_QUERY = `
query($username: String!) {
  user(login: $username) {
    repositories(
      first: 100
      ownerAffiliations: OWNER
      orderBy: { field: STARGAZERS, direction: DESC }
      isFork: false
    ) {
      nodes {
        name
        languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
          edges {
            size
            node {
              name
              color
            }
          }
        }
      }
    }
  }
}`;


// ── Query execution ───────────────────────────────────────────

async function graphql(query, variables, token) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'github-stats-svg-generator',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub API ${res.status}: ${body}`);
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
  }

  return json.data.user;
}

async function queryContributions(username, token) {
  return graphql(CONTRIB_QUERY, { username }, token);
}

async function queryRepositories(username, token) {
  return graphql(REPO_QUERY, { username }, token);
}


// ── Data transforms ───────────────────────────────────────────

function extractWeeks(data) {
  return data.contributionsCollection.contributionCalendar.weeks;
}

/**
 * Compute current and longest contribution streaks.
 * A "streak" is consecutive days with ≥1 contribution.
 */
function computeStreaks(days) {
  let currentCount = 0;
  let currentStart = null;
  let currentEnd = null;

  let longestCount = 0;
  let longestStart = null;
  let longestEnd = null;

  let runCount = 0;
  let runStart = null;

  for (const day of days) {
    if (day.contributionCount > 0) {
      if (runCount === 0) runStart = day.date;
      runCount++;

      if (runCount > longestCount) {
        longestCount = runCount;
        longestStart = runStart;
        longestEnd = day.date;
      }
    } else {
      runCount = 0;
      runStart = null;
    }
  }

  // Current streak: check from the end backwards
  // Allow today to have 0 contributions (day not over yet)
  const today = new Date().toISOString().split('T')[0];
  let i = days.length - 1;

  // If today has 0 contributions, start from yesterday
  if (i >= 0 && days[i].date === today && days[i].contributionCount === 0) {
    i--;
  }

  while (i >= 0 && days[i].contributionCount > 0) {
    currentCount++;
    currentEnd = currentEnd ?? days[i].date;
    currentStart = days[i].date;
    i--;
  }

  return {
    currentStreak: { count: currentCount, startDate: currentStart, endDate: currentEnd },
    longestStreak: { count: longestCount, startDate: longestStart, endDate: longestEnd },
  };
}

/**
 * Find the week with the most contributions.
 */
function computeBestWeek(weeklyContributions) {
  let best = { count: 0, week: 0 };
  for (const w of weeklyContributions) {
    if (w.count > best.count) {
      best = { count: w.count, week: w.week };
    }
  }
  return best;
}

/**
 * Aggregate language usage across all repositories.
 * Returns sorted array: [{ name, percentage, bytes, repos, color }]
 */
function aggregateLanguages(data) {
  const langMap = new Map();

  for (const repo of data.repositories.nodes) {
    const seen = new Set(); // count each language once per repo
    for (const edge of repo.languages.edges) {
      const name = edge.node.name;
      const color = edge.node.color || '#8b949e';

      if (!langMap.has(name)) {
        langMap.set(name, { name, bytes: 0, repos: 0, color });
      }

      const entry = langMap.get(name);
      entry.bytes += edge.size;

      if (!seen.has(name)) {
        entry.repos++;
        seen.add(name);
      }
    }
  }

  const totalBytes = [...langMap.values()].reduce((sum, l) => sum + l.bytes, 0);
  const sorted = [...langMap.values()]
    .sort((a, b) => b.bytes - a.bytes)
    .map(l => ({
      ...l,
      percentage: totalBytes > 0
        ? Math.round((l.bytes / totalBytes) * 1000) / 10
        : 0,
    }));

  return sorted;
}
