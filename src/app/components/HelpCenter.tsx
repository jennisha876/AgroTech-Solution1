import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { MarketingPageShell } from "./MarketingShell";

const faqs = [
  {
    question: "What can TechGro help with?",
    answer:
      "TechGro can help with crop disease clues, pest management ideas, irrigation planning, weather-risk decisions, produce quality checks, post-harvest handling, and general farming workflows.",
  },
  {
    question: "Can I upload crop images?",
    answer:
      "Yes. In the assistant, use the image button to attach a crop image. TechGro can use the image together with your question to give more specific farming guidance.",
  },
  {
    question: "Why are some farmer features locked until a membership is selected?",
    answer:
      "Farmers can continue into the dashboard without choosing a membership, but certain tools remain locked until a plan is selected so feature access matches the subscription flow.",
  },
  {
    question: "What should I include in a support request?",
    answer:
      "Include your account type, the page you were using, what you clicked, what happened, and any message shown on screen. That makes troubleshooting much faster.",
  },
];

export function HelpCenter() {
  return (
    <MarketingPageShell
      eyebrow="Help Center"
      title="Support, answers, and TechGro guidance"
      description="Use this page to understand the platform, get unstuck faster, and know what TechGro can do for farming decisions."
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Getting started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-black/70">
            <p>Create the right account type first, then complete your profile and location so weather and recommendations stay relevant.</p>
            <p>Farmers should select a membership to unlock crop management, training, learning, weather, and alerts. Buyers can go directly into browsing and ordering.</p>
            <p>When using TechGro, ask concrete questions with crop name, symptoms, growth stage, weather context, and what you have already tried.</p>
          </CardContent>
        </Card>

        <Card className="border-green-100 shadow-sm">
          <CardHeader>
            <CardTitle>Best results with TechGro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-black/70">
            <p>Use clear photos of leaves, stems, fruit, or affected areas.</p>
            <p>Say whether the issue is spreading, isolated, or getting worse after rain or heat.</p>
            <p>Ask for step-by-step treatment, prevention, or monitoring checklists.</p>
            <p>Use follow-up questions the way you would in a normal AI chat session.</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {faqs.map((faq) => (
          <Card key={faq.question} className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">{faq.question}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-black/70">{faq.answer}</CardContent>
          </Card>
        ))}
      </div>
    </MarketingPageShell>
  );
}