import { JwtStrategy } from './jwt.strategy';
import { UsersService } from 'src/modules/users/users.service';
import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let mockUserService: Partial<UsersService>;

  beforeEach(async () => {
    mockUserService = {
      findOneById: jest.fn(),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        JwtStrategy,
        {
          provide: UsersService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    jwtStrategy = moduleRef.get<JwtStrategy>(JwtStrategy);
  });

  describe('validate', () => {
    it('should return user data if user is found', async () => {
      const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
      (mockUserService.findOneById as jest.Mock).mockResolvedValue(mockUser);

      const payload = { id: 1 };
      const result = await jwtStrategy.validate(payload);

      expect(result).toEqual(mockUser);
      expect(mockUserService.findOneById).toHaveBeenCalledWith(1);
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      (mockUserService.findOneById as jest.Mock).mockResolvedValue(null);

      const payload = { id: 999 };

      await expect(jwtStrategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockUserService.findOneById).toHaveBeenCalledWith(999);
    });
  });
});
