'use client';

import { UserProfile } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Code2, Trophy, GitFork } from 'lucide-react';

interface ProfileCardProps {
  user: UserProfile;
}

// Maps skill level to a color scheme for visual feedback
const levelColors: Record<string, string> = {
  Beginner: 'bg-blue-100 text-blue-700 border-blue-200',
  Intermediate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Advanced: 'bg-green-100 text-green-700 border-green-200',
};

export default function ProfileCard({ user }: ProfileCardProps) {
  const topLanguages = [
    ...new Set(
      user.repositories
        .filter((r) => r.language)
        .map((r) => r.language as string)
    ),
  ].slice(0, 6);

  const totalStars = user.repositories.reduce((sum, r) => sum + r.stars, 0);

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        {/* Avatar + name */}
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarImage src={user.avatar || undefined} alt={user.username} />
            <AvatarFallback className="text-lg font-bold">
              {user.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-xl">{user.username}</CardTitle>
              <Badge
                className={`text-xs border ${levelColors[user.skillLevel] || levelColors.Beginner}`}
                variant="outline"
              >
                {user.skillLevel}
              </Badge>
            </div>
            {user.email && (
              <p className="text-sm text-muted-foreground mt-0.5">{user.email}</p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* AI-generated bio */}
        {user.bio && (
          <p className="text-sm text-muted-foreground leading-relaxed">{user.bio}</p>
        )}

        {/* Skill score */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium flex items-center gap-1.5">
              <Trophy className="h-4 w-4 text-yellow-500" />
              Skill Score
            </span>
            <span className="text-sm font-bold text-primary">{user.skillScore}/100</span>
          </div>
          <Progress value={user.skillScore} className="h-2" />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-muted/50 p-3">
            <GitFork className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
            <p className="text-lg font-bold">{user.repositories.length}</p>
            <p className="text-xs text-muted-foreground">Repos</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <Star className="h-4 w-4 mx-auto text-yellow-500 mb-1" />
            <p className="text-lg font-bold">{totalStars}</p>
            <p className="text-xs text-muted-foreground">Stars</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <Code2 className="h-4 w-4 mx-auto text-blue-500 mb-1" />
            <p className="text-lg font-bold">{topLanguages.length}</p>
            <p className="text-xs text-muted-foreground">Languages</p>
          </div>
        </div>

        {/* Top languages */}
        {topLanguages.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Top Languages</p>
            <div className="flex flex-wrap gap-1.5">
              {topLanguages.map((lang) => (
                <Badge key={lang} variant="secondary" className="text-xs">
                  {lang}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
