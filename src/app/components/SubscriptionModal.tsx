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

const SUBSCRIPTION_DETAILS = {
  basic: {
    name: "Basic",
    description: "25 customers, 1 online training/month, monthly billing, 30 days free trial.",
    details: [
      "Up to 25 customers",
      "1 online training session/month",
      "Monthly billing",
      "30 days free trial",
    ],
    price: "$9/mo",
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
    price: "$99/yr",
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
    price: "$199/yr",
    trial: 30,
  },
};

export function SubscriptionModal({ open, onClose, onSubscribe }: {
  open: boolean;
  onClose: () => void;
  onSubscribe: (level: SubscriptionLevel) => void;
}) {
  const [selected, setSelected] = useState<SubscriptionLevel | null>(null);
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Choose Your Membership</DialogTitle>
          <DialogDescription>
            Select a subscription to unlock more features. All plans include a 30-day free trial.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 mt-4">
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
                <div className="font-bold text-green-700 text-xl">{plan.price}</div>
              </div>
              <ul className="mt-2 ml-4 list-disc text-sm">
                {plan.details.map((d, i) => <li key={i}>{d}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button disabled={!selected} onClick={() => selected && onSubscribe(selected)} className="w-full bg-green-600 hover:bg-green-700">Continue</Button>
          <DialogClose asChild>
            <Button variant="outline" className="w-full mt-2">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
