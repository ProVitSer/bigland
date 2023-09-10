import { Injectable } from '@nestjs/common';
import * as uuid from 'uuid';
import * as path from 'path';
import { FileFormatType } from '../interfaces/files.enum';
import { Files, FilesDocument } from '../files.schema';
import { FileUtilsService } from '../file-utils/file-utils.service';
import { promises } from 'fs';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FilesEnvironmentVariables } from '@app/config/interfaces/config.interface';

@Injectable()
export class FilesCreateService {
  private filesConfig = this.configService.get<FilesEnvironmentVariables>('files');

  constructor(private readonly configService: ConfigService, @InjectModel(Files.name) private filesModel: Model<FilesDocument>) {}

  public async createFileFromBuffer(data: Buffer, type: FileFormatType, fileName?: string): Promise<Files> {
    const fileStruct = this.createFileStruct(data, type, fileName);
    return await this.createFile(data, fileStruct);
  }

  public async createTempFileFromBuffer(data: Buffer, type: FileFormatType, fileName?: string): Promise<Files> {
    const fileStruct = this.createFileStruct(data, type, fileName, true);

    return await this.createFile(data, fileStruct, true);
  }

  private async createFile(data: Buffer, file: Files, isTemp?: boolean): Promise<Files> {
    await this.makeDirIfNotExist(this.getFullPath(file.generatedFilePath, isTemp));
    await this.writeFile(data, this.getFullPath(path.join(file.generatedFilePath, file.generatedFileName), isTemp));

    return isTemp ? file : await this.saveFile(file);
  }

  private async saveFile(file: Files): Promise<Files> {
    const files = new this.filesModel({
      ...file,
    });
    await files.save();
    return { ...file };
  }

  public async makeDirIfNotExist(path: string): Promise<void> {
    await promises.mkdir(path, { recursive: true });
  }

  private async writeFile(data: Buffer, filePath: string): Promise<void> {
    await promises.writeFile(filePath, data);
  }

  private createFileStruct(data: Buffer, fileType: FileFormatType, fileName?: string, isTemp?: boolean): Files {
    const generateFilename = this.generateFilename();
    return {
      id: uuid.v4(),
      fileName: fileName || generateFilename,
      generatedFilePath: !!isTemp ? this.filesConfig.path.tmp : FileUtilsService.getFilePath(generateFilename),
      generatedFileName: `${generateFilename}.${fileType}`,
      contentType: FileUtilsService.getContentType(fileType),
      length: data.length,
      isImage: FileUtilsService.isImage(FileUtilsService.getContentType(fileType)),
    };
  }

  private getFullPath(basePath: string, isTemp?: boolean): string {
    return path.join(isTemp ? `` : this.filesConfig.path.files, basePath);
  }

  private generateFilename(): string {
    return uuid.v4();
  }
}
