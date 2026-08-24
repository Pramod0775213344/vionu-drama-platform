import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  Param,
  Res,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';

@ApiTags('Storage (Cloudflare R2)')
@Controller('api/v1/storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @ApiOperation({ summary: 'Check Cloudflare R2 connection status' })
  @Get('status')
  getStatus() {
    return this.storageService.getStatus();
  }

  @ApiOperation({ summary: 'Proxy subtitle file from R2 to bypass browser CORS restrictions' })
  @Get('subtitle-proxy')
  async proxySubtitle(@Query('url') url: string, @Res() res: Response) {
    if (!url) {
      throw new BadRequestException('url is required');
    }
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new BadRequestException(`Failed to fetch subtitle file: ${response.statusText}`);
      }
      const text = await response.text();
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.send(text);
    } catch (e: any) {
      throw new BadRequestException(e.message || 'Subtitle proxy failed');
    }
  }

  @ApiOperation({ summary: 'Get Presigned Upload URL for direct client-to-R2 upload (Videos & Subtitles)' })
  @Post('presigned-url')
  getPresignedUploadUrl(
    @Body() dto: {
      filename: string;
      contentType: string;
      folder?: 'videos' | 'subtitles' | 'thumbnails' | 'general';
    },
  ) {
    if (!dto.filename || !dto.contentType) {
      throw new BadRequestException('filename and contentType are required');
    }
    return this.storageService.getPresignedUploadUrl(dto);
  }

  @ApiOperation({ summary: 'Direct upload file buffer to Cloudflare R2' })
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder?: 'videos' | 'subtitles' | 'thumbnails' | 'general',
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    return this.storageService.uploadBuffer(
      file.buffer,
      file.originalname,
      file.mimetype,
      folder || 'subtitles',
    );
  }

  @ApiOperation({ summary: 'Attach uploaded R2 Video or Subtitle URL directly to an Episode' })
  @Post('attach-episode')
  attachToEpisode(
    @Body() dto: {
      episodeId: string;
      videoUrl?: string;
      subtitleUrl?: string;
      downloadUrl?: string;
      videoProvider?: string;
    },
  ) {
    if (!dto.episodeId) {
      throw new BadRequestException('episodeId is required');
    }
    return this.storageService.attachToEpisode(dto);
  }

  @ApiOperation({ summary: 'List files in Cloudflare R2 bucket' })
  @Get('files')
  listFiles(@Query('prefix') prefix?: string) {
    return this.storageService.listFiles(prefix);
  }

  @ApiOperation({ summary: 'Delete file from Cloudflare R2' })
  @Delete('files/:key')
  deleteFile(@Param('key') key: string) {
    return this.storageService.deleteFile(key);
  }
}
