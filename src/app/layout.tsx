import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Codexone — Secure Ephemeral Messenger",
  description: "End-to-end encrypted, burn-after-reading messaging. No persistence.",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('theme');if(!t){return}if(t==='dark'){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}})();",
          }}
        />
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur-sm dark:border-neutral-800 dark:bg-black/80">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
            <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src="/logo.svg" alt="CODEXONE logo" className="h-8 w-8" />
              <span className="text-lg font-semibold text-neutral-900 dark:text-white">CODEXONE</span>
            </a>
            <nav className="hidden sm:flex items-center gap-5 text-sm">
              <a href="/#how" className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100">How it works</a>
              <a href="/#safe" className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100">Safety</a>
              <a href="/#usecases" className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100">Use Cases</a>
              <a href="/about" className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100">About</a>
              <a href="/use-cases" className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100">Explore</a>
              <a href="/contact" className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100">Contact</a>
            </nav>
            <div className="flex items-center gap-2">
              <a href="/new" className="neo-btn rounded-md bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-sm font-medium text-white">Create Room</a>
            </div>
          </div>
        </header>
        <main className="pt-16">
          {children}
        </main>
        <footer className="mt-12 border-t border-neutral-200 bg-neutral-50/60 dark:border-neutral-800 dark:bg-neutral-950/60">
          <div className="mx-auto max-w-6xl px-4 py-6 grid gap-4 sm:flex sm:items-center sm:justify-between">
            <div className="text-sm text-neutral-600 dark:text-neutral-400">© {new Date().getFullYear()} Codexone. All rights reserved.</div>
            <nav className="flex flex-wrap gap-4 text-sm">
              <a className="text-neutral-700 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200" href="/about">About</a>
              <a className="text-neutral-700 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200" href="/use-cases">Use Cases</a>
              <a className="text-neutral-700 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200" href="/contact">Contact</a>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
