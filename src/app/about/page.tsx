export const metadata = {
  title: "About — Codexone",
  description: "About Codexone: secure, ephemeral messaging with client-side encryption.",
};

export default function AboutPage() {
  // Local UI atoms (kept inline for page cohesion)
  const Card = ({ title, desc, icon }: { title: string; desc: string; icon?: React.ReactNode }) => (
    <div className="neo-surface neo p-4 rounded-xl">
      <div className="flex items-center gap-2 text-lg font-medium tracking-tight dark:text-white">
        {icon && <span className="mono-icon opacity-70">{icon}</span>}
        <span>{title}</span>
      </div>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">{desc}</p>
    </div>
  );
  const Bullet = ({ children }: { children: React.ReactNode }) => (
    <li className="flex items-start gap-2 neo-surface neo-inset p-3 rounded-lg text-sm">
      <span className="mt-0.5">✅</span>
      <span className="text-neutral-700 dark:text-neutral-300">{children}</span>
    </li>
  );

  return (
    <main className="min-h-dvh">
      {/* Hero */}
      <section className="px-4 pt-24 sm:pt-32 md:pt-36 pb-10">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight bg-gradient-to-br from-neutral-900 to-neutral-700 bg-clip-text text-transparent dark:[background-image:none] dark:text-white">
            About Codexone
          </h1>
          <p className="mt-3 max-w-3xl text-neutral-700 dark:text-neutral-300">
            Codexone is a privacy-first, ephemeral messenger. Messages are encrypted in your browser using AES-GCM and never stored persistently.
            Rooms auto-expire by TTL, and messages can be burned after reading.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="px-4 pb-14">
        <div className="mx-auto max-w-6xl grid gap-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card title="Client-side E2E" desc="AES-GCM with Web Crypto. Keys never leave your device." icon={<IconShield/>} />
            <Card title="Ephemeral by design" desc="Rooms expire automatically. Optional burn-after-reading for messages." icon={<IconClock/>} />
            <Card title="Minimal surface" desc="No accounts, no analytics, no persistence. Simple, accessible, mobile-first UI." icon={<IconBan/>} />
          </div>

          <div className="grid gap-3">
            <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">Principles</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              <Bullet>Client-side encryption via Web Crypto API (AES-GCM)</Bullet>
              <Bullet>No analytics, no tracking, no message persistence</Bullet>
              <Bullet>Minimal metadata, strict rate limiting and CSP</Bullet>
              <Bullet>Accessible UX, keyboard navigation, and responsive design</Bullet>
            </ul>
          </div>

          <div className="grid gap-3">
            <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">How it works</h2>
            <p className="text-neutral-700 dark:text-neutral-300 max-w-3xl">
              Create a temporary room and share the link. Messages are encrypted end-to-end before transmission. When the TTL expires
              (or after a burn), content is removed. Development uses a relaxed CORS setup to ease local testing.
            </p>
          </div>

          <div>
            <a href="/#quick-create" className="neo-btn inline-flex items-center gap-2 rounded-md bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-sm font-medium text-white">
              🔒 Create a secure room
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

// ——— Monotone inline icons (currentColor) ———
function IconShield() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2l7 4v6c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-4z" />
    </svg>
  );
}
function IconClock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}
function IconBan() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M5 5l14 14" />
    </svg>
  );
}
