import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { PresignedUrlResponseDto } from './dto/presigned-url-response.dto.js';

const ALLOWED_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const PRESIGNED_URL_EXPIRES_IN = 300;

@Injectable()
export class StorageService {
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly region: string;

  constructor(private readonly configService: ConfigService) {
    this.region = this.configService.get<string>('app.awsRegion') as string;
    this.bucket = this.configService.get<string>('app.awsS3BucketName') as string;

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>('app.awsAccessKeyId') as string,
        secretAccessKey: this.configService.get<string>('app.awsSecretAccessKey') as string,
      },
    });
  }

  async generatePresignedUrl(fileName: string, contentType: string): Promise<PresignedUrlResponseDto> {
    if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
      throw new BadRequestException('Tipo de archivo no permitido. Solo se permiten imágenes.');
    }

    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '');
    const key = `uploads/${uuidv4()}-${sanitizedFileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: PRESIGNED_URL_EXPIRES_IN,
    });

    const publicUrl = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;

    return { presignedUrl, publicUrl, key };
  }
}
