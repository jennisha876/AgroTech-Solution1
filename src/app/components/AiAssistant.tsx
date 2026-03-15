import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { MessageCircle, Send } from "lucide-react";
import { api, AiMessage } from "../lib/api";

interface ChatItem {
  role: "user" | "assistant";
  content: string;
}

export function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatItem[]>([
    { role: "assistant", content: "I am TechGro. Ask me anything about crop quality, faulty produce detection, or weather risks and I will respond like your farming copilot." },
  ]);

  const sendMessage = async () => {
    if (!message.trim() || loading) {
      return;
    }

    const nextUserMessage = { role: "user" as const, content: message.trim() };
    setMessages((prev) => [...prev, nextUserMessage]);
    setMessage("");
    setLoading(true);

    try {
      const history: AiMessage[] = messages.slice(-10).map((m) => ({ role: m.role, content: m.content }));
      const response = await api.askAi(nextUserMessage.content, history);
      setMessages((prev) => [...prev, { role: "assistant", content: response.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "I could not answer right now. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        <Card className="w-[340px] shadow-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">TechGro Assistant</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {messages.map((item, index) => (
                <div
                  key={`${item.role}-${index}`}
                  className={`rounded-lg px-3 py-2 text-sm ${item.role === "assistant" ? "bg-slate-100" : "bg-green-100"}`}
                >
                  {item.content}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask TechGro anything..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
              />
              <Button onClick={sendMessage} disabled={loading || !message.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button className="rounded-full h-12 w-12 p-0 bg-green-600 hover:bg-green-700" onClick={() => setOpen(true)}>
          <MessageCircle className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
