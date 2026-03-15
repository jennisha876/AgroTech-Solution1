import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "./ui/dialog";
import { Button } from "./ui/button";

import { useState } from "react";

export type SubscriptionLevel = "basic" | "diamond" | "platinum";

export const SUBSCRIPTION_DETAILS = {
  basic: {
    name: "Basic",
    description: "25 customers, 1 online training/month, monthly billing, 30 days free trial.",
    details: [
      "Up to 25 customers",
      "1 online training session/month",
      "Monthly billing",
      "30 days free trial",
    ],
    priceUSD: 9,
    priceJMD: 1400,
    priceText: "$9/mo | J$1,400/mo",
    trial: 30,
  },
  diamond: {
    name: "Diamond",
    description: "50 customers, 2 online + 1 on-site training/month, yearly billing, 30 days free trial.",
    details: [
      "Up to 50 customers",
      "2 online + 1 on-site training/month",
      "Yearly billing",
      "30 days free trial",
    ],
    priceUSD: 99,
    priceJMD: 15500,
    priceText: "$99/yr | J$15,500/yr",
    trial: 30,
  },
  platinum: {
    name: "Platinum",
    description: "Unlimited customers, unlimited training, TechGro assistant, yearly billing, 30 days free trial.",
    details: [
      "Unlimited customers",
      "Unlimited training sessions",
      "TechGro assistant access",
      "Yearly billing",
      "30 days free trial",
    ],
    priceUSD: 199,
    priceJMD: 31000,
    priceText: "$199/yr | J$31,000/yr",
    trial: 30,
  },
};

export function SubscriptionModal({ open, onClose, onSubscribe }: {
  open: boolean;
  onClose: () => void;
  onSubscribe: (level: SubscriptionLevel, currency: "usd" | "jmd") => void;
}) {
  const [selected, setSelected] = useState<SubscriptionLevel | null>(null);
  const [currency, setCurrency] = useState<"usd" | "jmd">("usd");
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose Your Membership</DialogTitle>
          <DialogDescription>
            Select a subscription to unlock more features. All plans include a 30-day free trial.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 mb-4">
          <span className="font-semibold text-sm">Currency:</span>
          <Button size="sm" variant={currency === "usd" ? "default" : "outline"} onClick={() => setCurrency("usd")}>USD</Button>
          <Button size="sm" variant={currency === "jmd" ? "default" : "outline"} onClick={() => setCurrency("jmd")}>JMD</Button>
        </div>
        <div className="grid gap-4 mt-2">
          {Object.entries(SUBSCRIPTION_DETAILS).map(([key, plan]) => (
            <div
              key={key}
              className={`border rounded-lg p-4 cursor-pointer ${selected === key ? "border-green-600 bg-green-50" : "hover:border-green-400"}`}
              onClick={() => setSelected(key as SubscriptionLevel)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-lg">{plan.name}</div>
                  <div className="text-sm text-muted-foreground">{plan.description}</div>
                </div>
                <div className="font-bold text-green-700 text-xl">
                  {currency === "usd" ? `$${plan.priceUSD}${key === "basic" ? "/mo" : "/yr"}` : `J$${plan.priceJMD}${key === "basic" ? "/mo" : "/yr"}`}
                </div>
              </div>
              <ul className="mt-2 ml-4 list-disc text-sm">
                {plan.details.map((d, i) => <li key={i}>{d}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button disabled={!selected} onClick={() => selected && onSubscribe(selected, currency)} className="w-full bg-green-600 hover:bg-green-700">Continue</Button>
          <DialogClose asChild>
            <Button variant="outline" className="w-full mt-2">Continue without plan</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
