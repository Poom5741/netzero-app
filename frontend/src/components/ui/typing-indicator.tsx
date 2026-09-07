export function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 self-start">
      <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center shrink-0 border border-primary/10">
        <span className="material-symbols-outlined text-primary text-sm">eco</span>
      </div>
      <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl rounded-bl-sm p-4 shadow-[0_4px_16px_rgba(0,0,0,0.03)] relative overflow-hidden flex gap-1">
        <div className="absolute inset-0 border border-white/40 rounded-2xl rounded-bl-sm pointer-events-none" />
        <span className="w-2 h-2 bg-outline rounded-full typing-dot relative z-10" />
        <span className="w-2 h-2 bg-outline rounded-full typing-dot relative z-10" />
        <span className="w-2 h-2 bg-outline rounded-full typing-dot relative z-10" />
      </div>
    </div>
  );
}
