import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Star,
  Code2,
  GitFork,
  Trophy,
  ExternalLink,
  Calendar,
  ArrowLeft,
} from 'lucide-react';

interface Props {
  params: Promise<{ username: string }>;
}

interface PublicProfile {
  id: string;
  username: string;
  avatar: string | null;
  bio: string | null;
  skillScore: number;
  skillLevel: string;
  createdAt: string;
  languages: string[];
  totalStars: number;
  repositories: {
    id: string;
    name: string;
    stars: number;
    language: string | null;
    url: string | null;
  }[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Fetch profile server-side for SSR/SSG (good for SEO and link previews)
async function fetchProfile(username: string): Promise<PublicProfile | null> {
  try {
    const res = await fetch(`${API_BASE}/profile/${encodeURIComponent(username)}`, {
      next: { revalidate: 60 }, // revalidate every 60s
    });
    if (!res.ok) return null;
    return res.json() as Promise<PublicProfile>;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const profile = await fetchProfile(username);
  if (!profile) {
    return { title: 'Developer Not Found — DevMatch Africa' };
  }
  return {
    title: `${profile.username} — DevMatch Africa Developer`,
    description:
      profile.bio ||
      `${profile.username} is a ${profile.skillLevel} developer on DevMatch Africa with a skill score of ${profile.skillScore}/100.`,
    openGraph: {
      title: `${profile.username} on DevMatch Africa`,
      description:
        profile.bio ||
        `${profile.skillLevel} developer · Score ${profile.skillScore}/100`,
      images: profile.avatar ? [{ url: profile.avatar }] : [],
    },
  };
}

// Skill level color map
const levelColors: Record<string, string> = {
  Beginner: 'bg-blue-100 text-blue-700 border-blue-200',
  Intermediate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Advanced: 'bg-green-100 text-green-700 border-green-200',
};

// Language background colors (mirrors RepoCard)
const langColors: Record<string, string> = {
  JavaScript: 'bg-yellow-100 text-yellow-700',
  TypeScript: 'bg-blue-100 text-blue-700',
  Python: 'bg-green-100 text-green-700',
  Rust: 'bg-orange-100 text-orange-700',
  Go: 'bg-cyan-100 text-cyan-700',
  Java: 'bg-red-100 text-red-700',
  'C++': 'bg-pink-100 text-pink-700',
  Ruby: 'bg-rose-100 text-rose-700',
  PHP: 'bg-indigo-100 text-indigo-700',
  Swift: 'bg-orange-100 text-orange-700',
  Kotlin: 'bg-purple-100 text-purple-700',
  Solidity: 'bg-gray-100 text-gray-700',
  HTML: 'bg-orange-100 text-orange-700',
  CSS: 'bg-blue-100 text-blue-700',
};

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const profile = await fetchProfile(username);

  if (!profile) {
    notFound();
  }

  const joinedYear = new Date(profile.createdAt).getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-indigo-50">
      {/* ─── Simple top bar ─────────────────────────────────────────────── */}
      <nav className="border-b bg-background/80 backdrop-blur">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs">
              DM
            </div>
            <span className="font-bold hidden sm:block">DevMatch Africa</span>
          </Link>
          <Link href="/login">
            <Button size="sm" variant="outline">
              Sign in
            </Button>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-10 max-w-4xl">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to DevMatch Africa
        </Link>

        {/* ─── Hero card ──────────────────────────────────────────────────── */}
        <Card className="mb-6 shadow-md">
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start gap-5">
              {/* Avatar */}
              <Avatar className="h-20 w-20 border-4 border-primary/10 shrink-0">
                <AvatarImage src={profile.avatar || undefined} alt={profile.username} />
                <AvatarFallback className="text-2xl font-bold">
                  {profile.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                {/* Name + level */}
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <h1 className="text-2xl font-bold">{profile.username}</h1>
                  <Badge
                    className={`text-xs border ${levelColors[profile.skillLevel] || levelColors.Beginner}`}
                    variant="outline"
                  >
                    {profile.skillLevel}
                  </Badge>
                </div>

                {/* Bio */}
                {profile.bio && (
                  <p className="text-muted-foreground text-sm leading-relaxed mt-1 mb-3">
                    {profile.bio}
                  </p>
                )}

                {/* Meta row */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Joined {joinedYear}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-yellow-500" />
                    {profile.totalStars} total stars
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork className="h-3.5 w-3.5" />
                    {profile.repositories.length} repos
                  </span>
                  <span className="flex items-center gap-1">
                    <Code2 className="h-3.5 w-3.5 text-blue-500" />
                    {profile.languages.length} languages
                  </span>
                </div>
              </div>

              {/* Skill score */}
              <div className="sm:text-right shrink-0 w-full sm:w-40">
                <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1">
                  <span className="text-sm font-medium flex items-center gap-1.5">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    Skill Score
                  </span>
                  <span className="text-3xl font-extrabold text-primary">
                    {profile.skillScore}
                    <span className="text-base text-muted-foreground font-normal">/100</span>
                  </span>
                </div>
                <Progress value={profile.skillScore} className="h-2 mt-2 hidden sm:block" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {/* ─── Languages ──────────────────────────────────────────────── */}
          <div className="md:col-span-1">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-primary" />
                  Languages
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile.languages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No languages detected.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.languages.map((lang) => (
                      <Badge
                        key={lang}
                        className={`text-xs border-0 ${langColors[lang] || 'bg-gray-100 text-gray-700'}`}
                        variant="outline"
                      >
                        {lang}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ─── Top repositories ───────────────────────────────────────── */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <GitFork className="h-4 w-4 text-primary" />
                  Top Repositories
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile.repositories.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No public repositories.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-2">
                    {profile.repositories.map((repo) => {
                      const langClass = repo.language
                        ? langColors[repo.language] || 'bg-gray-100 text-gray-700'
                        : '';
                      return (
                        <div
                          key={repo.id}
                          className="rounded-lg border p-3 hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm font-medium truncate">
                                  {repo.name}
                                </span>
                                {repo.url && (
                                  <a
                                    href={repo.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-muted-foreground hover:text-foreground shrink-0"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                )}
                              </div>
                              {repo.language && (
                                <Badge
                                  className={`mt-1 text-xs border-0 ${langClass}`}
                                  variant="outline"
                                >
                                  {repo.language}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0 text-muted-foreground">
                              <Star className="h-3.5 w-3.5 text-yellow-500" />
                              <span className="text-xs">{repo.stars}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ─── CTA footer ─────────────────────────────────────────────────── */}
        <div className="mt-8 rounded-xl border bg-primary/5 p-6 text-center">
          <p className="text-sm font-medium mb-1">Are you a developer too?</p>
          <p className="text-xs text-muted-foreground mb-4">
            Sign in with GitHub to build your own verified portfolio and get matched to paid tasks.
          </p>
          <Link href="/login">
            <Button size="sm" className="gap-2">
              Get started free
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
