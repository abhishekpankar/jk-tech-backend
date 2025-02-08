import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { Public, User } from 'src/common/decorators';
import { UsersService } from 'src/modules/users/users.service';
import { AuthService } from './auth.service';
import { BrowserLoginDto, LoginDto } from './dto/login.dto';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { OAuth2Client } from 'google-auth-library';

@Controller({
  path: 'auth',
  version: '1',
})
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() payload: LoginDto) {
    const { email, password } = payload;
    const result = await this.authService.login(email, password);
    return result;
  }

  @Public()
  @UseGuards(GoogleOAuthGuard)
  @Get('google/login')
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async oAuthLogin() {}

  @UseGuards(GoogleOAuthGuard)
  @ApiExcludeEndpoint()
  @Public()
  @Get('google/redirect')
  async oAuthRedirect(@User() googleUser: Record<string, string>) {
    const user = await this.userService.findOneByEmail(googleUser.email);
    let userId: number = user?.id;
    if (!user) {
      const user = await this.userService.saveOAuthUser(
        googleUser.email,
        googleUser.name,
        true,
      );
      userId = user.id;
    }
    const access_token = await this.authService.signJwt(userId, user.role.name);
    return {
      access_token,
    };
  }

  @Public()
  @Post('/browser/login')
  async browserLogin(@Body() payload: BrowserLoginDto) {
    await this.verifyToken(payload.provider, payload);
    const user = await this.userService.findOneByEmail(payload.email);
    let userId: number = user?.id;
    if (!user) {
      const user = await this.userService.saveOAuthUser(
        payload.email,
        payload.name,
        true,
      );
      userId = user.id;
    }
    const access_token = await this.authService.signJwt(userId, user.role.name);
    return {
      access_token,
    };
  }

  private async verifyToken(provider: string, payload: any) {
    switch (provider) {
      case 'google':
        const oauth = new OAuth2Client(process.env.GOOGLE_OAUTH_CLIENT_ID);
        await oauth.verifyIdToken({
          idToken: payload.token,
        });
        break;

      case 'facebook':
        const profile = await (
          await fetch(
            `https://graph.facebook.com/${payload.userId}?access_token=${payload.token}`,
          )
        ).json();
        if (profile.error) {
          throw new UnauthorizedException();
        }
        break;
      default:
        throw new UnauthorizedException('Invalid Provider');
    }
  }
}
