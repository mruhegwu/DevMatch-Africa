import OpenAI from 'openai';
import { FetchedRepo } from './githubService';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface AIProfile {
  bio: string;
  skillsSummary: string;
  projectHighlights: string;
}

// Generate an AI-powered developer profile using OpenAI
export async function generateAIProfile(
  username: string,
  repos: FetchedRepo[],
  languages: string[],
  skillScore: number
): Promise<AIProfile> {
  // Prepare a concise summary of the developer's repos for the prompt
  const topRepos = repos
    .sort((a, b) => b.stars - a.stars)
    .slice(0, 5)
    .map((r) => `- ${r.name} (${r.language || 'Unknown'}, ⭐ ${r.stars})`)
    .join('\n');

  const prompt = `You are analyzing a GitHub developer profile for DevMatch Africa, a platform that matches African developers to paid tasks.

Developer: ${username}
Skill Score: ${skillScore}/100
Languages: ${languages.join(', ') || 'Not specified'}
Top Repositories:
${topRepos || 'No repositories found'}

Generate a professional developer profile in JSON format with these fields:
- bio: A 2-3 sentence professional bio (first person, enthusiastic, highlighting their strengths)
- skillsSummary: A concise comma-separated list of their top skills and technologies
- projectHighlights: A 1-2 sentence highlight of their most impressive projects

Return ONLY valid JSON, no markdown or extra text.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    const parsed = JSON.parse(content) as AIProfile;
    return parsed;
  } catch (error) {
    // Fallback profile if AI generation fails
    console.error('AI profile generation failed, using fallback:', error);
    return {
      bio: `${username} is a developer with ${repos.length} public repositories on GitHub, working with ${languages.slice(0, 3).join(', ') || 'various technologies'}.`,
      skillsSummary: languages.slice(0, 6).join(', ') || 'Software Development',
      projectHighlights: `Notable projects include: ${repos.slice(0, 3).map((r) => r.name).join(', ') || 'various projects'}.`,
    };
  }
}
