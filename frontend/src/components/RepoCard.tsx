'use client';

import { Repository } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, ExternalLink } from 'lucide-react';

interface RepoCardProps {
  repo: Repository;
}

// Language color map (common languages)
const langColors: Record<string, string> = {
  JavaScript: 'bg-yellow-100 text-yellow-700',
  TypeScript: 'bg-blue-100 text-blue-700',
  Python: 'bg-green-100 text-green-700',
  Rust: 'bg-orange-100 text-orange-700',
  Go: 'bg-cyan-100 text-cyan-700',
  Java: 'bg-red-100 text-red-700',
  'C++': 'bg-pink-100 text-pink-700',
  C: 'bg-gray-100 text-gray-700',
  Ruby: 'bg-rose-100 text-rose-700',
  PHP: 'bg-indigo-100 text-indigo-700',
  Swift: 'bg-orange-100 text-orange-700',
  Kotlin: 'bg-purple-100 text-purple-700',
  Solidity: 'bg-gray-100 text-gray-700',
  Shell: 'bg-slate-100 text-slate-700',
  HTML: 'bg-orange-100 text-orange-700',
  CSS: 'bg-blue-100 text-blue-700',
};

export default function RepoCard({ repo }: RepoCardProps) {
  const langClass = repo.language
    ? langColors[repo.language] || 'bg-gray-100 text-gray-700'
    : '';

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium truncate">{repo.name}</p>
              {repo.url && (
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground shrink-0"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
            {repo.language && (
              <Badge
                className={`mt-1.5 text-xs border-0 ${langClass}`}
                variant="outline"
              >
                {repo.language}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 text-muted-foreground shrink-0">
            <Star className="h-3.5 w-3.5 text-yellow-500" />
            <span className="text-xs font-medium">{repo.stars}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
