"use client";

interface QuickAction {
  icon: string;
  label: string;
  onClick: () => void;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 px-1 snap-x no-scrollbar self-start pl-11">
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={action.onClick}
          className="snap-start shrink-0 px-4 py-2 bg-surface-container-highest rounded-full text-label-md text-on-surface-variant hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm active:scale-95 flex items-center gap-2 touch-target"
        >
          <span className="material-symbols-outlined text-sm">{action.icon}</span>
          {action.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Returns state-aware quick actions based on conversation state.
 * Before consent (welcome/phone/pending): consent + ask.
 * After identification (chat/confirm_draft/select_plot): summary + upload + ask.
 */
export function getQuickActions(
  state: string,
  onSend: (text: string) => void,
  onNavigate: (href: string) => void,
): QuickAction[] {
  if (state === "welcome" || state === "phone" || state === "pending") {
    return [
      { icon: "check_circle", label: "ยอมรับเงื่อนไข", onClick: () => onSend("ยอมรับ") },
      { icon: "link", label: "เริ่มผูกบัญชี", onClick: () => onSend("เริ่มผูกบัญชี") },
      { icon: "help", label: "ติดต่อ / วิธีใช้งาน", onClick: () => onNavigate("/contact") },
    ];
  }
  return [
    { icon: "summarize", label: "แดชบอร์ดของฉัน", onClick: () => onNavigate("/summary") },
    { icon: "landscape", label: "แปลงของฉัน", onClick: () => onSend("แปลงของฉัน") },
    { icon: "add_a_photo", label: "กล้องบังคับ", onClick: () => onNavigate("/upload") },
    { icon: "help", label: "ติดต่อ / วิธีใช้งาน", onClick: () => onNavigate("/contact") },
  ];
}
