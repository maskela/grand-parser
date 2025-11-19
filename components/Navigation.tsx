'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, useUser } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import Button from './ui/Button';
import ThemeToggle from './ThemeToggle';

export default function Navigation() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useUser();

  const links = [
    { href: '/upload', label: 'Upload' },
    { href: '/documents', label: 'Documents' },
    { href: '/stats', label: 'Statistics' },
  ];

  return (
    <nav className="border-b-2 border-[var(--card-border)] bg-[var(--card-bg)] shadow-[var(--shadow-sm)] backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors flex items-center space-x-2">
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Grand Parser</span>
            </Link>
            {isSignedIn && (
              <div className="hidden md:flex md:space-x-2">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'rounded-lg px-4 py-2 text-sm font-semibold transition-all',
                      pathname === link.href
                        ? 'bg-[var(--primary)] text-white shadow-md'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary)]'
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            {isLoaded && (
              <>
                {isSignedIn ? (
                  <UserButton afterSignOutUrl="/" />
                ) : (
                  <>
                    <Link href="/sign-in">
                      <Button variant="ghost" size="sm">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/sign-up">
                      <Button size="sm">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

