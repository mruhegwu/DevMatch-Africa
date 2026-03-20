'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/api';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  username?: string;
  avatar?: string;
  showDashboard?: boolean;
}

export default function Navbar({ username, avatar, showDashboard }: NavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Ignore errors on logout
    }
    router.push('/');
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            DM
          </div>
          <span className="font-bold text-lg hidden sm:block">DevMatch Africa</span>
        </Link>

        {/* Navigation links */}
        <div className="flex items-center gap-4">
          {showDashboard && (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/tasks"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Tasks
              </Link>
              <Link
                href="/applications"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Applications
              </Link>
            </>
          )}

          {username ? (
            <div className="flex items-center gap-3">
              {avatar && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatar}
                  alt={username}
                  className="h-8 w-8 rounded-full border"
                />
              )}
              <span className="text-sm font-medium hidden sm:block">{username}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button size="sm">Get Started</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
