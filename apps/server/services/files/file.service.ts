// apps/server/services/file/file.service.ts

import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

export interface UploadedFile {
  key: string;
  url: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
}

@Injectable()
export class FileService {
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly logger = new Logger(FileService.name);

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('aws.region') || 'us-east-1';
    const endpoint =
      this.configService.get<string>('aws.endpoint') || 'http://localhost:4566';
    const accessKeyId =
      this.configService.get<string>('aws.accessKeyId') || 'test';
    const secretAccessKey =
      this.configService.get<string>('aws.secretAccessKey') || 'test';
    const forcePathStyle =
      this.configService.get<boolean>('aws.s3.forcePathStyle') ?? true;

    this.bucket =
      this.configService.get<string>('aws.s3.bucket') ||
      'warranty-system-uploads';

    this.s3Client = new S3Client({
      region,
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle,
    });

    this.logger.log(`FileService initialized - Bucket: ${this.bucket}`);
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
  ): Promise<UploadedFile> {
    try {
      const fileExtension = path.extname(file.originalname);
      const timestamp = Date.now();
      const uniqueId = uuidv4().split('-')[0];
      const fileName = `${timestamp}-${uniqueId}${fileExtension}`;
      const key = `${folder}/${fileName}`;

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ContentLength: file.size,
        Metadata: {
          originalname: file.originalname,
        },
      });

      await this.s3Client.send(command);
      this.logger.log(`File uploaded: ${key}`);

      const url = await this.getDownloadUrl(key);

      return {
        key,
        url,
        fileName,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      };
    } catch (error) {
      this.logger.error(`Upload failed: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  async uploadFiles(
    files: Express.Multer.File[],
    folder: string = 'uploads',
  ): Promise<UploadedFile[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  async getDownloadUrl(key: string): Promise<string> {
    try {
      const expiresIn =
        this.configService.get<number>('aws.s3.presignedUrlExpiration') || 3600;

      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });
      return signedUrl;
    } catch (error) {
      const endpoint = this.configService.get<string>('aws.endpoint');
      const isLocal =
        endpoint?.includes('localhost') || endpoint?.includes('floci');

      if (isLocal) {
        return `${endpoint}/${this.bucket}/${key}`;
      }

      this.logger.error(`Failed to generate download URL: ${error.message}`);
      throw new InternalServerErrorException('Failed to generate download URL');
    }
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`File deleted: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`);
      throw new InternalServerErrorException('Failed to delete file');
    }
  }

  async ensureBucketExists(): Promise<void> {
    try {
      try {
        await this.s3Client.send(
          new HeadBucketCommand({ Bucket: this.bucket }),
        );
        this.logger.log(`Bucket "${this.bucket}" exists`);
      } catch (error) {
        if (error.name === 'NotFound' || error.name === 'NoSuchBucket') {
          await this.s3Client.send(
            new CreateBucketCommand({ Bucket: this.bucket }),
          );
          this.logger.log(`Bucket "${this.bucket}" created`);
        }
      }
    } catch (error) {
      this.logger.warn(`Bucket check warning: ${error.message}`);
    }
  }
}
