import { buildArtifactCard } from "./flex-builders";

type FlexContent = {
  type: string;
  contents?: FlexContent[];
  text?: string;
  weight?: string;
  size?: string;
  wrap?: boolean;
  color?: string;
};

type FlexMessage = {
  type: "flex";
  altText: string;
  contents: FlexContent;
};

/**
 * PJ-09 — a photo was rejected. Artifact card: amber hero, "ตีกลับ" badge, the
 * reason as the title, and the retake deadline as the subtitle.
 *
 * The artifact's own sample reason is "รอบนี้เป็นช่วงเปียก แต่ในภาพน้ำแห้งแล้ว" —
 * a wet/dry mismatch, which `photo.ts` detects. Whatever the reason, it becomes
 * the title so the farmer sees the cause first.
 */
export function composeRetakeMessage(
  reason: string,
  photoType: string,
  phase: string,
): FlexMessage {
  return buildArtifactCard({
    tone: "amber",
    badge: `${photoType} · ตีกลับ`,
    hero: "ภาพยังใช้ไม่ได้ครับ",
    title: `เหตุผล: ${reason}`,
    subtitle: `ช่วยถ่ายใหม่ในช่วง ${phase} นะครับ`,
    actions: [{ label: "สอบถามเจ้าหน้าที่" }, { label: "ถ่ายใหม่", primary: true }],
  }) as unknown as FlexMessage;
}
