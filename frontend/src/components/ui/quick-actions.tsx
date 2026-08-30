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
