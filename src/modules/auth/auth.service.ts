import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from 'src/configurations/app.config';
import { compare } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(email: string, plainPassword: string) {
    const nullableUser = await this.userService.findOneByEmail(email);
    const user = this.isEntityFound(nullableUser);
    if (!user.password) {
      throw new UnauthorizedException();
    }
    await this.matchPassword(user.password, plainPassword);
    const access_token = await this.signJwt(user.id);
    return {
      access_token,
    };
  }

  private getJwtSecret() {
    return this.configService.getOrThrow<AppConfig['jwt']['secret']>(
      'jwt.secret',
    );
  }

  private getJwtExpiry() {
    return this.configService.getOrThrow<AppConfig['jwt']['expiry']>(
      'jwt.expiry',
    );
  }

  private async matchPassword(hashedPassword: string, plainPassword: string) {
    const isMatch = await compare(plainPassword, hashedPassword);
    if (!isMatch) {
      throw new UnauthorizedException();
    }
  }

  private isEntityFound<T>(entity: T) {
    if (!entity) {
      throw new NotFoundException();
    }
    return entity;
  }

  private getJwtSignOptions(): JwtSignOptions {
    const jwtSecret = this.getJwtSecret();
    const jwtExpiry = this.getJwtExpiry();
    return {
      secret: jwtSecret,
      expiresIn: jwtExpiry,
    };
  }

  private makeJwtPayload(id: number) {
    return { id };
  }

  signJwt(userId: number) {
    const payload = this.makeJwtPayload(userId);
    const JwtSignOptions = this.getJwtSignOptions();
    return this.jwtService.signAsync(payload, JwtSignOptions);
  }
}
