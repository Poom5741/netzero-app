export type ConsentField = "pdpa" | "data_collection" | "photo_sharing" | "carbon_project";

export type ConsentStatus = Record<ConsentField, boolean>;

type FlexContent = {
  type: string;
  contents?: FlexContent[];
  text?: string;
  weight?: string;
  size?: string;
  wrap?: boolean;
  margin?: string;
  separator?: boolean;
  action?: unknown;
  consentKey?: string;
};

type FlexMessage = {
  type: "flex";
  altText: string;
  contents: FlexContent;
};

const CONSENT_LABELS: Record<ConsentField, string> = {
  pdpa: "同意 PDPA คุ้มครองข้อมูลส่วนบุคคล",
  data_collection: "ยอมรับการเก็บข้อมูลการเกษตร",
  photo_sharing: "ยอมรับการแชร์รูปถ่ายหลักฐาน",
  carbon_project: "เข้าร่วมโครงการคาร์บอนเครดิต",
};

/**
 * Build a 4-in-1 consent Flex Message card.
 */
export function buildConsentCard(): FlexMessage {
  const checkboxes = (Object.entries(CONSENT_LABELS) as [ConsentField, string][]).map(
    ([key, label]) => ({
      type: "box" as const,
      layout: "horizontal" as const,
      contents: [{ type: "text", text: `[ ] ${label}`, size: "sm", wrap: true }],
      // Store the consent key for programmatic identification
      consentKey: key,
    }),
  );

  return {
    type: "flex",
    altText: "กรุณาตอบรับเงื่อนไข 4 ข้อ",
    contents: {
      type: "bubble",
      contents: [
        {
          type: "text",
          text: "เงื่อนไขการใช้งาน",
          weight: "bold",
          size: "lg",
        },
        { type: "text", text: "─", separator: true, margin: "sm" },
        ...checkboxes,
        { type: "text", text: "─", separator: true, margin: "md" },
        {
          type: "text",
          text: "พิมพ์ '同意' เพื่อยอมรับเงื่อนไขทั้งหมด",
          size: "xs",
          wrap: true,
          margin: "md",
        },
      ],
    },
  };
}

/**
 * Check if all 4 consents are accepted.
 * consent_ok = true only when every field is true.
 */
export function hasAllConsents(status: ConsentStatus): boolean {
  return status.pdpa && status.data_collection && status.photo_sharing && status.carbon_project;
}
