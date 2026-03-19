'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import TaskCard from '@/components/TaskCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getTasks, applyToTask, getProfile, Task, UserProfile } from '@/lib/api';
import { Loader2, Search, Filter, X } from 'lucide-react';

const COMMON_SKILLS = [
  'JavaScript',
  'TypeScript',
  'Python',
  'React',
  'Node.js',
  'Solidity',
  'Go',
  'Rust',
  'Java',
  'Docker',
];

function TasksContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string>(
    searchParams.get('skill') || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = async (skill?: string) => {
    try {
      const [allTasks, userProfile] = await Promise.all([
        getTasks(skill),
        getProfile(),
      ]);
      setTasks(allTasks);
      setProfile(userProfile);
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedSkill || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSkillFilter = (skill: string) => {
    const newSkill = selectedSkill === skill ? '' : skill;
    setSelectedSkill(newSkill);
    setLoading(true);
    loadData(newSkill || undefined);
  };

  const handleApply = async (taskId: string) => {
    setApplyingId(taskId);
    setError(null);
    try {
      await applyToTask(taskId);
      // Refresh tasks to show updated applied status
      await loadData(selectedSkill || undefined);
      setSuccessMsg('Application submitted! 🎉');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response &&
        err.response.data &&
        typeof err.response.data === 'object' &&
        'error' in err.response.data
      ) {
        setError((err.response.data as { error: string }).error);
      } else {
        setError('Failed to apply. Please try again.');
      }
    } finally {
      setApplyingId(null);
    }
  };

  // Client-side search filter
  const filteredTasks = tasks.filter((task) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      task.title.toLowerCase().includes(q) ||
      task.description.toLowerCase().includes(q) ||
      task.skillsRequired.some((s) => s.toLowerCase().includes(q))
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        username={profile?.username}
        avatar={profile?.avatar || undefined}
        showDashboard
      />

      <div className="container mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Task Marketplace</h1>
          <p className="text-muted-foreground mt-1">
            Browse paid tasks and apply with your verified developer profile.
          </p>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-700">
            {successMsg}
          </div>
        )}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tasks by title, skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Skill filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground shrink-0">Filter:</span>
            {COMMON_SKILLS.map((skill) => (
              <Badge
                key={skill}
                variant={selectedSkill === skill ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-primary/10 transition-colors text-xs"
                onClick={() => handleSkillFilter(skill)}
              >
                {skill}
              </Badge>
            ))}
            {selectedSkill && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7 px-2"
                onClick={() => handleSkillFilter(selectedSkill)}
              >
                Clear filter <X className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground mb-4">
          {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} found
          {selectedSkill && ` for "${selectedSkill}"`}
        </p>

        {/* Task grid */}
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
            <p className="text-muted-foreground mb-4">
              {selectedSkill
                ? `No tasks require "${selectedSkill}" skills right now.`
                : 'No tasks match your search.'}
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedSkill('');
                setSearchQuery('');
                loadData();
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onApply={handleApply}
                isApplying={applyingId === task.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <TasksContent />
    </Suspense>
  );
}
