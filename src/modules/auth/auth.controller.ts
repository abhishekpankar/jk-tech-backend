import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { messagesConstant } from 'src/common/constants/messages.constant';
import { Public, User } from 'src/common/decorators';
import { UsersService } from 'src/modules/users/users.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';

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
    return {
      result,
      message: messagesConstant.LOGIN_RESPONSE,
    };
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
    const access_token = await this.authService.signJwt(userId);
    return {
      access_token,
    };
  }
}
