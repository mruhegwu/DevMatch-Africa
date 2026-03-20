import axios from 'axios';

interface GitHubRepo {
  name: string;
  stargazers_count: number;
  language: string | null;
  html_url: string;
  pushed_at: string;
  fork: boolean;
}

interface GitHubUser {
  login: string;
  avatar_url: string;
  email: string | null;
  name: string | null;
  public_repos: number;
  followers: number;
  following: number;
}

export interface FetchedRepo {
  name: string;
  stars: number;
  language: string | null;
  url: string;
  pushedAt: string;
}

export interface GitHubProfile {
  login: string;
  avatar: string;
  email: string | null;
  name: string | null;
  publicRepos: number;
  followers: number;
  repos: FetchedRepo[];
  languages: string[];
}

// Fetch GitHub user profile and top repositories using their OAuth access token
export async function fetchGitHubProfile(
  accessToken: string
): Promise<GitHubProfile> {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/vnd.github.v3+json',
  };

  // Fetch user profile
  const userRes = await axios.get<GitHubUser>('https://api.github.com/user', {
    headers,
  });
  const user = userRes.data;

  // Fetch user repositories (up to 100, sorted by most recently pushed)
  const reposRes = await axios.get<GitHubRepo[]>(
    'https://api.github.com/user/repos?per_page=100&sort=pushed',
    { headers }
  );

  // Filter out forks and map to our structure
  const repos: FetchedRepo[] = reposRes.data
    .filter((repo) => !repo.fork)
    .map((repo) => ({
      name: repo.name,
      stars: repo.stargazers_count,
      language: repo.language,
      url: repo.html_url,
      pushedAt: repo.pushed_at,
    }));

  // Extract unique languages
  const languages = [
    ...new Set(repos.map((r) => r.language).filter(Boolean) as string[]),
  ];

  return {
    login: user.login,
    avatar: user.avatar_url,
    email: user.email,
    name: user.name,
    publicRepos: user.public_repos,
    followers: user.followers,
    repos,
    languages,
  };
}
