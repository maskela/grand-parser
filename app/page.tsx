import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default async function Home() {
  const { userId } = await auth();

  // Redirect logged-in users to documents page
  if (userId) {
    redirect('/documents');
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero Section with Gradient Background */}
      <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 dark:from-blue-800 dark:via-indigo-900 dark:to-purple-900">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="mx-auto max-w-5xl text-center">
            <div className="mb-6 inline-flex items-center rounded-full bg-white/20 backdrop-blur-md border-2 border-white/30 px-5 py-2 text-sm font-bold text-white shadow-lg">
              ⚡ 87.5% Cheaper than ChatGPT-4 Vision
            </div>
            <h1 className="text-6xl md:text-7xl font-extrabold text-white mb-6 leading-tight drop-shadow-lg">
              Grand Parser
            </h1>
            <p className="mt-4 text-3xl md:text-4xl font-bold text-white/95 drop-shadow-md">
              AI-Powered Document Processing Platform
            </p>
            <p className="mx-auto mt-8 max-w-3xl text-xl text-white/90 leading-relaxed font-medium">
              Upload documents, extract structured data with custom templates, and visualize results with powerful analytics. 
              <span className="font-bold text-yellow-200"> Keep your history, save on costs, and process data at scale.</span>
            </p>
            <div className="mt-12 flex flex-wrap justify-center gap-4">
              {userId ? (
                <>
                  <Link href="/upload">
                    <Button size="lg" className="text-lg px-8 bg-white text-blue-700 hover:bg-blue-50 shadow-2xl border-2 border-white/50 font-bold">
                      <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Upload Document
                    </Button>
                  </Link>
                  <Link href="/documents">
                    <Button size="lg" variant="secondary" className="text-lg px-8 bg-white/10 backdrop-blur-md border-2 border-white/50 text-white hover:bg-white/20 shadow-xl font-bold">
                      View Documents
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/sign-up">
                    <Button size="lg" className="text-lg px-8 bg-white text-blue-700 hover:bg-blue-50 shadow-2xl border-2 border-white/50 font-bold">
                      Get Started Free
                    </Button>
                  </Link>
                  <Link href="/sign-in">
                    <Button size="lg" variant="secondary" className="text-lg px-8 bg-white/10 backdrop-blur-md border-2 border-white/50 text-white hover:bg-white/20 shadow-xl font-bold">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
            
            {/* Key Benefits */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border-2 border-green-400 dark:border-green-600 shadow-xl">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">$0.01</div>
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">Per document vs $0.08 ChatGPT</div>
              </div>
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border-2 border-blue-400 dark:border-blue-600 shadow-xl">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">5-10s</div>
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">Average processing time</div>
              </div>
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border-2 border-amber-400 dark:border-amber-600 shadow-xl">
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-2">∞</div>
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full history retention</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-20">

        {/* Features Section */}
        <div className="mx-auto mt-32 max-w-6xl">
          <h2 className="mb-4 text-center text-4xl font-extrabold text-[var(--text-primary)]">
            Enterprise-Grade Features
          </h2>
          <p className="mb-16 text-center text-lg text-[var(--text-secondary)]">
            Everything you need to process documents at scale
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="hover:scale-105 transition-transform">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <svg
                    className="mr-3 h-8 w-8 text-[var(--primary)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  Document Upload
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--text-secondary)]">
                  Upload PDF, JPEG, and PNG files up to 10MB. Secure storage with enterprise-grade encryption.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:scale-105 transition-transform">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <svg
                    className="mr-3 h-8 w-8 text-[var(--primary)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  AI Extraction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--text-secondary)]">
                  Powered by advanced AI workflows, extract structured data with custom templates and high accuracy.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:scale-105 transition-transform">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <svg
                    className="mr-3 h-8 w-8 text-[var(--primary)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--text-secondary)]">
                  Visualize processing statistics, cost savings, and performance metrics with interactive charts.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:scale-105 transition-transform">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <svg
                    className="mr-3 h-8 w-8 text-[var(--primary)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  Secure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--text-secondary)]">
                  Enterprise authentication with row-level security. Your data is always encrypted and protected.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:scale-105 transition-transform">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <svg
                    className="mr-3 h-8 w-8 text-[var(--primary)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                    />
                  </svg>
                  Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--text-secondary)]">
                  Use existing templates or create custom ones tailored to your specific document processing needs.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:scale-105 transition-transform">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <svg
                    className="mr-3 h-8 w-8 text-[var(--primary)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                  API Access
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--text-secondary)]">
                  RESTful API for programmatic access, automation integration, and batch processing.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        {!userId && (
          <div className="mx-auto mt-32 max-w-4xl">
            <Card className="bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 border-0">
              <CardContent className="py-16 text-center">
                <h2 className="text-4xl font-extrabold text-white mb-4">
                  Ready to get started?
                </h2>
                <p className="mt-4 text-xl text-blue-100 max-w-2xl mx-auto">
                  Join businesses processing thousands of documents. Sign up now and start saving on costs today.
                </p>
                <div className="mt-10">
                  <Link href="/sign-up">
                    <Button size="lg" variant="secondary" className="text-lg px-10 shadow-xl">
                      Create Free Account →
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
