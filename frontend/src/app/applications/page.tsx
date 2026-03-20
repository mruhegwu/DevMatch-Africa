'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  getProfile,
  withdrawApplication,
  UserProfile,
  ApplicationWithTask,
} from '@/lib/api';
import api from '@/lib/api';
import {
  Loader2,
  Briefcase,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';

// Fetch all applications (not just the 5 on the dashboard)
async function fetchApplications(): Promise<ApplicationWithTask[]> {
  const res = await api.get('/apply');
  return res.data;
}

const statusConfig: Record<
  string,
  { label: string; classes: string; Icon: typeof CheckCircle }
> = {
  pending: {
    label: 'Pending',
    classes: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    Icon: Clock,
  },
  accepted: {
    label: 'Accepted',
    classes: 'bg-green-100 text-green-700 border-green-200',
    Icon: CheckCircle,
  },
  rejected: {
    label: 'Rejected',
    classes: 'bg-red-100 text-red-700 border-red-200',
    Icon: XCircle,
  },
};

export default function ApplicationsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [applications, setApplications] = useState<ApplicationWithTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [userProfile, apps] = await Promise.all([
          getProfile(),
          fetchApplications(),
        ]);
        setProfile(userProfile);
        setApplications(apps);
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  const handleWithdraw = async (applicationId: string) => {
    setWithdrawingId(applicationId);
    setError(null);
    try {
      await withdrawApplication(applicationId);
      setApplications((prev) => prev.filter((a) => a.id !== applicationId));
      setSuccessMsg('Application withdrawn.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch {
      setError('Failed to withdraw application. Please try again.');
    } finally {
      setWithdrawingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-muted-foreground">Loading applications...</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const counts = {
    total: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    accepted: applications.filter((a) => a.status === 'accepted').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        username={profile.username}
        avatar={profile.avatar || undefined}
        showDashboard
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="h-6 w-6" />
            My Applications
          </h1>
          <p className="text-muted-foreground mt-1">
            Track the status of every task you&apos;ve applied to.
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

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Total', value: counts.total, color: 'text-foreground' },
            { label: 'Pending', value: counts.pending, color: 'text-yellow-600' },
            { label: 'Accepted', value: counts.accepted, color: 'text-green-600' },
            { label: 'Rejected', value: counts.rejected, color: 'text-red-500' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border bg-card p-4 text-center"
            >
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Application list */}
        {applications.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
            <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
            <p className="text-muted-foreground mb-6">
              Browse the task marketplace and apply to tasks that match your skills.
            </p>
            <Link href="/tasks">
              <Button>Browse Tasks</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => {
              const cfg = statusConfig[app.status] || statusConfig.pending;
              const Icon = cfg.Icon;

              return (
                <Card key={app.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      {/* Task info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm leading-snug">
                              {app.task.title}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                              {app.task.description}
                            </p>
                          </div>
                        </div>

                        {/* Skills + budget row */}
                        <div className="flex items-center gap-3 mt-3 flex-wrap">
                          <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                            <DollarSign className="h-3.5 w-3.5" />
                            {app.task.budget.toLocaleString()}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {app.task.skillsRequired.slice(0, 4).map((s) => (
                              <Badge
                                key={s}
                                variant="outline"
                                className="text-xs"
                              >
                                {s}
                              </Badge>
                            ))}
                            {app.task.skillsRequired.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{app.task.skillsRequired.length - 4}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground mt-2">
                          Applied{' '}
                          {new Date(app.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>

                      {/* Status + actions */}
                      <div className="flex flex-col items-end gap-3 shrink-0">
                        <Badge
                          className={`text-xs border flex items-center gap-1 ${cfg.classes}`}
                          variant="outline"
                        >
                          <Icon className="h-3 w-3" />
                          {cfg.label}
                        </Badge>

                        {/* Only allow withdrawal of pending applications */}
                        {app.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1"
                            onClick={() => handleWithdraw(app.id)}
                            disabled={withdrawingId === app.id}
                          >
                            {withdrawingId === app.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                            Withdraw
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
