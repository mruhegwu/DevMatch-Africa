'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Github, AlertCircle, Code2, Star, Zap } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const errorMessages: Record<string, string> = {
  no_code: 'GitHub authorization was cancelled. Please try again.',
  token_exchange_failed: 'Could not connect to GitHub. Please try again.',
  auth_failed: 'Authentication failed. Please try again.',
};

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  useEffect(() => {
    // If already logged in, redirect to dashboard
    fetch(`${API_URL}/auth/me`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated) {
          router.push('/dashboard');
        }
      })
      .catch(() => {});
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-extrabold text-xl mb-4 shadow-lg">
            DM
          </div>
          <h1 className="text-2xl font-bold">DevMatch Africa</h1>
          <p className="text-muted-foreground mt-1">AI-powered developer matching</p>
        </div>

        {/* Error alert */}
        {error && errorMessages[error] && (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>{errorMessages[error]}</p>
          </div>
        )}

        <Card className="shadow-lg border-muted/60">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription>
              Sign in to access your developer dashboard and apply to paid tasks.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {/* GitHub OAuth button */}
            <a href={`${API_URL}/auth/github`} className="block w-full">
              <Button className="w-full gap-2 text-base h-11" size="lg">
                <Github className="h-5 w-5" />
                Continue with GitHub
              </Button>
            </a>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  What you&apos;ll get
                </span>
              </div>
            </div>

            {/* Benefits list */}
            <div className="space-y-3">
              {[
                { icon: Code2, text: 'AI-generated developer profile from your repos' },
                { icon: Star, text: 'Skill score based on your GitHub activity' },
                { icon: Zap, text: 'Matched to paid tasks that fit your skills' },
              ].map((benefit) => (
                <div key={benefit.text} className="flex items-center gap-3 text-sm">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <benefit.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-muted-foreground">{benefit.text}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-center text-muted-foreground pt-2">
              By signing in, you agree to our Terms of Service and Privacy Policy.
              We only request read-only access to your public GitHub data.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
