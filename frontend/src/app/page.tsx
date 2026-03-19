import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import {
  Github,
  Zap,
  Target,
  TrendingUp,
  Code2,
  DollarSign,
  Users,
  Star,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

const features = [
  {
    icon: Github,
    title: 'GitHub Integration',
    description:
      'Sign in with GitHub and instantly import your repositories, stars, and activity.',
  },
  {
    icon: Zap,
    title: 'AI-Powered Profile',
    description:
      'Our AI analyzes your repos and generates a professional developer bio and skills summary.',
  },
  {
    icon: TrendingUp,
    title: 'Skill Score',
    description:
      'Get a dynamic 0–100 skill score based on your repos, languages, and activity level.',
  },
  {
    icon: Target,
    title: 'Task Matching',
    description:
      'Browse paid tasks that match your skills and apply with a single click.',
  },
  {
    icon: DollarSign,
    title: 'Get Paid',
    description:
      'Work on real projects from African startups and international clients.',
  },
  {
    icon: Users,
    title: 'Grow Your Network',
    description:
      'Build a verified portfolio that opens doors to opportunities across Africa.',
  },
];

const stats = [
  { value: '2,400+', label: 'Developers' },
  { value: '$280K', label: 'Tasks Posted' },
  { value: '18', label: 'African Countries' },
  { value: '4.9★', label: 'Average Rating' },
];

export default function LandingPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-background to-indigo-50">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-100 rounded-full filter blur-3xl opacity-40 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-100 rounded-full filter blur-3xl opacity-40 translate-x-1/3 translate-y-1/3" />

        <div className="container mx-auto px-4 py-24 text-center relative z-10">
          <Badge variant="secondary" className="mb-6 text-sm px-4 py-1.5">
            🌍 Built for African Developers
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6 leading-tight">
            Your GitHub Profile,{' '}
            <span className="text-primary">Reimagined</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            DevMatch Africa converts your GitHub activity into a verified developer
            portfolio and matches you to paid tasks — in minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href={`${apiUrl}/auth/github`}>
              <Button size="lg" className="gap-2 text-base px-8">
                <Github className="h-5 w-5" />
                Continue with GitHub
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
            <Link href="/tasks">
              <Button variant="outline" size="lg" className="text-base px-8">
                Browse Tasks
              </Button>
            </Link>
          </div>

          {/* Social proof */}
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Free to use · No credit card required · 2-minute setup</span>
          </div>
        </div>
      </section>

      {/* ─── Stats ────────────────────────────────────────────────────────── */}
      <section className="border-y bg-muted/30">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-extrabold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─────────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything you need to launch your dev career
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            From GitHub analysis to paid tasks — we handle the heavy lifting.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="group hover:shadow-md transition-shadow border-muted/60"
            >
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── How it works ─────────────────────────────────────────────────── */}
      <section className="bg-muted/30 border-y">
        <div className="container mx-auto px-4 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How it works</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Three simple steps to start earning as a developer.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: '01',
                icon: Github,
                title: 'Connect GitHub',
                description:
                  'Sign in with your GitHub account. We fetch your repos and activity data securely.',
              },
              {
                step: '02',
                icon: Zap,
                title: 'Get Your Score',
                description:
                  'Our AI analyzes your code, generates your profile, and assigns a skill score.',
              },
              {
                step: '03',
                icon: DollarSign,
                title: 'Apply & Earn',
                description:
                  'Browse matched tasks, apply with one click, and get paid for your work.',
              },
            ].map((step) => (
              <div key={step.step} className="text-center">
                <div className="relative inline-flex mb-6">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {step.step}
                  </span>
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to turn your GitHub into income?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join thousands of African developers already earning on DevMatch Africa.
          </p>
          <a href={`${apiUrl}/auth/github`}>
            <Button size="lg" className="gap-2 text-base px-8">
              <Github className="h-5 w-5" />
              Start for Free
            </Button>
          </a>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground font-bold text-xs">
                DM
              </div>
              <span>DevMatch Africa</span>
            </div>
            <p>© {new Date().getFullYear()} DevMatch Africa. Built for African Developers.</p>
            <div className="flex gap-4">
              <Link href="/tasks" className="hover:text-foreground transition-colors">
                Tasks
              </Link>
              <Link href="/login" className="hover:text-foreground transition-colors">
                Login
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
