import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { messagesConstant } from 'src/common/constants/messages.constant';
import { Public } from 'src/common/decorators';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller({
  path: 'auth',
  version: '1',
})
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {} // private readonly userService: UsersService, // private readonly oAuthService: OAuthService,

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

}
