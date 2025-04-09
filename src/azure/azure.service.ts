/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { BlobServiceClient, BlockBlobClient } from '@azure/storage-blob';
import * as multer from 'multer';

@Injectable()
export class AzureStorageService {
  private containerName = 'user-profiles';
  private connectionString: string;

  constructor() {
    if (!process.env.AZURE_STORAGE_CONNECTION_STRING) {
      throw new Error(
        'AZURE_STORAGE_CONNECTION_STRING environment variable is not defined',
      );
    }
    this.connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  }

  getBlobClient(imageName: string): BlockBlobClient {
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      this.connectionString,
    );
    const containerClient = blobServiceClient.getContainerClient(
      this.containerName,
    );
    return containerClient.getBlockBlobClient(imageName);
  }

  async generateSasToken(): Promise<{ sasToken: string; storageUrl: string }> {
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      this.connectionString,
    );
    const containerClient = blobServiceClient.getContainerClient(
      this.containerName,
    );

    // Generate SAS token valid for 5 minutes
    const expiresOn = new Date();
    expiresOn.setMinutes(expiresOn.getMinutes() + 5);

    const sasToken = await containerClient.generateSasUrl({
      expiresOn,
      permissions: {
        write: true,
        read: false,
        add: false,
        create: false,
        delete: false,
        deleteVersion: false,
        list: false,
        tag: false,
        move: false,
        execute: false,
        setImmutabilityPolicy: false,
        permanentDelete: false,
        filterByTags: false,
      },
    });

    return {
      sasToken: sasToken.split('?')[1],
      storageUrl: `https://${blobServiceClient.accountName}.blob.core.windows.net/${this.containerName}`,
    };
  }
  async uploadFile(file: multer.File, sasToken: string): Promise<string> {
    const blobServiceClient = new BlobServiceClient(
      `https://${process.env.AZURE_STORAGE_ACCOUNT}.blob.core.windows.net?${sasToken}`,
    );

    const containerClient = blobServiceClient.getContainerClient(
      this.containerName,
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const blobName = `profile-${Date.now()}-${file.originalname}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: { blobContentType: file.mimetype },
    });

    return `https://${process.env.AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${this.containerName}/${blobName}`;
  }
}
