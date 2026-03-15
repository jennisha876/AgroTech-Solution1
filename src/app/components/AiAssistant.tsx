import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ImagePlus, MessageCircle, Send, X } from "lucide-react";
import { api, AiMessage } from "../lib/api";

interface ChatItem {
  role: "user" | "assistant";
  content: string;
}

export function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatItem[]>([
    {
      role: "assistant",
      content:
        "I am TechGro, your Jamaican agriculture assistant. I can help with any farming questions specific to Jamaica—from crop cultivation and pest management to market access and local agricultural practices. Upload a crop image if you want me to analyze it for diseases or issues.",
    },
  ]);

  const quickPrompts = [];

  const sendMessage = async () => {
    if ((!message.trim() && !imageDataUrl) || loading) {
      return;
    }

    const baseMessage = message.trim() || "Please analyze this uploaded crop image and scan for disease, damage, or quality issues. Suggest likely causes and treatment steps, and share general farming guidance where helpful.";
    const nextUserMessage = {
      role: "user" as const,
      content: imageDataUrl ? `${baseMessage}\n[Image attached: ${imageName || "crop-image"}]` : baseMessage,
    };
    const conversation = [...messages, nextUserMessage];

    setMessages(conversation);
    setMessage("");
    setLoading(true);

    try {
      const history: AiMessage[] = conversation.slice(-10, -1).map((m) => ({ role: m.role, content: m.content }));
      const response = await api.askAi(baseMessage, history, imageDataUrl || undefined);
      setMessages((prev) => [...prev, { role: "assistant", content: response.reply }]);
      setImageDataUrl(null);
      setImageName("");
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "I could not answer right now. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File | null) => {
    if (!file) {
      return;
    }

    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Image is too large. Please upload an image up to 2MB." }]);
      return;
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Could not read image"));
      reader.readAsDataURL(file);
    });

    setImageDataUrl(dataUrl);
    setImageName(file.name);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        <Card className="w-[340px] sm:w-[420px] md:w-[520px] max-w-[calc(100vw-2rem)] shadow-xl">
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
              <div className="flex items-center">
                <label className="cursor-pointer inline-flex items-center justify-center h-10 w-10 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      handleImageUpload(file);
                      e.currentTarget.value = "";
                    }}
                  />
                  <ImagePlus className="h-4 w-4" />
                </label>
              </div>
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about Jamaican farming, crops, or agriculture..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
              />
              <Button onClick={sendMessage} disabled={loading || (!message.trim() && !imageDataUrl)}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {imageDataUrl && (
              <div className="border rounded-md p-2 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground truncate">{imageName}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => {
                      setImageDataUrl(null);
                      setImageName("");
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <img src={imageDataUrl} alt="Selected upload" className="max-h-28 w-auto rounded border" />
              </div>
            )}
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