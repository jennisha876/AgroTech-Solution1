import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { MarketingPageShell } from "./MarketingShell";

export function About() {
  return (
    <MarketingPageShell
      eyebrow="About SmithAgro"
      title="Built for the day-to-day reality of farming and food supply"
      description="SmithAgro helps farmers manage operations, buyers source produce, and both sides make decisions faster with practical digital tools."
    >
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="border-green-100 shadow-sm">
          <CardHeader>
            <CardTitle>What we do</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-black/70">
            <p>
              SmithAgro combines farm operations, weather visibility, training access, produce discovery, and AI guidance in one working platform.
            </p>
            <p>
              The goal is straightforward: help farmers stay organized, help buyers find reliable supply, and reduce the friction between field decisions and market action.
            </p>
            <p>
              TechGro extends that mission by acting like a farming-focused AI copilot for planning, diagnosis, quality checks, and practical next steps.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card className="border-green-100 shadow-sm">
            <CardHeader>
              <CardTitle>Mission</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-black/70">
              Connect farmers directly with customers, reduce reliance on middlemen, and provide practical digital tools and AI guidance that boost productivity, reduce losses, and lock in fair prices.
            </CardContent>
          </Card>

          <Card className="border-green-100 shadow-sm">
            <CardHeader>
              <CardTitle>Vision</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-black/70">
              A world where farmers thrive with direct access to markets, consumers enjoy fresh locally sourced food, and AI-powered insights make farming smarter, more sustainable, and more resilient.
            </CardContent>
          </Card>

          <Card className="border-green-100 shadow-sm">
            <CardHeader>
              <CardTitle>Memberships</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-black/70">
              <p>Basic Subscription – Monthly access to the core platform and marketplace.</p>
              <p>Diamond Subscription – Yearly access with priority support and advanced tools.</p>
              <p>Platinum Subscription – Yearly access plus on-site training and dedicated onboarding assistance.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Practical First</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-black/70">
            Recommendations should help with real field decisions, not just generic theory.
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Local Context</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-black/70">
            Tools and advice should make sense for Caribbean and Jamaican farming conditions where possible.
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>One Connected Workflow</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-black/70">
            From planning to harvest to selling, users should not need separate disconnected systems.
          </CardContent>
        </Card>
      </div>
    </MarketingPageShell>
  );
}