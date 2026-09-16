import { useState } from "react";
import { Mail, MessageSquare } from "lucide-react";
import { Input, Textarea, Button } from "../../components/ui";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // Opens the user's mail client with pre-filled fields as a simple
    // no-backend contact mechanism for the MVP.
    const subject = encodeURIComponent(`ShopSphere enquiry from ${form.name}`);
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`);
    window.location.href = `mailto:hello@shopsphere.in?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <div className="container-app py-14 sm:py-20 max-w-xl">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-accent" />
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-primary">Contact Us</h1>
      </div>
      <p className="text-secondary mt-2 mb-8">
        Have a question, feedback, or want to partner with us? We'd love to hear from you.
      </p>

      {sent ? (
        <div className="bg-white border border-border rounded-2xl p-8 text-center">
          <Mail className="w-10 h-10 text-accent mx-auto mb-3" />
          <p className="font-semibold text-primary">Your mail client should have opened.</p>
          <p className="text-sm text-secondary mt-1">If not, email us directly at hello@shopsphere.in</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-border rounded-2xl p-6 space-y-4">
          <Input label="Your name" value={form.name} onChange={(e) => set({ name: e.target.value })} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} required />
          <Textarea label="Message" rows={5} value={form.message} onChange={(e) => set({ message: e.target.value })} required />
          <div className="flex justify-end">
            <Button type="submit" icon={Mail}>Send Message</Button>
          </div>
        </form>
      )}
    </div>
  );
}
