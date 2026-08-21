"use client";

import { useState, useRef, useEffect } from "react";
import { LiffProvider, useLiff } from "@/lib/liff-context";
import { sendChatMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ChatBubble } from "@/components/ui/chat-bubble";
import { QuickActions } from "@/components/ui/quick-actions";
import { BottomNav } from "@/components/ui/bottom-nav";
import { TypingIndicator } from "@/components/ui/typing-indicator";

interface Message {
  id: string;
  type: "user" | "bot";
  text: string;
  timestamp: string;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
}

function ChatContent() {
  const { userId, profile, isLoading } = useLiff();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "bot",
      text: "สวัสดีครับ! 🌿 ยินดีต้อนรับสู่ NetZeroCarbon\nวันนี้คุณต้องการให้ผมช่วยบันทึกข้อมูลแปลงนา หรือตรวจสอบยอดคาร์บอนเครดิตครับ?",
      timestamp: formatTime(new Date()),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const quickActions = [
    { icon: "add_a_photo", label: "ส่งรูปถ่าย", onClick: () => handleSend("ถ่ายรูป") },
    { icon: "summarize", label: "สรุปฤดูกาล", onClick: () => handleSend("สรุปฤดู") },
    { icon: "help", label: "สอบถาม", onClick: () => handleSend("ช่วย") },
  ];

  const navItems = [
    { icon: "chat", label: "แชท", href: "/chat", active: true },
    { icon: "photo_camera", label: "อัปโหลด", href: "/upload" },
    { icon: "bar_chart", label: "สรุป", href: "/summary" },
  ];

  async function handleSend(text?: string) {
    const messageText = text || input.trim();
    if (!messageText || !userId) return;

    setInput("");
    const userMsg: Message = {
      id: Date.now().toString(),
      type: "user",
      text: messageText,
      timestamp: formatTime(new Date()),
    };
    setMessages((prev) => [...prev, userMsg]);

    setIsTyping(true);
    try {
      const response = await sendChatMessage({ text: messageText, userId });
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        text: response.reply || response.error || "ไม่สามารถประมวลผลได้",
        timestamp: formatTime(new Date()),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        text: "เกิดข้อผิดพลาด กรุณาลองใหม่",
        timestamp: formatTime(new Date()),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-surface-container-low">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-surface-container-highest border-t-primary-container rounded-full animate-spin" />
          <span className="text-on-surface-variant">กำลังเชื่อมต่อ...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-surface-container-low">
      {/* Glassmorphic Header */}
      <header className="fixed top-0 w-full z-50 glass pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-sm">eco</span>
            </div>
            <span className="font-semibold text-lg text-on-surface">Chat Hub</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center" aria-label="การแจ้งเตือน">
              <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
            </button>
            {profile?.pictureUrl ? (
              <img alt="Profile" className="w-8 h-8 rounded-full object-cover border border-white" src={profile.pictureUrl} />
            ) : (
              <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center">
                <span className="text-xs text-on-secondary-container font-medium">
                  {profile?.displayName?.charAt(0) || "U"}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 pt-16 pb-24 px-5 bg-surface-container-low">
        <div className="flex flex-col w-full min-h-[calc(100vh-140px)] overflow-y-auto px-4 py-4 space-y-6">
          {messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              type={msg.type}
              timestamp={msg.timestamp}
              avatar={
                msg.type === "user" && profile?.pictureUrl ? (
                  <img alt="Profile" className="w-8 h-8 rounded-full object-cover shrink-0 shadow-sm" src={profile.pictureUrl} />
                ) : undefined
              }
            >
              <p className="text-[16px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
            </ChatBubble>
          ))}

          {isTyping && <TypingIndicator />}

          <div ref={chatEndRef} />
        </div>
      </main>

      {/* Quick Actions */}
      <div className="px-5 pb-2 flex-shrink-0">
        <QuickActions actions={quickActions} />
      </div>

      {/* Input Bar */}
      <div className="glass px-5 py-3 flex gap-2 items-center sticky bottom-14 z-40 border-t border-white/20">
        <button className="w-10 h-10 rounded-full neumorphic flex items-center justify-center flex-shrink-0" aria-label="เพิ่มไฟล์">
          <span className="material-symbols-outlined text-on-surface-variant">add</span>
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="พิมพ์ข้อความ..."
          aria-label="พิมพ์ข้อความ"
          className="flex-1 neumorphic-inset px-4 py-3 rounded-full text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container text-[16px]"
        />
        <Button
          onClick={() => handleSend()}
          disabled={!input.trim()}
          aria-label="ส่งข้อความ"
          className="w-10 h-10 rounded-full p-0 claymorphic flex-shrink-0"
        >
          <span className="material-symbols-outlined text-white">send</span>
        </Button>
      </div>

      {/* Bottom Nav */}
      <BottomNav items={navItems} />
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
