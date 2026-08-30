"use client";

interface NavItem {
  icon: string;
  label: string;
  href: string;
  active?: boolean;
}

interface BottomNavProps {
  items: NavItem[];
}

export function BottomNav({ items }: BottomNavProps) {
  return (
    <nav className="glass border-t border-white/20 px-6 py-2 flex justify-around sticky bottom-0 z-50 pb-safe" aria-label="นำทางหลัก">
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all duration-300 ${
            item.active ? "claymorphic text-white scale-110" : "text-on-surface-variant"
          }`}
        >
          <span className="material-symbols-outlined">{item.icon}</span>
          <span className="text-[10px] font-medium mt-1">{item.label}</span>
        </a>
      ))}
    </nav>
  );
}
