"use client";
import { useEffect } from "react";
import QRCode from "react-qr-code";

export function ShareModal({ open, onClose, url }: { open: boolean; onClose: () => void; url: string }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const encoded = encodeURIComponent(url);
  const whatsapp = `https://wa.me/?text=${encoded}`;
  const email = `mailto:?subject=${encodeURIComponent("Join my secure room")}&body=${encoded}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      alert("Link copied");
    } catch {}
  };

  const webShare = async () => {
    try {
      if (navigator.share) await navigator.share({ title: "Secure room", text: "Join my secure room", url });
      else copy();
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" role="dialog" aria-modal>
      <div className="w-full max-w-md rounded-xl border border-neutral-700 bg-neutral-900 p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Share Room</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-200" aria-label="Close">✕</button>
        </div>
        <div className="mt-4 grid gap-4">
          <div className="mx-auto bg-white p-3 rounded-md"><QRCode value={url} size={160} /></div>
          <div className="grid grid-cols-2 gap-2">
            <a href={whatsapp} target="_blank" rel="noreferrer" className="rounded-md bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-center">WhatsApp</a>
            <a href={email} className="rounded-md bg-sky-600 hover:bg-sky-500 px-3 py-2 text-center">Email</a>
            <button onClick={copy} className="rounded-md bg-neutral-800 hover:bg-neutral-700 px-3 py-2">Copy link</button>
            <button onClick={webShare} className="rounded-md bg-neutral-800 hover:bg-neutral-700 px-3 py-2">Share…</button>
          </div>
          <div className="text-xs text-neutral-400 break-all">{url}</div>
        </div>
      </div>
    </div>
  );
}
