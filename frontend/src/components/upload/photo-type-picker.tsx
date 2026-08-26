"use client";

interface PhotoTypePickerProps {
  value: string | null;
  onChange: (type: string) => void;
}

const TYPES = [
  { id: "prepare", label: "เตรียมดิน", icon: "landscape" },
  { id: "wetdry", label: "ท่อน้ำ/เปียก-แห้ง", icon: "water_drop" },
  { id: "harvest", label: "เก็บเกี่ยว", icon: "grass" },
] as const;

export function PhotoTypePicker({ value, onChange }: PhotoTypePickerProps) {
  return (
    <div className="flex flex-col gap-2" role="radiogroup" aria-label="ประเภทรูป">
      <span className="text-sm font-medium text-on-surface">ประเภทรูปภาพ</span>
      <div className="grid grid-cols-3 gap-2">
        {TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={value === t.id}
            onClick={() => onChange(t.id)}
            className={`
              flex flex-col items-center gap-1 p-3 rounded-xl
              min-h-[64px] touch-target transition-all
              ${value === t.id
                ? "bg-primary-container text-on-primary-container font-semibold"
                : "neumorphic text-on-surface-variant"}
            `}
          >
            <span className="material-symbols-outlined text-xl">{t.icon}</span>
            <span className="text-xs leading-tight text-center">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
