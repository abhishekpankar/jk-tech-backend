import { plainToInstance } from 'class-transformer';
import {
  IsDefined,
  IsEnum,
  IsNumber,
  IsString,
  validateSync,
} from 'class-validator';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface ProcessEnv extends EnvironmentVariables {}
  }
}

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
  Provision = 'provision',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  @IsDefined()
  NODE_ENV: Environment;

  @IsNumber()
  @IsDefined()
  PORT: number;

  @IsString()
  @IsDefined()
  DATABASE_URL: string;

  @IsString()
  @IsDefined()
  JWT_SECRET: string;

  @IsString()
  @IsDefined()
  JWT_EXPIRY: string;

  @IsString()
  @IsDefined()
  GOOGLE_OAUTH_CLIENT_ID: string;

  @IsString()
  @IsDefined()
  GOOGLE_OAUTH_CLIENT_SECRET: string;

  @IsString()
  @IsDefined()
  GOOGLE_OAUTH_REDIRECT_URI: string;

  @IsString()
  @IsDefined()
  FACEBOOK_OAUTH_CLIENT_ID: string;

  @IsString()
  @IsDefined()
  FACEBOOK_OAUTH_CLIENT_SECRET: string;

  @IsString()
  @IsDefined()
  FACEBOOK_OAUTH_REDIRECT_URI: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
    stopAtFirstError: true,
    forbidUnknownValues: true,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
