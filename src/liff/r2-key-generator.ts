/**
 * R2 Object Key Generator
 *
 * Generates safe, server-controlled object keys for document uploads.
 * Pattern: documents/{farmer_id}/{doc_type}/{timestamp}_{uuid}.{ext}
 *
 * This prevents path traversal attacks and ensures unique filenames.
 */

/**
 * Extract file extension from filename.
 *
 * @param filename - Original filename (e.g., "document.pdf")
 * @returns Extension without dot (e.g., "pdf"), or "bin" if no extension
 */
function extractExtension(filename: string): string {
  const parts = filename.split(".");
  if (parts.length < 2) {
    return "bin";
  }
  return parts[parts.length - 1]?.toLowerCase() || "bin";
}

/**
 * Generate a safe R2 object key for document storage.
 *
 * Pattern: documents/{farmer_id}/{doc_type}/{timestamp}_{uuid}.{ext}
 *
 * Security properties:
 * - No client-controlled path segments (prevents path traversal)
 * - Unique filenames (timestamp + UUID prevents collisions)
 * - Organized by farmer and document type (easy retrieval)
 * - Extension preserved (correct MIME type on download)
 *
 * @param farmerId - Farmer identifier (e.g., "farmer_a37e7502")
 * @param docType - Document type code (e.g., "DOC-01", "DOC-03", "DOC-06")
 * @param originalFilename - Original filename from upload (e.g., "land-deed.pdf")
 * @returns Safe R2 object key (e.g., "documents/farmer_a37e7502/DOC-01/1726656000_550e8400-e29b-41d4-a716-446655440000.pdf")
 *
 * @example
 * ```typescript
 * const key = generateObjectKey('farmer_123', 'DOC-01', 'land-deed.pdf');
 * // Returns: "documents/farmer_123/DOC-01/1726656000_550e8400-e29b-41d4-a716-446655440000.pdf"
 * ```
 */
export function generateObjectKey(
  farmerId: string,
  docType: string,
  originalFilename: string,
): string {
  const timestamp = Date.now();
  const uuid = crypto.randomUUID();
  const ext = extractExtension(originalFilename);

  // Sanitize inputs to prevent path traversal
  // Remove any path separators and normalize
  const safeFarmerId = farmerId.replace(/[/\\]/g, "_");
  const safeDocType = docType.replace(/[/\\]/g, "_");

  return `documents/${safeFarmerId}/${safeDocType}/${timestamp}_${uuid}.${ext}`;
}

/**
 * Parse an R2 object key to extract components.
 *
 * @param key - R2 object key (e.g., "documents/farmer_123/DOC-01/1726656000_uuid.pdf")
 * @returns Parsed components or null if invalid format
 */
export function parseObjectKey(key: string): {
  farmerId: string;
  docType: string;
  timestamp: number;
  uuid: string;
  extension: string;
} | null {
  const match = key.match(/^documents\/([^/]+)\/([^/]+)\/(\d+)_([a-f0-9-]+)\.([a-z0-9]+)$/i);

  if (!match) {
    return null;
  }

  const [, farmerId, docType, timestampStr, uuid, extension] = match;

  return {
    farmerId: farmerId!,
    docType: docType!,
    timestamp: parseInt(timestampStr!, 10),
    uuid: uuid!,
    extension: extension!,
  };
}
