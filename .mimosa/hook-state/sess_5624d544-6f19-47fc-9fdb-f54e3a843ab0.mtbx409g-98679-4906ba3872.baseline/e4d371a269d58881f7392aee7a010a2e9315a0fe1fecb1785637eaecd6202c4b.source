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

export function composeRetakeMessage(
  reason: string,
  photoType: string,
  phase: string,
): FlexMessage {
  return {
    type: "flex",
    altText: `ภาพถ่ายของคุณถูกปฏิเสธ: ${reason}`,
    contents: {
      type: "bubble",
      contents: [
        { type: "text", text: "📸 ภาพถ่ายถูกปฏิเสธ", weight: "bold", size: "lg" },
        { type: "text", text: `เหตุผล: ${reason}`, size: "sm", wrap: true, color: "#dc3545" },
        { type: "text", text: `ประเภทภาพ: ${photoType}`, size: "sm", wrap: true },
        {
          type: "text",
          text: `กรุณาถ่ายใหม่ในช่วง ${phase}`,
          size: "sm",
          wrap: true,
        },
      ],
    },
  };
}
