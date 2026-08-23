import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private s3Client: S3Client | null = null;

  private accountId = process.env.R2_ACCOUNT_ID || '';
  private accessKeyId = process.env.R2_ACCESS_KEY_ID || '';
  private secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || '';
  private bucketName = process.env.R2_BUCKET_NAME || 'vionu-media';
  private publicUrl = process.env.R2_PUBLIC_URL || '';

  constructor(private prisma: PrismaService) {
    this.initS3Client();
  }

  private initS3Client() {
    this.accountId = process.env.R2_ACCOUNT_ID || '';
    this.accessKeyId = process.env.R2_ACCESS_KEY_ID || '';
    this.secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || '';
    this.bucketName = process.env.R2_BUCKET_NAME || 'vionu-media';
    this.publicUrl = (process.env.R2_PUBLIC_URL || '').replace(/\/+$/, '');

    if (this.accountId && this.accessKeyId && this.secretAccessKey) {
      this.s3Client = new S3Client({
        region: 'auto',
        endpoint: `https://${this.accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: this.accessKeyId,
          secretAccessKey: this.secretAccessKey,
        },
      });
      this.logger.log(`Cloudflare R2 Client initialized for bucket: ${this.bucketName}`);
    } else {
      this.logger.warn('Cloudflare R2 credentials not fully set in .env. Using mock/direct mode.');
    }
  }

  /**
   * Check whether Cloudflare R2 is configured
   */
  getStatus() {
    const isConfigured = !!(this.accountId && this.accessKeyId && this.secretAccessKey);
    return {
      isConfigured,
      bucketName: this.bucketName,
      publicUrl: this.publicUrl || 'https://pub-your-r2-id.r2.dev',
      endpoint: this.accountId ? `https://${this.accountId}.r2.cloudflarestorage.com` : 'Not configured',
    };
  }

  /**
   * Generate Presigned Upload URL for direct client-to-R2 upload (ideal for multi-GB videos)
   */
  async getPresignedUploadUrl(dto: {
    filename: string;
    contentType: string;
    folder?: 'videos' | 'subtitles' | 'thumbnails' | 'general';
  }) {
    const folder = dto.folder || 'videos';
    const cleanFilename = dto.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `${folder}/${Date.now()}-${cleanFilename}`;

    let publicFileUrl = '';
    if (this.publicUrl) {
      publicFileUrl = `${this.publicUrl}/${key}`;
    } else if (this.accountId && this.bucketName) {
      publicFileUrl = `https://${this.bucketName}.${this.accountId}.r2.cloudflarestorage.com/${key}`;
    } else {
      publicFileUrl = `https://r2.vionudrama.com/${key}`;
    }

    if (!this.s3Client) {
      // Return simulated upload URL if R2 credentials not yet configured
      return {
        uploadUrl: `http://localhost:4000/api/v1/storage/mock-upload?key=${encodeURIComponent(key)}`,
        key,
        publicUrl: publicFileUrl,
        contentType: dto.contentType,
        isMock: true,
      };
    }

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: dto.contentType || 'application/octet-stream',
      });

      const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });

      return {
        uploadUrl,
        key,
        publicUrl: publicFileUrl,
        contentType: dto.contentType,
        isMock: false,
      };
    } catch (error) {
      this.logger.error('Failed to generate R2 presigned URL:', error);
      throw new BadRequestException('Failed to generate Cloudflare R2 upload URL');
    }
  }

  /**
   * Direct upload via backend (for subtitles, thumbnails, or files under 50MB)
   */
  async uploadBuffer(
    buffer: Buffer,
    originalName: string,
    contentType: string,
    folder: 'videos' | 'subtitles' | 'thumbnails' | 'general' = 'subtitles',
  ) {
    const cleanFilename = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `${folder}/${Date.now()}-${cleanFilename}`;

    const publicFileUrl = this.publicUrl
      ? `${this.publicUrl}/${key}`
      : `https://${this.bucketName}.${this.accountId}.r2.cloudflarestorage.com/${key}`;

    if (!this.s3Client) {
      return {
        key,
        publicUrl: publicFileUrl,
        size: buffer.length,
        contentType,
        isMock: true,
      };
    }

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: buffer,
          ContentType: contentType,
        }),
      );

      return {
        key,
        publicUrl: publicFileUrl,
        size: buffer.length,
        contentType,
        isMock: false,
      };
    } catch (error) {
      this.logger.error('Failed to upload buffer to Cloudflare R2:', error);
      throw new BadRequestException('Cloudflare R2 upload failed');
    }
  }

  /**
   * Automatically attach uploaded URL to an Episode in database
   */
  async attachToEpisode(dto: {
    episodeId: string;
    videoUrl?: string;
    subtitleUrl?: string;
    downloadUrl?: string;
    videoProvider?: string;
  }) {
    const dataToUpdate: any = {};
    if (dto.videoUrl) {
      dataToUpdate.videoUrl = dto.videoUrl;
      dataToUpdate.videoProvider = dto.videoProvider || 'CLOUDFLARE_R2';
    }
    if (dto.subtitleUrl) {
      dataToUpdate.subtitleUrl = dto.subtitleUrl;
    }
    if (dto.downloadUrl) {
      dataToUpdate.downloadUrl = dto.downloadUrl;
    }

    const updated = await this.prisma.episode.update({
      where: { id: dto.episodeId },
      data: dataToUpdate,
      include: { drama: true, season: true },
    });

    return updated;
  }

  /**
   * List files stored in Cloudflare R2 bucket
   */
  async listFiles(prefix?: string) {
    if (!this.s3Client) {
      return { files: [], isMock: true };
    }

    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: prefix || undefined,
        MaxKeys: 100,
      });

      const response = await this.s3Client.send(command);
      const contents = response.Contents || [];

      const files = contents.map((item) => ({
        key: item.Key || '',
        size: item.Size || 0,
        lastModified: item.LastModified,
        publicUrl: this.publicUrl ? `${this.publicUrl}/${item.Key}` : '',
      }));

      return { files, isMock: false };
    } catch (error) {
      this.logger.error('Failed to list files from R2:', error);
      return { files: [], error: 'Failed to list R2 files' };
    }
  }

  /**
   * Delete file from Cloudflare R2
   */
  async deleteFile(key: string) {
    if (!this.s3Client) return { success: true, isMock: true };

    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );
      return { success: true, key };
    } catch (error) {
      this.logger.error(`Failed to delete file "${key}" from R2:`, error);
      throw new BadRequestException(`Failed to delete file from Cloudflare R2`);
    }
  }
}
