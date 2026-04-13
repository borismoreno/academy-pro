import api from './api';
import type { ApiResponse } from '@/types';

interface PresignedUrlResponse {
  presignedUrl: string;
  publicUrl: string;
  key: string;
}

async function getPresignedUrl(
  fileName: string,
  contentType: string,
): Promise<PresignedUrlResponse> {
  const response = await api.post<ApiResponse<PresignedUrlResponse>>(
    '/storage/presigned-url',
    { fileName, contentType },
  );
  return response.data.data;
}

async function uploadToS3(
  presignedUrl: string,
  file: File,
  contentType: string,
): Promise<void> {
  const res = await fetch(presignedUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': contentType },
  });
  if (!res.ok) {
    throw new Error(`S3 upload failed: ${res.status}`);
  }
}

export async function uploadFile(file: File): Promise<string> {
  const { presignedUrl, publicUrl } = await getPresignedUrl(file.name, file.type);
  await uploadToS3(presignedUrl, file, file.type);
  return publicUrl;
}
