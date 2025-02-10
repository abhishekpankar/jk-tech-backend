import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { UnauthorizedException } from '@nestjs/common';
import { BrowserLoginDto, LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            signJwt: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOneByEmail: jest.fn(),
            saveOAuthUser: jest.fn(),
          },
        },
        {
          provide: GoogleOAuthGuard,
          useValue: {},
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('login', () => {
    it('should return login result when credentials are correct', async () => {
      const payload: LoginDto = {
        email: 'user@example.com',
        password: 'password123',
      };
      const mockLoginResult = { access_token: 'mocked-token' };

      authService.login = jest.fn().mockResolvedValue(mockLoginResult);

      const result = await authController.login(payload);

      expect(authService.login).toHaveBeenCalledWith(
        payload.email,
        payload.password,
      );
      expect(result).toEqual(mockLoginResult);
    });

    it('should throw an error if login fails', async () => {
      const payload: LoginDto = {
        email: 'user@example.com',
        password: 'wrongpassword',
      };

      authService.login = jest
        .fn()
        .mockRejectedValue(new Error('Invalid credentials'));

      await expect(authController.login(payload)).rejects.toThrow(
        'Invalid credentials',
      );
      expect(authService.login).toHaveBeenCalledWith(
        payload.email,
        payload.password,
      );
    });
  });

  describe('oAuthLogin', () => {
    it('should call oAuthLogin and return nothing (empty function)', async () => {
      const response = await authController.oAuthLogin();
      expect(response).toBeUndefined();
    });
  });

  describe('oAuthRedirect', () => {
    it('should return a JWT token if the user exists', async () => {
      const mockGoogleUser = { email: 'test@example.com', name: 'Test User' };
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        role: { name: 'user' },
      };
      const mockToken = 'mocked-jwt-token';

      usersService.findOneByEmail = jest.fn().mockResolvedValue(mockUser);
      authService.signJwt = jest.fn().mockResolvedValue(mockToken);

      const result = await authController.oAuthRedirect(mockGoogleUser);

      expect(usersService.findOneByEmail).toHaveBeenCalledWith(
        mockGoogleUser.email,
      );
      expect(authService.signJwt).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.role.name,
      );
      expect(result).toEqual({ access_token: mockToken });
    });

    it('should create a new user if not found and return a JWT token', async () => {
      const mockGoogleUser = { email: 'new@example.com', name: 'New User' };
      const mockNewUser = {
        id: 2,
        email: 'new@example.com',
        role: { name: 'user' },
      };
      const mockToken = 'new-user-jwt';

      usersService.findOneByEmail = jest.fn().mockResolvedValue(null);
      usersService.saveOAuthUser = jest.fn().mockResolvedValue(mockNewUser);
      authService.signJwt = jest.fn().mockResolvedValue(mockToken);

      const result = await authController.oAuthRedirect(mockGoogleUser);

      expect(usersService.findOneByEmail).toHaveBeenCalledWith(
        mockGoogleUser.email,
      );
      expect(usersService.saveOAuthUser).toHaveBeenCalledWith(
        mockGoogleUser.email,
        mockGoogleUser.name,
        true,
      );
      expect(authService.signJwt).toHaveBeenCalledWith(
        mockNewUser.id,
        mockNewUser.role.name,
      );
      expect(result).toEqual({ access_token: mockToken });
    });

    it('should throw an error if user service fails', async () => {
      const mockGoogleUser = { email: 'error@example.com', name: 'Error User' };

      usersService.findOneByEmail = jest
        .fn()
        .mockRejectedValue(new Error('Database error'));

      await expect(
        authController.oAuthRedirect(mockGoogleUser),
      ).rejects.toThrow('Database error');
      expect(usersService.findOneByEmail).toHaveBeenCalledWith(
        mockGoogleUser.email,
      );
    });
  });

  describe('browserLogin', () => {
    it('should throw an error if verification fails', async () => {
      const payload: BrowserLoginDto = {
        provider: 'google',
        user: {
          email: 'error@example.com',
          name: 'Error User',
          id: '',
          token: '',
        },
      };

      authController.verifyToken = jest
        .fn()
        .mockRejectedValue(new Error('Invalid token'));

      await expect(authController.browserLogin(payload)).rejects.toThrow(
        'Invalid token',
      );
      expect(authController.verifyToken).toHaveBeenCalledWith(
        payload.provider,
        payload.user,
      );
    });
  });

  describe('verifyToken', () => {
    it('should throw UnauthorizedException for an invalid provider', async () => {
      try {
        await authController.verifyToken('invalid-provider', {
          token: 'any-token',
          name: '',
          email: '',
          id: '',
        });
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe('Invalid Provider');
      }
    });
  });
});
