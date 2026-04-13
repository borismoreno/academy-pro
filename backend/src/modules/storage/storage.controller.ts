import { Body, Controller, Post } from '@nestjs/common';
import { PresignedUrlRequestDto } from './dto/presigned-url-request.dto.js';
import { PresignedUrlResponseDto } from './dto/presigned-url-response.dto.js';
import { StorageService } from './storage.service.js';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('presigned-url')
  async getPresignedUrl(
    @Body() dto: PresignedUrlRequestDto,
  ): Promise<{ data: PresignedUrlResponseDto; message: string }> {
    const data = await this.storageService.generatePresignedUrl(dto.fileName, dto.contentType);
    return { data, message: 'URL prefirmada generada exitosamente' };
  }
}
