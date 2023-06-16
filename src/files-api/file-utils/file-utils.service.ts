import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as mime from 'mime-types';
import configuration from '@app/config/config.provider';
import { ConfigService } from '@nestjs/config';
import { FileFormatType } from '../interfaces/files.enum';
import { Files } from '../files.schema';
import { FilesEnvironmentVariables } from '@app/config/interfaces/config.interface';

@Injectable()
export class FileUtilsService {
  static isImage(contentType: string): boolean {
    return contentType.includes('image');
  }

  static getFilePath(fileName: string): string {
    return path.join.apply(null, fileName.substring(0, 5).split(''));
  }

  static getContentType(fileType: FileFormatType): string | null {
    const mimeType = mime.lookup(fileType);
    return !!mimeType ? mimeType : null;
  }

  static getExtention(filePath): string {
    return path.extname(filePath)?.substr(1);
  }

  static getFilesConfig(): FilesEnvironmentVariables {
    return new ConfigService(configuration())?.get('files');
  }

  static getFileFullPath(file: Files, isTemp?: boolean): string {
    return isTemp
      ? path.join(FileUtilsService.getFilesConfig().path.tmp, file.generatedFilePath, file.generatedFileName)
      : path.join(FileUtilsService.getFilesConfig().path.files, file.generatedFilePath, file.generatedFileName);
  }

  static toBuffer(data: string | Buffer): Buffer {
    return data instanceof Buffer ? data : Buffer.from(data, 'base64');
  }
}
