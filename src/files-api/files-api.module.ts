import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FilesCreateService } from './files-create/files-create.service';
import { FileUtilsService } from './file-utils/file-utils.service';
import { FilesMergeService } from './files-merge/files-merge.service';

@Module({
  imports: [ConfigModule],
  providers: [FilesCreateService, FileUtilsService, FilesMergeService],
  exports: [FilesCreateService, FileUtilsService, FilesMergeService],
})
export class FilesApiModule {}
