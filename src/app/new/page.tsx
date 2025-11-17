"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewRoomPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        setError(null);
        // Use frontend proxy: /api -> backend http://localhost:4000/api via Next.js rewrites
        const res = await fetch(`/api/room`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ttl: "30min", burnAfterReading: true }),
        });
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        const roomId = data?.roomId;
        if (!roomId) throw new Error("No roomId returned");
        router.replace(`/room/${roomId}`);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to create room");
      }
    }
    run();
    return () => { cancelled = true; };
  }, [router]);

  return (
    <main className="min-h-dvh flex items-center justify-center px-4 pt-24">
      <div className="neo-surface neo rounded-xl p-6 text-center w-full max-w-sm">
        <div className="text-lg font-medium text-neutral-900 dark:text-white">Creating room…</div>
        <div className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">Please wait while we prepare your secure space.</div>
        {error && (
          <div className="mt-4 text-sm text-red-600 dark:text-red-400">
            {error}
            <div className="mt-2">
              <a href="/" className="underline">Go back</a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
