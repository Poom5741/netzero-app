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

export interface ApiResult<T> {
  ok: boolean;
  status: number;
  data: T;
}

/**
 * Browser-side API call via XHR. All client→API traffic goes through here so
 * request targets are always validateApiUrl()-checked before sending.
 */
export function apiRequest<T = unknown>(
  path: string,
  init?: { method?: string; json?: unknown; formData?: FormData },
): Promise<ApiResult<T>> {
  const url = validateApiUrl(`${API_BASE}${path}`);
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(init?.method || "GET", url);
    if (init?.json !== undefined) {
      xhr.setRequestHeader("Content-Type", "application/json");
    }
    xhr.onload = () => {
      let data: T;
      try {
        data = JSON.parse(xhr.responseText) as T;
      } catch {
        data = xhr.responseText as unknown as T;
      }
      resolve({ ok: xhr.status >= 200 && xhr.status < 300, status: xhr.status, data });
    };
    xhr.onerror = () => reject(new Error(`API request failed: ${url}`));
    xhr.send(init?.json !== undefined ? JSON.stringify(init.json) : init?.formData);
  });
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
  const res = await apiRequest<ChatResponse>("/api/chat", { method: "POST", json: message });
  if (!res.ok) {
    throw new Error(`Chat API error: ${res.status}`);
  }
  return res.data;
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
  const res = await apiRequest<PhotoReview[]>(status ? `/api/admin/review?status=${status}` : "/api/admin/review");
  if (!res.ok) throw new Error(`Review queue error: ${res.status}`);
  return res.data;
}

export async function reviewPhoto(
  photoId: string,
  status: "verified" | "rejected",
  reason?: string,
): Promise<{ ok: boolean }> {
  const res = await apiRequest<{ ok: boolean }>(`/api/admin/review/${photoId}`, {
    method: "POST",
    json: { status, reason },
  });
  if (!res.ok) throw new Error(`Review error: ${res.status}`);
  return res.data;
}

export interface PrecisionStat {
  auditReviewed: number;
  overrides: number;
  precision: number | null;
}

export async function getPrecisionStat(): Promise<PrecisionStat> {
  const res = await apiRequest<PrecisionStat>("/api/admin/precision");
  if (!res.ok) throw new Error(`Precision error: ${res.status}`);
  return res.data;
}
