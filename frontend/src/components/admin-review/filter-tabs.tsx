"use client";

export interface FilterTab {
  key: string;
  label: string;
  count?: number;
}

interface FilterTabsProps {
  tabs: FilterTab[];
  activeKey: string;
  onChange: (key: string) => void;
}

/**
 * Segmented filter tabs (Thai) for the admin review queue.
 * Renders a neumorphic pill bar.
 */
export function FilterTabs({ tabs, activeKey, onChange }: FilterTabsProps) {
  return (
    <div className="flex gap-2 bg-surface-container rounded-full p-1" role="tablist">
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all touch-target ${
              isActive
                ? "bg-primary text-on-primary shadow-md"
                : "text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1 opacity-70">({tab.count})</span>
            )}
          </button>
        );
      })}
    </div>
  );
}