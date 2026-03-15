import { useState } from "react";
import { toast } from "sonner";
import { MarketingPageShell } from "./MarketingShell";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

export function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please complete your name, email, and message.");
      return;
    }

    toast.success("Your message has been prepared for support.");

    const subject = encodeURIComponent(form.subject.trim() || `Support request from ${form.name.trim()}`);
    const body = encodeURIComponent(
      `Name: ${form.name.trim()}\nEmail: ${form.email.trim()}\n\n${form.message.trim()}`
    );

    window.location.href = `mailto:support@smithagro.com?subject=${subject}&body=${body}`;
  };

  return (
    <MarketingPageShell
      eyebrow="Contact"
      title="Talk to the SmithAgro team"
      description="Send us a message for onboarding help, buyer and farmer support, subscriptions, or platform issues."
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contact-name">Name</Label>
                  <Input
                    id="contact-name"
                    value={form.name}
                    onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-subject">Subject</Label>
                <Input
                  id="contact-subject"
                  value={form.subject}
                  onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))}
                  placeholder="What do you need help with?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-message">Message</Label>
                <Textarea
                  id="contact-message"
                  value={form.message}
                  onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
                  placeholder="Describe the issue, question, or request in detail."
                  className="min-h-36"
                />
              </div>

              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card className="border-green-100 shadow-sm">
            <CardHeader>
              <CardTitle>Email</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-black/70">support@smithagro.com</CardContent>
          </Card>

          <Card className="border-green-100 shadow-sm">
            <CardHeader>
              <CardTitle>Phone</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-black/70">+1-876-555-2000</CardContent>
          </Card>

          <Card className="border-green-100 shadow-sm">
            <CardHeader>
              <CardTitle>Office Hours</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-black/70">Monday to Friday, 8:00 AM to 5:00 PM</CardContent>
          </Card>

          <Card className="border-green-100 shadow-sm">
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-black/70">Kingston, Jamaica</CardContent>
          </Card>
        </div>
      </div>
    </MarketingPageShell>
  );
}