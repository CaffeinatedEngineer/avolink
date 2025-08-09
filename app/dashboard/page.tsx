import { auth, currentUser } from '@clerk/nextjs/server'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const { userId } = await auth()
  const user = await currentUser()

  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      {/* Background glow */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[#0A0A0F]" />
        <div className="absolute -top-32 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-[#E84142]/20 blur-[120px]" />
        <div className="absolute bottom-0 right-[-10%] h-[28rem] w-[28rem] rounded-full bg-fuchsia-600/20 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-semibold text-white">
            Avolink
          </Link>
          <div className="flex items-center gap-4">
            <Link 
              href="/profile"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Profile
            </Link>
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8"
                }
              }}
            />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-white mb-2">
            Welcome back, {user?.firstName || 'User'}! 👋
          </h1>
          <p className="text-white/70">
            Manage your events and track your attendance on Avolink.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Create Event Card */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center rounded-lg bg-[#E84142]/10 p-3">
                <svg className="h-6 w-6 text-[#E84142]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Create Event</h3>
            <p className="text-sm text-white/70 mb-4">
              Host your own event on the Avalanche blockchain with secure ticketing.
            </p>
            <button className="w-full rounded-lg bg-[#E84142] px-4 py-2 text-sm font-medium text-white hover:brightness-110 transition">
              Create New Event
            </button>
          </div>

          {/* My Events Card */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center rounded-lg bg-emerald-500/10 p-3">
                <svg className="h-6 w-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">My Events</h3>
            <p className="text-sm text-white/70 mb-4">
              View and manage all the events you've created.
            </p>
            <button className="w-full rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/5 transition">
              View My Events
            </button>
          </div>

          {/* Attended Events Card */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center rounded-lg bg-fuchsia-500/10 p-3">
                <svg className="h-6 w-6 text-fuchsia-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Attended Events</h3>
            <p className="text-sm text-white/70 mb-4">
              Check your event attendance history and proof of attendance tokens.
            </p>
            <button className="w-full rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/5 transition">
              View History
            </button>
          </div>
        </div>

        {/* User Info Section */}
        <div className="mt-12 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <h2 className="text-xl font-medium text-white mb-4">Account Information</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-white/70">Email</label>
              <p className="text-white font-medium">{user?.emailAddresses[0]?.emailAddress}</p>
            </div>
            <div>
              <label className="text-sm text-white/70">Member since</label>
              <p className="text-white font-medium">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
