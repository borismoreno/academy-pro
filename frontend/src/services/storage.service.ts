import api from './api';
import type { ApiResponse } from '@/types';
import { compressImage } from '@/lib/imageCompressor';

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
  // Compress image before uploading
  // Only compress image files — skip if not an image
  let fileToUpload = file

  if (file.type.startsWith('image/')) {
    try {
      fileToUpload = await compressImage(file, {
        maxSizeMB: 1.5,        // compress to max 1.5MB (below the 2MB backend limit)
        maxWidthOrHeight: 1280, // max dimension 1280px — enough for profile photos
        quality: 0.85,          // start at 85% quality
      })
    } catch (error) {
      // If compression fails, try uploading the original
      console.error('Image compression failed, uploading original:', error)
      fileToUpload = file
    }
  }

  const { presignedUrl, publicUrl } = await getPresignedUrl(
    fileToUpload.name,
    fileToUpload.type,
  )

  await uploadToS3(presignedUrl, fileToUpload, fileToUpload.type)

  return publicUrl
}
