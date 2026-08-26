const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

/** Validate URL to prevent SSRF: only allow http/https absolute URLs. */
function validateApiUrl(url: string): string {
  // Relative URLs (starting with /) are always safe — no host to spoof
  if (url.startsWith("/")) return url;
  const parsed = new URL(url);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error(`Invalid API URL protocol: ${parsed.protocol}`);
  }
  return url;
}

export interface ChatMessage {
  text: string;
  userId: string;
}

export interface ChatResponse {
  reply: string;
  error?: string;
}

export async function sendChatMessage(message: ChatMessage): Promise<ChatResponse> {
  const url = validateApiUrl(`${API_BASE}/api/chat`);
  const res = await fetch(url, {
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
  water_state?: string | null;
  photo_type?: string | null;
  pre_verified?: number;
  audit_sample?: number;
}

export async function getReviewQueue(status?: string): Promise<PhotoReview[]> {
  const url = status
    ? validateApiUrl(`${API_BASE}/api/admin/review?status=${status}`)
    : validateApiUrl(`${API_BASE}/api/admin/review`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Review queue error: ${res.status}`);
  return res.json();
}

export async function reviewPhoto(
  photoId: string,
  status: "verified" | "rejected",
  reason?: string,
): Promise<{ ok: boolean }> {
  const url = validateApiUrl(`${API_BASE}/api/admin/review/${photoId}`);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, reason }),
  });
  if (!res.ok) throw new Error(`Review error: ${res.status}`);
  return res.json();
}

export interface PrecisionStat {
  auditReviewed: number;
  overrides: number;
  precision: number | null;
}

export async function getPrecisionStat(): Promise<PrecisionStat> {
  const url = validateApiUrl(`${API_BASE}/api/admin/precision`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Precision error: ${res.status}`);
  return res.json();
}
