import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { serverConfig, validate } from './configurations';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { appConfig } from './configurations/app.config';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { JwtGuard } from './modules/auth/guards/jwt.guard';
import { BlogsModule } from './modules/blogs/blogs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['local.env', 'development.env', 'production.env', '.env'],
      isGlobal: true,
      load: [serverConfig, appConfig],
      cache: true,
      validate,
    }),
    AuthModule,
    UsersModule,
    BlogsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true,
        stopAtFirstError: true,
        whitelist: true,
        forbidUnknownValues: true,
        forbidNonWhitelisted: true,
      }),
    },
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
})
export class AppModule {}
