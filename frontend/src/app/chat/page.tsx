"use client";

import { useState, useRef, useEffect } from "react";
import { LiffProvider, useLiff } from "@/lib/liff-context";
import { sendChatMessage } from "@/lib/api";
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
    { icon: "chat_bubble", label: "แชท", href: "/chat", active: true },
    { icon: "cloud_upload", label: "อัปโหลด", href: "/upload" },
    { icon: "analytics", label: "สรุป", href: "/summary" },
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
            <img alt="NetZeroCarbon Logo" className="h-8 w-auto object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBczoX7NrPcRVpSCyIRt8QCTQ4tQTNdiw3X3JqXh_YDY30hP8yC8iAP1jlNbEM6OTCf9MdvcG4TpBZAOkkwonGSQl10ndDAgImtKnfhG7XhDlJA0ARhNqzWf24YrTl9V9yfQE-lnKGeNAFh1vwAflUw2ZMU8I7k8aKo2tu6zARyM_V7bz7KbhcueZA9o1DpQ3QrJnN7k_G5zSBao3cDGj5tNqLtSG5ZpX15l11xUdxhnZWlQQeTj6CvIA" />
            <span className="font-headline-md text-headline-md text-on-surface truncate">Chat Hub</span>
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
              <p className="text-body-md leading-relaxed whitespace-pre-wrap">{msg.text}</p>
            </ChatBubble>
          ))}

          {isTyping && <TypingIndicator />}

          {/* Quick Actions */}
          <QuickActions actions={quickActions} />

          <div ref={chatEndRef} />
        </div>
      </main>

      {/* Floating Input Bar (Neumorphic) */}
      <div className="p-4 bg-transparent pb-safe relative z-10">
        <div className="bg-surface-container-lowest rounded-[24px] p-2 flex items-center gap-2 shadow-[5px_5px_15px_#D1D9E6,-5px_-5px_15px_#FFFFFF] relative z-20">
          <button className="w-10 h-10 flex items-center justify-center rounded-full text-primary hover:bg-primary/10 transition-colors shrink-0" aria-label="เพิ่มไฟล์">
            <span className="material-symbols-outlined">add_circle</span>
          </button>
          <div className="flex-1 bg-surface-container-low rounded-xl px-4 py-3 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),inset_-2px_-2px_5px_rgba(255,255,255,0.5)]">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="พิมพ์ข้อความที่นี่..."
              aria-label="พิมพ์ข้อความ"
              className="w-full bg-transparent border-none outline-none text-body-md text-on-surface placeholder:text-on-surface-variant/50"
            />
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            aria-label="ส่งข้อความ"
            className="w-12 h-12 rounded-full claymorphic flex items-center justify-center text-white shrink-0 transform transition-transform active:scale-95 disabled:opacity-50 disabled:grayscale"
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
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
