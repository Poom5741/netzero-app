"use client";

import { Button } from "@/components/ui/button";

type Verdict = "refused" | "flagged" | "pre_verified" | "queued" | "failure";

interface VerdictResultProps {
  verdict: Verdict;
  reason?: string;
  water_state?: string;
  onRetake?: () => void;
}

const WATER_STATE_TH: Record<string, string> = {
  flooded: "ขั้งน้ำ",
  dry: "ปล่อยแห้ง",
};

export function VerdictResult({ verdict, reason, water_state, onRetake }: VerdictResultProps) {
  switch (verdict) {
    case "refused":
      return (
        <div className="flex flex-col items-center gap-4 p-6" data-testid="verdict-refused">
          <span className="material-symbols-outlined text-error text-5xl">cancel</span>
          <p className="text-body-md font-medium text-on-surface text-center">
            {reason || "ไม่ผ่านการตรวจสอบ"}
          </p>
          <p className="text-label-md text-on-surface-variant text-center">
            กรุณาถ่ายภาพใหม่ตามคำแนะนำ
          </p>
          {onRetake && (
            <Button onClick={onRetake} className="claymorphic w-full">
              <span className="material-symbols-outlined">photo_camera</span>
              <span>ถ่ายภาพใหม่</span>
            </Button>
          )}
        </div>
      );

    case "flagged":
      return (
        <div className="flex flex-col items-center gap-4 p-6" data-testid="verdict-flagged">
          <span className="material-symbols-outlined text-warning text-5xl">hourglass_empty</span>
          <p className="text-body-md font-medium text-on-surface text-center">รอเจ้าหน้าที่ตรวจ</p>
          <p className="text-label-md text-on-surface-variant text-center">
            ภาพต้องการการตรวจสอบจากเจ้าหน้าที่จะติดต่อกลับ
          </p>
        </div>
      );

    case "pre_verified":
      return (
        <div className="flex flex-col items-center gap-4 p-6" data-testid="verdict-pre_verified">
          <span className="material-symbols-outlined text-primary text-5xl">check_circle</span>
          <p className="text-body-md font-medium text-on-surface text-center">
            ยืนยันการอัปโหลดสำเร็จ
          </p>
          {water_state && (
            <p className="text-label-md text-on-surface-variant text-center">
              สถานะน้ำ: {WATER_STATE_TH[water_state] || water_state}
            </p>
          )}
        </div>
      );

    case "queued":
      return (
        <div className="flex flex-col items-center gap-4 p-6" data-testid="verdict-queued">
          <span className="material-symbols-outlined text-primary text-5xl">inbox</span>
          <p className="text-body-md font-medium text-on-surface text-center">
            รับภาพแล้ว — เจ้าหน้าที่จะตรวจสอบ
          </p>
          <p className="text-label-md text-on-surface-variant text-center">
            เจ้าหน้าที่จะตรวจสอบภาพของท่าน
          </p>
        </div>
      );

    case "failure":
      return (
        <div className="flex flex-col items-center gap-4 p-6" data-testid="verdict-failure">
          <span className="material-symbols-outlined text-error text-5xl">error</span>
          <p className="text-body-md font-medium text-on-surface text-center">
            เกิดข้อผิดพลาด กรุณาลองใหม่
          </p>
          <p className="text-label-md text-on-surface-variant text-center">
            หากปัญหา ยังคงอยู่ กรุณาติดต่อเจ้าหน้าที่
          </p>
        </div>
      );
  }
}
