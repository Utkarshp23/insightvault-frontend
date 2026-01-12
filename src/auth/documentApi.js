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

/**
 * List documents with pagination.
 * page is 0-indexed.
 * Returns: { items: [...], page, size, total }
 */
export async function listDocuments(page = 0, size = 10) {
  const resp = await api.get("/documents", {
    params: { page, size },
  });
  return resp.data;
}

/**
 * Get document metadata (and optionally a download URL).
 */
export async function getDocument(documentId, download = false) {
  const resp = await api.get(`/documents/${documentId}`, {
    params: { download },
  });
  return resp.data;
}

/**
 * Delete a document
 */
export async function deleteDocument(documentId) {
  await api.delete(`/documents/${documentId}`);
}

export async function searchDocuments(query, page = 0, size = 10) {

  
  // Let's rely on the caller to provide ownerId for now.
  const resp = await api.get("/search", {
    params: { query, page, size }, // Add ownerId here if your controller requires it strictly from param
  });
  return resp.data;
}
