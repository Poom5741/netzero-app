/**
 * Extract EXIF timestamp from photo.
 * ponytail: ceiling is real EXIF parsing with exifr; add when exifr is installed.
 * For now, returns null (no EXIF library installed).
 */
export function extractExifTimestamp(_file: File | Buffer): Date | null {
  return null;
}
