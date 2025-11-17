export const metadata = {
  title: "Contact — Codexone",
  description: "Contact the Codexone team.",
};

export default function ContactPage() {
  // Server Component page, renders a client ContactForm
  // to keep metadata support in Next.js.
  const ContactForm = require('./ContactForm').default;

  return (
    <main className="min-h-dvh px-4 py-10">
      <div className="mx-auto max-w-xl">
        <h1 className="text-3xl font-semibold">Contact Us</h1>
        <p className="text-neutral-300 mt-2">Have a question or feedback? We'd love to hear from you.</p>
        <ContactForm />
      </div>
    </main>
  );
}
