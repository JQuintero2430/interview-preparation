import type { ApiClient } from './http';

export type PresignedUpload = { uploadUrl: string; key: string; headers: Record<string, string> };

export class UploadError extends Error {
  readonly status: number;
  constructor(status: number) {
    super(`Upload to storage failed: HTTP ${status}`);
    this.name = 'UploadError';
    this.status = status;
  }
}

/**
 * Presigned upload in three steps. None of them sends the file through the Spring API.
 * 1. ask the API for a short-lived signed URL  2. PUT the bytes straight to S3  3. tell the API it is done.
 * The routes `/api/uploads` and `/api/uploads/confirm` are NOT in examples/spring-api; they are the contract
 * module 24.11 proposes.
 */
export async function uploadFile(client: ApiClient, file: File): Promise<{ key: string }> {
  const presigned = await client.request<PresignedUpload>('/api/uploads', {
    method: 'POST',
    body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size }),
  });

  // Plain fetch, not `client`: S3 must not receive our bearer token (it would break the signature
  // and leak the token to another origin), and the signed headers must be sent exactly as signed.
  const put = await fetch(presigned.uploadUrl, { method: 'PUT', headers: presigned.headers, body: file });
  if (!put.ok) throw new UploadError(put.status);

  await client.request('/api/uploads/confirm', { method: 'POST', body: JSON.stringify({ key: presigned.key }) });
  return { key: presigned.key };
}
