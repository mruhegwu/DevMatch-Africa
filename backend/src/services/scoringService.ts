import { FetchedRepo } from './githubService';

interface SkillScore {
  score: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  breakdown: {
    repoScore: number;
    starScore: number;
    languageScore: number;
    activityScore: number;
  };
}

// Calculate developer skill score (0–100) based on GitHub activity
export function calculateSkillScore(
  repos: FetchedRepo[],
  languages: string[],
  followers: number
): SkillScore {
  // 1. Repo count score (max 25 points)
  // 10+ repos = full marks; scales linearly below that
  const repoScore = Math.min(25, (repos.length / 10) * 25);

  // 2. Stars score (max 25 points)
  // Total stars across all repos
  const totalStars = repos.reduce((sum, r) => sum + r.stars, 0);
  const starScore = Math.min(25, (totalStars / 50) * 25);

  // 3. Language diversity score (max 25 points)
  // 5+ languages = full marks
  const languageScore = Math.min(25, (languages.length / 5) * 25);

  // 4. Activity score (max 25 points)
  // Based on how recently repos were pushed (last 6 months = active)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const activeRepos = repos.filter(
    (r) => new Date(r.pushedAt) > sixMonthsAgo
  ).length;
  const activityScore = Math.min(25, (activeRepos / Math.max(repos.length, 1)) * 25);

  const rawScore = repoScore + starScore + languageScore + activityScore;
  const score = Math.round(Math.min(100, rawScore));

  // Determine skill level based on score
  let level: 'Beginner' | 'Intermediate' | 'Advanced';
  if (score >= 70) {
    level = 'Advanced';
  } else if (score >= 40) {
    level = 'Intermediate';
  } else {
    level = 'Beginner';
  }

  return {
    score,
    level,
    breakdown: {
      repoScore: Math.round(repoScore),
      starScore: Math.round(starScore),
      languageScore: Math.round(languageScore),
      activityScore: Math.round(activityScore),
    },
  };
}
