type CameraInput = {
  gpsLat: number;
  gpsLng: number;
  gpsAccuracy: number | undefined;
  photoDataUrl: string;
};

type PhotoMetadata = {
  id: string;
  gps_lat: number;
  gps_lng: number;
  gps_accuracy: number | null;
  photo_data_url: string;
  taken_at: string;
};

function generateId(): string {
  return `photo_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function capturePhotoMetadata(input: CameraInput): PhotoMetadata {
  return {
    id: generateId(),
    gps_lat: input.gpsLat,
    gps_lng: input.gpsLng,
    gps_accuracy: input.gpsAccuracy ?? null,
    photo_data_url: input.photoDataUrl,
    taken_at: new Date().toISOString(),
  };
}
