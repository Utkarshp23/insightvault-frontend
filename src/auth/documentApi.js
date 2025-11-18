import api from "../auth/authApi";

/**
 * Create upload intent in backend. Backend returns:
 * { documentId, storageKey, presignedUrl, presignedUrlExpiresAt, ttlSeconds, status }
 */
export async function createUploadIntent(
  { filename, mimeType, size, metadata = {} },
  idempotencyKey
) {
  const payload = {
    filename,
    mimeType,
    size,
    metadata,
  };
  const resp = await api.post("/documents", payload, {
    headers: { "Idempotency-Key": idempotencyKey },
  });
  return resp.data;
}

/** Notify backend that upload is complete. Accepts optional checksum. */
export async function completeUpload(documentId, { size, checksum } = {}) {
  const body = {};
  if (size != null) body.size = size;
  if (checksum) body.checksum = checksum;
  const resp = await api.patch(`/documents/${documentId}/complete`, body);
  return resp.data;
}
