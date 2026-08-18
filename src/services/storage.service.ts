// src/services/storage.service.ts
import fs from 'fs-extra';
import path from 'path';
import { config } from '../config';
import { AppError } from '../errors/app-error';

export class StorageService {
  private baseStorageDir: string;

  constructor() {
    this.baseStorageDir = config.storage.localPdfDir;
    fs.ensureDirSync(this.baseStorageDir);
  }

  /**
   * Verifies if a compiled PDF exists and returns its absolute path.
   */
  public async getPdfPath(filename: string): Promise<string> {
    const fullPath = path.isAbsolute(filename)
      ? filename
      : path.join(this.baseStorageDir, filename);

    const exists = await fs.pathExists(fullPath);
    if (!exists) {
      throw new AppError(`Requested PDF notice was not found on disk: ${filename}`, 404);
    }

    return fullPath;
  }

  /**
   * Returns a readable stream for dispatch via Lob or Phaxio.
   */
  public getPdfStream(filename: string): fs.ReadStream {
    const fullPath = path.isAbsolute(filename)
      ? filename
      : path.join(this.baseStorageDir, filename);

    if (!fs.existsSync(fullPath)) {
      throw new AppError(`File stream unavailable. File not found: ${filename}`, 404);
    }

    return fs.createReadStream(fullPath);
  }

  /**
   * Deletes a temporary file after successful carrier dispatch.
   */
  public async deletePdf(filename: string): Promise<void> {
    try {
      const fullPath = path.isAbsolute(filename)
        ? filename
        : path.join(this.baseStorageDir, filename);

      if (await fs.pathExists(fullPath)) {
        await fs.remove(fullPath);
      }
    } catch (error: any) {
      console.warn(`[StorageService] Unable to clean up file ${filename}:`, error.message);
    }
  }
}

export const storageService = new StorageService();
