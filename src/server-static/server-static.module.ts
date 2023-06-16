import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { FilesApiModule } from '@app/files-api/files-api.module';

@Module({
  imports: [
    ConfigModule,
    FilesApiModule,
    ServeStaticModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return [
          {
            rootPath: configService.get('files.path.files'),
            serveRoot: configService.get('serveStatic'),
            exclude: ['/api*'],
            serveStaticOptions: {
              fallthrough: false,
              index: false,
            },
          },
        ];
      },
      inject: [ConfigService],
    }),
  ],
})
export class ServerStaticModule {}
