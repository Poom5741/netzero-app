/**
 * LINE Messaging API reply helper.
 * Uses the Channel Access Token to send messages back to users.
 */

type LineMessage = {
  type: string;
  text?: string;
  altText?: string;
  contents?: unknown;
};

export async function replyMessage(
  accessToken: string,
  replyToken: string,
  messages: LineMessage[],
): Promise<{ status: number; statusText: string; body: string }> {
  const res = await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ replyToken, messages }),
  });

  const body = await res.text();
  console.log(`LINE reply: status=${res.status} body=${body.substring(0, 200)}`);
  return { status: res.status, statusText: res.statusText, body };
}

export async function pushMessage(
  accessToken: string,
  userId: string,
  messages: LineMessage[],
): Promise<{ status: number; statusText: string; body: string }> {
  const res = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ to: userId, messages }),
  });

  const body = await res.text();
  console.log(`LINE push: status=${res.status} body=${body.substring(0, 200)}`);
  return { status: res.status, statusText: res.statusText, body };
}
