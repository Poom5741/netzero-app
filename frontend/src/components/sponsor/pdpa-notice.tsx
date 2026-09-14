"use client";

/**
 * PDPA CS-02 Notice — displayed on every sponsor screen.
 * Required by the client design spec for all sponsor-facing views.
 */
export function PdpaNotice() {
  return (
    <div className="bg-tertiary-container/30 border border-tertiary/20 rounded-xl p-4 mb-6 flex items-start gap-3 relative z-10">
      <span className="material-symbols-outlined text-tertiary text-[20px] mt-0.5 flex-shrink-0">info</span>
      <div className="text-body-sm text-on-surface-variant">
        <p className="font-medium text-on-surface mb-1">ประกาศคุ้มครองข้อมูลส่วนบุคคล (PDPA CS-02)</p>
        <p>
          ข้อมูลในหน้านี้แสดงเฉพาะข้อมูลที่เกี่ยวข้องกับพื้นที่ที่ท่านรับผิดชอบเท่านั้น
          ข้อมูลส่วนบุคคลของเกษตรกรได้รับการคุ้มครองตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562
          รหัส CPA ถูกใช้แทนชื่อจริงเพื่อรักษาความเป็นส่วนตัว
          ห้ามเปิดเผยข้อมูลแก่บุคคลที่สามโดยไม่ได้รับอนุญาต
        </p>
      </div>
    </div>
  );
}
