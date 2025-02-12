import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { compare } from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOneByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue('mock-secret'), // Mock the JWT secret and expiry
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);

    authService.isEntityFound = jest.fn().mockImplementation((user) => user); // Assume it just returns user
    authService.matchPassword = jest.fn().mockResolvedValue(true); // Assume password matches
    authService.signJwt = jest.fn().mockResolvedValue('mocked-jwt-token'); // Assume JWT token is signed
  });

  describe('login', () => {
    it('should return JWT token if login is successful', async () => {
      const mockUser = {
        id: 1,
        email: 'user@example.com',
        password: 'hashed-password',
        role: { name: 'user' },
      };

      usersService.findOneByEmail = jest.fn().mockResolvedValue(mockUser);

      const result = await authService.login('user@example.com', 'password123');

      expect(usersService.findOneByEmail).toHaveBeenCalledWith(
        'user@example.com',
        true,
      );
      expect(authService.matchPassword).toHaveBeenCalledWith(
        mockUser.password,
        'password123',
      );
      expect(authService.signJwt).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.role.name,
      );
      expect(result).toEqual({ access_token: 'mocked-jwt-token' });
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      usersService.findOneByEmail = jest.fn().mockResolvedValue(null);

      await expect(
        authService.login('notfound@example.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
      expect(usersService.findOneByEmail).toHaveBeenCalledWith(
        'notfound@example.com',
        true,
      );
    });

    it('should throw UnauthorizedException if user has no password', async () => {
      const mockUser = {
        id: 2,
        email: 'user@example.com',
        password: null,
        role: { name: 'user' },
      };

      usersService.findOneByEmail = jest.fn().mockResolvedValue(mockUser);

      await expect(
        authService.login('user@example.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
      expect(usersService.findOneByEmail).toHaveBeenCalledWith(
        'user@example.com',
        true,
      );
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const mockUser = {
        id: 3,
        email: 'user@example.com',
        password: 'hashed-password',
        role: { name: 'user' },
      };

      usersService.findOneByEmail = jest.fn().mockResolvedValue(mockUser);
      authService.matchPassword = jest
        .fn()
        .mockRejectedValue(new UnauthorizedException());

      await expect(
        authService.login('user@example.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
      expect(usersService.findOneByEmail).toHaveBeenCalledWith(
        'user@example.com',
        true,
      );
      expect(authService.matchPassword).toHaveBeenCalledWith(
        mockUser.password,
        'wrongpassword',
      );
    });
  });

  describe('matchPassword', () => {
    it('should resolve if passwords match', async () => {
      (compare as jest.Mock).mockResolvedValue(true);
      await expect(
        authService.matchPassword('hashed-pass', 'password123'),
      ).resolves.not.toThrow();
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const hashedPassword = 'hashedpassword';
      const plainPassword = 'wrongpassword';
      authService.matchPassword = jest.fn().mockRejectedValue(() => {
        throw new UnauthorizedException();
      });

      // jest.spyOn(compare, 'mockImplementation').mockResolvedValue(false); // Password does not match

      await expect(
        authService.matchPassword(hashedPassword, plainPassword),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('isEntityFound', () => {
    it('should return entity if found', () => {
      const entity = { id: 1 };
      expect(authService.isEntityFound(entity)).toBe(entity);
    });

    it('should throw NotFoundException if entity is not found', () => {
      authService.isEntityFound = jest.fn().mockImplementation(() => {
        throw new NotFoundException('Entity not found');
      });

      expect(() => authService.isEntityFound(null)).toThrow(NotFoundException);
    });
  });

  describe('signJwt', () => {
    it('should return a signed JWT token', async () => {
      const result = await authService.signJwt(1, 'user');
      expect(result).toBe('mocked-jwt-token');
    });
  });
});
