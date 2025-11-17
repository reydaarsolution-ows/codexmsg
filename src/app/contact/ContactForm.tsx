"use client";
import { FormEvent, useState } from "react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const to = "contact@codexone.app";
    const subject = encodeURIComponent("Codexone contact");
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  };

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
      <div className="grid gap-1">
        <label htmlFor="name" className="text-sm text-neutral-300">Name</label>
        <input id="name" className="rounded-md bg-neutral-800 border border-neutral-700 px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="grid gap-1">
        <label htmlFor="email" className="text-sm text-neutral-300">Email</label>
        <input id="email" type="email" className="rounded-md bg-neutral-800 border border-neutral-700 px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="grid gap-1">
        <label htmlFor="message" className="text-sm text-neutral-300">Message</label>
        <textarea id="message" rows={5} className="rounded-md bg-neutral-800 border border-neutral-700 px-3 py-2" value={message} onChange={(e) => setMessage(e.target.value)} required />
      </div>
      <div className="flex items-center justify-between gap-2 text-sm text-neutral-400">
        <span>We'll open your email client to send the message.</span>
        <button type="submit" className="rounded-md bg-emerald-600 hover:bg-emerald-500 px-4 py-2 font-medium">Send</button>
      </div>
    </form>
  );
}
