"use client";

import { apiRequest } from "./api";

export type UploadVerdict = "refused" | "flagged" | "pre_verified" | "queued" | "failure";

export interface UploadResponse {
  id?: string;
  photo_url?: string;
  verdict: UploadVerdict;
  reason?: string;
  photo_type?: string;
  water_state?: string;
  ai_confidence?: number;
}

export async function uploadPhoto(formData: FormData): Promise<UploadResponse> {
  const res = await apiRequest<UploadResponse>("/api/photo/upload", { method: "POST", formData });

  if (!res.ok) {
    throw new Error((res.data as { error?: string })?.error || "Upload failed");
  }

  return res.data;
}

export function getGpsLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    });
  });
}
