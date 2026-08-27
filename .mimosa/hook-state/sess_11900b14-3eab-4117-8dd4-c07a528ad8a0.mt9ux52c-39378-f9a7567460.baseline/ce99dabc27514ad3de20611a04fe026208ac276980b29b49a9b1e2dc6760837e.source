import type { LineWebhookEvent } from "./webhook";

type FlexContent = {
  type: string;
  contents?: FlexContent[];
  text?: string;
  weight?: string;
  size?: string;
  wrap?: boolean;
  margin?: string;
  separator?: boolean;
};

type FlexMessage = {
  type: "flex";
  altText: string;
  contents: FlexContent;
};

type ReplyFn = (token: string, msg: FlexMessage) => Promise<{ status: number }>;

/**
 * Build the welcome Flex Message sent on LINE follow.
 * Introduces NetZeroCarbon and mentions PDPA consent.
 */
export function buildWelcomeFlex(): FlexMessage {
  return {
    type: "flex",
    altText: "ยินดีต้อนรับสู่ NetZeroCarbon",
    contents: {
      type: "bubble",
      contents: [
        {
          type: "text",
          text: "NetZeroCarbon",
          weight: "bold",
          size: "xl",
        },
        { type: "text", text: "ลดคาร์bonจากนาข้าว", size: "sm", wrap: true },
        { type: "text", text: "─", separator: true },
        {
          type: "text",
          text: "ช่วยลดการปล่อยก๊าซเรือนกระจกจากการทำนา",
          size: "md",
          wrap: true,
          margin: "md",
        },
        {
          type: "text",
          text: "Scientifically verified carbon credits",
          size: "sm",
          wrap: true,
          margin: "sm",
        },
        { type: "text", text: "─", separator: true, margin: "md" },
        {
          type: "text",
          text: "PDPA: ข้อมูลของคุณได้รับการคุ้มครองตาม พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล",
          size: "xs",
          wrap: true,
          margin: "md",
        },
      ],
    },
  };
}

/**
 * Return an event handler that replies with the welcome Flex on follow.
 */
export function createWelcomeHandler(replyFn: ReplyFn) {
  return async (event: LineWebhookEvent) => {
    if (event.type !== "follow") return;
    const msg = buildWelcomeFlex();
    await replyFn(event.replyToken, msg);
  };
}
