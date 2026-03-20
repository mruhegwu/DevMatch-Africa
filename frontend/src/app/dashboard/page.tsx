'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProfileCard from '@/components/ProfileCard';
import RepoCard from '@/components/RepoCard';
import TaskCard from '@/components/TaskCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getProfile, getRecommendedTasks, applyToTask, UserProfile, Task } from '@/lib/api';
import { Loader2, RefreshCw, Briefcase, BookOpen, ArrowRight, Share2, Check } from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const FRONTEND_URL =
  typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check auth and load data
    const load = async () => {
      try {
        const [userProfile, recommended] = await Promise.all([
          getProfile(),
          getRecommendedTasks(),
        ]);
        setProfile(userProfile);
        setTasks(recommended);
      } catch {
        // Not authenticated — redirect to login
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  const handleApply = async (taskId: string) => {
    setApplyingId(taskId);
    setError(null);
    try {
      await applyToTask(taskId);
      // Refresh recommended tasks to update applied status
      const updated = await getRecommendedTasks();
      setTasks(updated);
      setSuccessMsg('Application submitted successfully! 🎉');
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

  const handleShareProfile = () => {
    if (!profile) return;
    const url = `${FRONTEND_URL}/profile/${profile.username}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const appliedCount = profile.applications.length;
  const pendingCount = profile.applications.filter(
    (a) => a.status === 'pending'
  ).length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        username={profile.username}
        avatar={profile.avatar || undefined}
        showDashboard
      />

      <div className="container mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">
            Welcome back, {profile.username}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s your developer dashboard
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

        <div className="grid lg:grid-cols-3 gap-6">
          {/* ─── Left column: Profile ─────────────────────────────────────── */}
          <div className="lg:col-span-1 space-y-6">
            <ProfileCard user={profile} />

            {/* Application stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Applications
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-2xl font-bold text-primary">{appliedCount}</p>
                  <p className="text-xs text-muted-foreground">Total Applied</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </CardContent>
            </Card>

            {/* Action buttons */}
            <div className="space-y-2">
              {/* Share public profile */}
              <Button
                variant="outline"
                className="w-full gap-2"
                size="sm"
                onClick={handleShareProfile}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-500" />
                    Link copied!
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4" />
                    Share Portfolio
                  </>
                )}
              </Button>

              {/* View public profile */}
              <Link href={`/profile/${profile.username}`} target="_blank">
                <Button variant="ghost" className="w-full gap-2" size="sm">
                  <ArrowRight className="h-4 w-4" />
                  View Public Profile
                </Button>
              </Link>

              {/* Refresh GitHub data */}
              <a href={`${API_URL}/auth/github`}>
                <Button variant="ghost" className="w-full gap-2" size="sm">
                  <RefreshCw className="h-4 w-4" />
                  Refresh GitHub Profile
                </Button>
              </a>
            </div>
          </div>

          {/* ─── Right column: Repos + Tasks ──────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Top Repositories */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Top Repositories
                </h2>
                <Badge variant="secondary" className="text-xs">
                  {profile.repositories.length} total
                </Badge>
              </div>
              {profile.repositories.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    No repositories found. Push some code to GitHub!
                  </CardContent>
                </Card>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {profile.repositories.slice(0, 6).map((repo) => (
                    <RepoCard key={repo.id} repo={repo} />
                  ))}
                </div>
              )}
            </div>

            {/* Recommended Tasks (AI-matched) */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Recommended for You
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Matched to your skills and languages
                  </p>
                </div>
                <Link href="/tasks">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">
                    Browse all <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>

              {tasks.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    No tasks available yet. Check back soon!
                  </CardContent>
                </Card>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tasks.map((task) => (
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

            {/* Recent Applications */}
            {profile.applications.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Recent Applications</h2>
                  <Link href="/applications">
                    <Button variant="ghost" size="sm" className="gap-1 text-xs">
                      View all <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
                <div className="space-y-2">
                  {profile.applications.slice(0, 5).map((app) => (
                    <Card key={app.id}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{app.task.title}</p>
                          <p className="text-xs text-muted-foreground">
                            ${app.task.budget.toLocaleString()} budget
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            app.status === 'accepted'
                              ? 'bg-green-100 text-green-700 border-green-200'
                              : app.status === 'rejected'
                              ? 'bg-red-100 text-red-700 border-red-200'
                              : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                          }
                        >
                          {app.status}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
