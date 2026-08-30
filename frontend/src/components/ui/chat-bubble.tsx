"use client";

import { ReactNode } from "react";

interface ChatBubbleProps {
  type: "system" | "user" | "bot";
  avatar?: ReactNode;
  timestamp?: string;
  children: ReactNode;
}

export function ChatBubble({ type, avatar, timestamp, children }: ChatBubbleProps) {
  if (type === "user") {
    return (
      <div className="flex items-end gap-3 self-end max-w-[85%]">
        <div className="claymorphic rounded-2xl rounded-br-sm p-4 text-white relative">
          {children}
          {timestamp && (
            <span className="text-[11px] text-white/70 mt-2 block text-right">
              {timestamp}
            </span>
          )}
        </div>
        {avatar}
      </div>
    );
  }

  return (
    <div className="flex items-end gap-3 self-start max-w-[85%]">
      {avatar || (
        <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center shrink-0 border border-primary/10">
          <span className="material-symbols-outlined text-primary text-sm">eco</span>
        </div>
      )}
      <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl rounded-bl-sm p-4 shadow-[0_4px_16px_rgba(0,0,0,0.03)] relative overflow-hidden">
        <div className="absolute inset-0 border border-white/40 rounded-2xl rounded-bl-sm pointer-events-none" />
        {children}
        {timestamp && (
          <span className="text-[11px] text-on-surface-variant/60 mt-2 block">
            {timestamp}
          </span>
        )}
      </div>
    </div>
  );
}
