import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { serverConfig } from './configurations/server.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['local.env', 'development.env', 'production.env', '.env'],
      isGlobal: true,
      load: [serverConfig],
      // cache: true,
      // validate,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
