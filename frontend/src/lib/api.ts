const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

export interface ChatMessage {
  text: string;
  userId: string;
}

export interface ChatResponse {
  reply: string;
  error?: string;
}

export async function sendChatMessage(message: ChatMessage): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message),
  });

  if (!res.ok) {
    throw new Error(`Chat API error: ${res.status}`);
  }

  return res.json();
}

export interface PhotoReview {
  id: string;
  plot_id: string;
  ai_status: string;
  ai_label: string | null;
  ai_reason: string | null;
  ai_confidence: number;
  admin_status: string;
  photo_url: string;
}

export async function getReviewQueue(status?: string): Promise<PhotoReview[]> {
  const url = status
    ? `${API_BASE}/api/admin/review?status=${status}`
    : `${API_BASE}/api/admin/review`;
  const res = await fetch(url);
  return res.json();
}

export async function reviewPhoto(
  photoId: string,
  status: "verified" | "rejected",
  reason?: string,
): Promise<{ ok: boolean }> {
  const res = await fetch(`${API_BASE}/api/admin/review/${photoId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, reason }),
  });
  return res.json();
}
