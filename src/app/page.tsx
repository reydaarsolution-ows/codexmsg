"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

type TTL = "5min" | "15min" | "30min" | "1h" | "6h" | "24h";

export default function Home() {
  const router = useRouter();
  const [ttl, setTtl] = useState<TTL>("30min");
  const [burn, setBurn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRoom = async () => {
    try {
      setError(null);
      setLoading(true);
      // Use Next.js rewrite proxy: frontend /api -> backend http://localhost:4000/api
      const res = await fetch(`/api/room`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ttl, burnAfterReading: burn }),
      });
      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(`Failed to create room: ${res.status} - ${errorData}`);
      }
      const data = await res.json();
      const roomId: string = data.roomId;
      if (!roomId) {
        throw new Error('No room ID received from server');
      }
      router.push(`/room/${roomId}`);
    } catch (e: any) {
      setError(e?.message || "Error creating room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-dvh">
      {/* Hero */}
      <section className="relative isolate overflow-hidden px-4 pt-24 sm:pt-32 md:pt-36 pb-14" aria-labelledby="hero-title">
  
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.06),transparent_60%),radial-gradient(ellipse_at_bottom,rgba(59,130,246,0.05),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.10),transparent_60%),radial-gradient(ellipse_at_bottom,rgba(59,130,246,0.08),transparent_60%)]" />
        {/* Decorative animated accents */}
        <div className="pointer-events-none absolute -top-24 -right-24 size-[28rem] -z-10 rounded-full bg-emerald-300/20 blur-3xl dark:bg-emerald-500/10" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 size-[28rem] -z-10 rounded-full bg-sky-300/20 blur-3xl dark:bg-sky-500/10" />
        <div className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(1200px_400px_at_50%_-200px,rgba(0,0,0,0.04),transparent)] dark:[background:radial-gradient(1200px_400px_at_50%_-200px,rgba(255,255,255,0.06),transparent)]" />
        <div className="mx-auto max-w-6xl grid gap-6 sm:gap-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-emerald-700 text-xs dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">E2E Encrypted • Burn-after-Reading</div>
            <motion.h1
              id="hero-title"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="mt-4 text-4xl sm:text-5xl font-semibold tracking-tight bg-gradient-to-br from-neutral-900 to-neutral-700 bg-clip-text text-transparent dark:bg-none dark:text-white"
            >
              Codexone — Private, Ephemeral Messaging
            </motion.h1>
            <p className="mt-3 text-neutral-600 dark:text-neutral-200 max-w-2xl mx-auto">Create a secure room in seconds. Messages are encrypted in your browser and auto-destroyed. No accounts. No persistence. Just privacy.</p>
            {/* Avatar stack */}
            <div className="mt-5 flex justify-center">
              <AvatarStack />
            </div>
          </div>

          {/* Quick Create Card */}
          <motion.div
            id="quick-create"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            className="group relative mx-auto w-full max-w-3xl neo-surface neo p-4 sm:p-6 transition-colors"
          >
            <div className="grid sm:grid-cols-3 gap-3 items-end">
              <div className="grid gap-1 sm:col-span-1">
                <label className="text-xs text-neutral-400">Expires in</label>
                <select className="neo-inset neo-surface rounded-md px-3 py-2 text-neutral-900 dark:text-neutral-100" value={ttl} onChange={(e) => setTtl(e.target.value as TTL)}>
                  <option value="5min">5 minutes</option>
                  <option value="15min">15 minutes</option>
                  <option value="30min">30 minutes</option>
                  <option value="1h">1 hour</option>
                  <option value="6h">6 hours</option>
                  <option value="24h">24 hours</option>
                </select>
              </div>
              <div className="flex items-center sm:col-span-1">
                <button
                  type="button"
                  onClick={() => setBurn(!burn)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${burn ? 'bg-emerald-600' : 'bg-neutral-200 dark:bg-neutral-700'}`}
                  role="switch"
                  aria-checked={burn}
                >
                  <span className="sr-only">Burn after reading</span>
                  <span
                    className={`${burn ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </button>
                <span className="ml-2 text-sm">Burn after reading</span>
              </div>
              <div className="sm:col-span-1">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={createRoom}
                  disabled={loading}
                  className="neo-btn relative w-full overflow-hidden rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 px-4 py-2 font-medium text-white"
                >
                  <span className="relative z-10 inline-flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <span className="inline-block size-3 rounded-full bg-emerald-200 animate-ping" />
                        Securing…
                      </>
                    ) : (
                      <>
                        <span>🔒</span>
                        Create Room
                      </>
                    )}
                  </span>
                  {!loading && (
                    <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-emerald-300/25 to-emerald-400/0 translate-x-[-100%] hover:translate-x-0 transition-transform duration-700" />
                  )}
                </motion.button>
              </div>
            </div>
            {error && <div className="mt-2 text-sm text-red-400">{error}</div>}

            {/* Security effect overlay while creating */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  className="pointer-events-none absolute inset-0 z-20 grid place-items-center rounded-2xl bg-white/70 backdrop-blur-sm dark:bg-neutral-950/60"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0.8 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 180, damping: 14 }}
                    className="relative grid place-items-center"
                  >
                    <div className="relative size-24 rounded-full border border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_40px_rgba(16,185,129,0.25)] dark:border-emerald-400/40 dark:bg-emerald-400/10 dark:shadow-[0_0_40px_rgba(16,185,129,0.35)]">
                      <div className="absolute inset-2 rounded-full border border-emerald-400/30 dark:border-emerald-300/30" />
                      <div className="absolute inset-0 animate-spin rounded-full border-t-2 border-emerald-400/40 dark:border-emerald-300/40" />
                    </div>
                    <div className="absolute text-2xl">🔐</div>
                    <div className="absolute top-full mt-3 text-sm text-emerald-700 dark:text-emerald-200">Establishing secure room…</div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Trusted By - Logo Carousel */}
      <div className="py-6 bg-white/30 dark:bg-black/20 backdrop-blur-sm overflow-hidden">
        <div className="relative
          before:absolute before:left-0 before:top-0 before:bottom-0 before:w-24 before:bg-gradient-to-r before:from-white dark:before:from-slate-900 before:to-transparent before:z-10 before:pointer-events-none
          after:absolute after:right-0 after:top-0 after:bottom-0 after:w-24 after:bg-gradient-to-l after:from-white dark:after:from-slate-900 after:to-transparent after:z-10 after:pointer-events-none">
          <div className="flex items-center whitespace-nowrap animate-scroll">
            {[
              { name: 'Google', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg' },
              { name: 'Microsoft', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg' },
              { name: 'Amazon', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg' },
              { name: 'Netflix', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg' },
              { name: 'Uber', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/58/Uber_logo_2018.svg' },
              { name: 'Airbnb', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_B%C3%A9lo.svg' },
              { name: 'Stripe', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg' },
              { name: 'Spotify', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg' },
              { name: 'Slack', logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg' },
              { name: 'Zoom', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Zoom_Communications_Logo.svg' },
            ].map((company, index) => (
              <div key={index} className="inline-flex items-center justify-center px-6 sm:px-8">
                <img 
                  src={company.logo} 
                  alt={company.name}
                  className="h-6 sm:h-7 w-auto max-w-[120px] opacity-70 hover:opacity-100 transition-opacity"
                  loading="lazy"
                />
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {[
              { name: 'Google', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg' },
              { name: 'Microsoft', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg' },
              { name: 'Amazon', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg' },
              { name: 'Netflix', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg' },
              { name: 'Uber', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/58/Uber_logo_2018.svg' },
            ].map((company, index) => (
              <div key={`dup-${index}`} className="inline-flex items-center justify-center px-6 sm:px-8">
                <img 
                  src={company.logo} 
                  alt={company.name}
                  className="h-6 sm:h-7 w-auto max-w-[120px] opacity-70 hover:opacity-100 transition-opacity"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <section id="how" className="px-4 py-10 sm:py-14 border-t border-neutral-200 dark:border-neutral-900 scroll-mt-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">How it works</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Card title="Create a room" desc="Generate a random room with TTL and optional burn-after-reading." icon={<IconPlus />} />
            <Card title="Share securely" desc="Share the room link via QR, WhatsApp, Email, or copy link." icon={<IconShare />} />
            <Card title="Chat & auto-destroy" desc="Messages are end-to-end encrypted and auto-destroyed after reading/expiry." icon={<IconShield />} />
          </div>
        </div>
      </section>

      {/* Why it's safe */}
      <section id="safe" className="px-4 py-10 sm:py-14 border-t border-neutral-200 dark:border-neutral-900 scroll-mt-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">Why MsgXone is safe</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            <Bullet>Client-side AES-GCM encryption using the Web Crypto API</Bullet>
            <Bullet>No persistence: no messages are stored by the server</Bullet>
            <Bullet>Rooms auto-expire by TTL; messages can be burn-after-reading</Bullet>
            <Bullet>Rate limiting, CSP, and sanitization for robust security</Bullet>
          </ul>
        </div>
      </section>

      {/* Use cases */}
      <section id="usecases" className="px-4 py-10 sm:py-14 border-t border-neutral-200 dark:border-neutral-900 scroll-mt-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">Use cases</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Card title="Confidential snippets" desc="Share passwords, tokens, or sensitive notes safely." icon={<IconLock />} />
            <Card title="Ephemeral coordination" desc="Plan meetups or share one-time links without traces." icon={<IconClock />} />
            <Card title="Private media" desc="Send images/videos that disappear after reading." icon={<IconMedia />} />
          </div>
        </div>
      </section>
    </main>
  );
}

function Card({ title, desc, icon }: { title: string; desc: string; icon?: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-15%" }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.35 }}
      className="group neo-surface neo p-4"
    >
      <div className="flex items-center gap-2 text-lg font-medium tracking-tight dark:text-white">
        {icon && <span className="mono-icon opacity-70">{icon}</span>}
        <span>{title}</span>
      </div>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">{desc}</p>
    </motion.div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <motion.li whileHover={{ scale: 1.01 }} className="flex items-start gap-2 neo-surface neo-inset p-3 text-sm">
      <span className="mt-0.5 mono-icon opacity-70"><IconCheck /></span>
      <span>{children}</span>
    </motion.li>
  );
}

// ——— Monotone inline icons (currentColor) ———
function IconPlus() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function IconShare() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
      <path d="M16 6l-4-4-4 4" />
      <path d="M12 2v14" />
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
function IconLock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <path d="M7 11V8a5 5 0 0 1 10 0v3" />
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
function IconMedia() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M10 13l-3 4h10l-4-5-2 3-1-2z" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function AvatarStack() {
  return (
    <div className="flex items-end justify-center">
      <div className="h-[50px] w-[50px] rounded-full neo-surface">
        <img
          src="https://cdn.tailgrids.com/assets/images/core-components/avatar/image-01.jpg"
          alt="avatar"
          className="h-full w-full rounded-full object-cover object-center"
          loading="lazy" decoding="async"
        />
      </div>
      <div className="-ml-4 h-[50px] w-[50px] rounded-full neo-surface">
        <img
          src="https://cdn.tailgrids.com/assets/images/core-components/avatar/image-02.jpg"
          alt="avatar"
          className="h-full w-full rounded-full object-cover object-center"
          loading="lazy" decoding="async"
        />
      </div>
      <div className="-ml-4 h-[50px] w-[50px] rounded-full neo-surface">
        <img
          src="https://cdn.tailgrids.com/assets/images/core-components/avatar/image-03.jpg"
          alt="avatar"
          className="h-full w-full rounded-full object-cover object-center"
          loading="lazy" decoding="async"
        />
      </div>
      <div className="-ml-4 h-[50px] w-[50px] rounded-full neo-surface">
        <img
          src="https://cdn.tailgrids.com/assets/images/core-components/avatar/image-04.jpg"
          alt="avatar"
          className="h-full w-full rounded-full object-cover object-center"
          loading="lazy" decoding="async"
        />
      </div>
      <div className="-ml-4 h-[50px] w-[50px] rounded-full neo-surface">
        <img
          src="https://cdn.tailgrids.com/assets/images/core-components/avatar/image-05.jpg"
          alt="avatar"
          className="h-full w-full rounded-full object-cover object-center"
          loading="lazy" decoding="async"
        />
      </div>
    </div>
  );
}
