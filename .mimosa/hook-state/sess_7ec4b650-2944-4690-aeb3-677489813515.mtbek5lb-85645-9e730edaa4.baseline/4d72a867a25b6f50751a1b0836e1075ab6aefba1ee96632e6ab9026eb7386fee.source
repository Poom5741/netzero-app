"use client";

interface PrecisionCardProps {
  auditReviewed: number;
  overrides: number;
  precision: number | null;
}

export function PrecisionCard({ auditReviewed, overrides, precision }: PrecisionCardProps) {
  return (
    <div className="neumorphic p-4 rounded-xl" data-testid="precision-card">
      <h3 className="text-label-md font-semibold text-on-surface-variant mb-2">
        ความแม่นยำ AI Pre-Verify
      </h3>
      {precision === null ? (
        <p className="text-body-md text-on-surface-variant">รอข้อมูลการตรวจตัวอย่าง</p>
      ) : (
        <>
          <p className="text-headline-lg font-bold text-primary">
            {Math.round(precision * 100)}%
          </p>
          <p className="text-label-sm text-on-surface-variant mt-1">
            ตรวจแล้ว {auditReviewed} รายการ | ยกเลิก {overrides} รายการ
          </p>
        </>
      )}
    </div>
  );
}
