import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LogModule } from '@app/log/log.module';

@Module({
    imports: [
        ConfigModule,
        LogModule,
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                transport: {
                    host: configService.get('mail.host'),
                    port: configService.get('mail.port'),
                    secure: configService.get('mail.secure'),
                    auth: {
                        user: configService.get('mail.auth.user'),
                        pass: configService.get('mail.auth.pass'),
                    },
                },
                template: {
                    dir: join(__dirname, 'templates'),
                    adapter: new HandlebarsAdapter(),
                    options: {
                        strict: true,
                    },
                },
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [MailService],
    exports: [MailService],
})
export class MailModule {}