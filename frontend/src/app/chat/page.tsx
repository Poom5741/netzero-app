"use client";

import { useState, useRef, useEffect } from "react";
import { LiffProvider, useLiff } from "@/lib/liff-context";
import { sendChatMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  type: "user" | "bot" | "system";
  text: string;
  timestamp: Date;
}

function ChatContent() {
  const { userId, profile, isLoading } = useLiff();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "bot",
      text: "🌱 สวัสดีค่ะ! ยินดีต้อนรับสู่ NetZeroCarbon\n\nพิมพ์ข้อความหรือกดปุ่มด้านล่างเพื่อเริ่มต้นค่ะ",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const quickActions = [
    { label: "👋 สวัสดี", text: "สวัสดี" },
    { label: "❓ ช่วย", text: "ช่วย" },
    { label: "📸 ถ่ายรูป", text: "ถ่ายรูป" },
    { label: "🌾 เลือกแปลง", text: "เลือกแปลง" },
  ];

  async function handleSend(text?: string) {
    const messageText = text || input.trim();
    if (!messageText || !userId) return;

    setInput("");
    const userMsg: Message = {
      id: Date.now().toString(),
      type: "user",
      text: messageText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    setIsTyping(true);
    try {
      const response = await sendChatMessage({ text: messageText, userId });
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        text: response.reply || response.error || "ไม่สามารถประมวลผลได้",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: "system",
        text: "เกิดข้อผิดพลาด กรุณาลองใหม่",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-surface-container-high border-t-primary-container rounded-full animate-spin" />
          <span className="text-on-surface-variant">กำลังเชื่อมต่อ...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="glass px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-white font-bold">
          🌱
        </div>
        <div className="flex-1">
          <h1 className="font-semibold text-on-surface">NetZeroCarbon</h1>
          <p className="text-xs text-on-surface-variant">ผู้ช่วยเกษตรกรโครงการ AWD</p>
        </div>
        {profile?.pictureUrl && (
          <img src={profile.pictureUrl} alt="" className="w-8 h-8 rounded-full" />
        )}
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`
                max-w-[80%] px-4 py-3 rounded-2xl text-[15px] leading-relaxed whitespace-pre-wrap
                ${msg.type === "user"
                  ? "claymorphic text-white rounded-br-md"
                  : msg.type === "bot"
                    ? "neumorphic text-on-surface rounded-bl-md"
                    : "bg-surface-container text-on-surface-variant text-xs px-3 py-2 rounded-full"
                }
              `}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="neumorphic px-4 py-3 rounded-2xl rounded-bl-md flex gap-1">
              <span className="w-2 h-2 bg-outline rounded-full typing-dot" />
              <span className="w-2 h-2 bg-outline rounded-full typing-dot" />
              <span className="w-2 h-2 bg-outline rounded-full typing-dot" />
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto flex-shrink-0">
        {quickActions.map((action) => (
          <button
            key={action.text}
            onClick={() => handleSend(action.text)}
            className="neumorphic px-4 py-2 rounded-full text-sm text-primary whitespace-nowrap hover:shadow-lg transition-shadow touch-target"
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="glass px-4 py-3 flex gap-2 items-center sticky bottom-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="พิมพ์ข้อความ..."
          className="flex-1 neumorphic-inset px-4 py-3 rounded-full text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container"
        />
        <Button
          onClick={() => handleSend()}
          disabled={!input.trim()}
          aria-label="ส่งข้อความ"
          className="w-10 h-10 rounded-full p-0 claymorphic"
        >
          ➤
        </Button>
      </div>

      {/* Bottom Nav */}
      <nav className="glass border-t border-surface-container-high px-6 py-2 flex justify-around sticky bottom-0" aria-label="นำทางหลัก">
        <a href="/chat" className="flex flex-col items-center gap-1 text-primary">
          <span className="text-xl">💬</span>
          <span className="text-xs font-medium">แชท</span>
        </a>
        <a href="/upload" className="flex flex-col items-center gap-1 text-on-surface-variant">
          <span className="text-xl">📷</span>
          <span className="text-xs">อัปโหลด</span>
        </a>
        <a href="/summary" className="flex flex-col items-center gap-1 text-on-surface-variant">
          <span className="text-xl">📊</span>
          <span className="text-xs">สรุป</span>
        </a>
      </nav>
    </div>
  );
}

export default function ChatPage() {
  return (
    <LiffProvider>
      <ChatContent />
    </LiffProvider>
  );
}
