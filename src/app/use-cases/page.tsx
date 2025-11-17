export const metadata = {
  title: "Use Cases — Codexone",
  description: "Common ways to use Codexone for private, ephemeral communication.",
};

function Case({ title, desc, icon }: { title: string; desc: string; icon?: React.ReactNode }) {
  return (
    <div className="neo-surface neo p-4 rounded-xl transition-transform">
      <div className="flex items-center gap-2 text-lg font-medium tracking-tight dark:text-white">
        {icon && <span className="mono-icon opacity-70">{icon}</span>}
        <span>{title}</span>
      </div>
      <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">{desc}</p>
    </div>
  );
}

export default function UseCasesPage() {
  return (
    <main className="min-h-dvh">
      {/* Hero */}
      <section className="px-4 pt-24 sm:pt-32 md:pt-36 pb-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight bg-gradient-to-br from-neutral-900 to-neutral-700 bg-clip-text text-transparent dark:[background-image:none] dark:text-white">
            Use Cases
          </h1>
          <p className="mt-3 max-w-3xl text-neutral-700 dark:text-neutral-300">
            Practical scenarios where Codexone excels for secure, ephemeral communication.
          </p>
        </div>
      </section>

      {/* Cases */}
      <section className="px-4 pb-14">
        <div className="mx-auto max-w-6xl grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Case title="Confidential snippets" desc="Share passwords, API keys, and sensitive notes without leaving traces." icon={<IconLock/>} />
          <Case title="One-time links" desc="Send one-time download or login links that auto-expire." icon={<IconLink/>} />
          <Case title="Private media" desc="Share images or short videos securely with automatic deletion." icon={<IconMedia/>} />
          <Case title="Temporary collaboration" desc="Coordinate meetups or logistics where messages shouldn’t persist." icon={<IconUsers/>} />
          <Case title="Security handoffs" desc="Exchange recovery codes or MFA tokens during support flows." icon={<IconShield/>} />
          <Case title="Ephemeral brainstorming" desc="Discuss ideas that should not be archived or indexed." icon={<IconLightbulb/>} />
        </div>

        <div className="mt-8">
          <a href="/#quick-create" className="neo-btn inline-flex items-center gap-2 rounded-md bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-sm font-medium text-white">
            🔒 Create a secure room
          </a>
        </div>
      </section>
    </main>
  );
}

// ——— Monotone inline icons (currentColor) ———
function IconLock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <path d="M7 11V8a5 5 0 0 1 10 0v3" />
    </svg>
  );
}
function IconLink() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 13a5 5 0 0 1 0-7l1-1a5 5 0 0 1 7 7l-1 1" />
      <path d="M14 11a5 5 0 0 1 0 7l-1 1a5 5 0 1 1-7-7l1-1" />
    </svg>
  );
}
function IconMedia() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M10 13l-3 4h10l-4-5-2 3-1-2z" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function IconShield() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2l7 4v6c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-4z" />
    </svg>
  );
}
function IconLightbulb() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M2 10a10 10 0 1 1 20 0c0 3.03-1.64 5.68-4.07 7.16-.35.22-.6.57-.68.98l-.25 1.26H7l-.25-1.26a1.6 1.6 0 0 0-.68-.98C3.64 15.68 2 13.03 2 10z" />
    </svg>
  );
}
