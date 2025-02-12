import { ConfigService } from '@nestjs/config';
import { TestingModule, Test } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

jest.mock('bcrypt', () => ({
  genSalt: jest.fn().mockResolvedValue('mockSalt'),
  hash: jest.fn().mockResolvedValue('mockHashedPassword'),
}));

describe('UsersService', () => {
  let usersService: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findMany: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => {
              const configMap: Record<string, any> = {
                'bcrypt.saltRounds': 10,
                'users.findAll.limit': 10,
                'users.defaultRoleId': 1,
              };
              return configMap[key];
            }),
          },
        },
      ],
    }).compile();

    usersService = moduleRef.get<UsersService>(UsersService);
    prisma = moduleRef.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create a user with a hashed password', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'plainPass',
      } as any;
      prisma.user.create = jest
        .fn()
        .mockResolvedValue({ id: 1, ...createUserDto });

      const result = await usersService.create(createUserDto);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: { ...createUserDto, password: 'mockHashedPassword' },
      });
      expect(result).toEqual({ id: 1, ...createUserDto });
    });
  });

  describe('generatePasswordHash', () => {
    it('should generate a valid bcrypt hash', async () => {
      const hashedPassword = await usersService['generatePasswordHash'](
        'plainPass',
      );

      expect(hashedPassword).toBe('mockHashedPassword');
    });
  });

  describe('findAll', () => {
    it('should return a paginated list of users', async () => {
      const mockUsers = [{ id: 1, name: 'John Doe' }];
      prisma.user.findMany = jest.fn().mockResolvedValue(mockUsers);

      const result = await usersService.findAll(1);

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { isDeleted: false },
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
        take: 10,
        skip: 0,
      });
      expect(result).toEqual(mockUsers);
    });
  });

  describe('findOneById', () => {
    it('should return a user if found', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      prisma.user.findFirst = jest.fn().mockResolvedValue(mockUser);

      const result = await usersService.findOneById(1);

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { id: 1, isDeleted: false },
        select: {
          email: true,
          id: true,
          name: true,
          role: true,
          isVerified: true,
        },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findOneByEmail', () => {
    it('should return a user without sensitive info when sensitiveInfo is false', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      prisma.user.findFirst = jest.fn().mockResolvedValue(mockUser);

      const result = await usersService.findOneByEmail('test@example.com');

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'test@example.com', isDeleted: false },
        select: {
          email: true,
          id: true,
          name: true,
          role: true,
          isVerified: true,
          password: false,
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return a user with sensitive info when sensitiveInfo is true', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPass',
      };
      prisma.user.findFirst = jest.fn().mockResolvedValue(mockUser);

      const result = await usersService.findOneByEmail(
        'test@example.com',
        true,
      );

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'test@example.com', isDeleted: false },
        select: {
          email: true,
          id: true,
          name: true,
          role: true,
          isVerified: true,
          password: true,
        },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('saveOAuthUser', () => {
    it('should create an OAuth user with default role', async () => {
      const mockUser = { id: 1, email: 'test@example.com', roleId: 1 };
      prisma.user.create = jest.fn().mockResolvedValue(mockUser);

      const result = await usersService.saveOAuthUser(
        'test@example.com',
        'Test User',
      );

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          roleId: 1,
          isVerified: false,
        },
        select: {
          email: true,
          id: true,
          name: true,
          role: true,
          isVerified: true,
        },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('should update a user successfully', async () => {
      const updateUserDto: UpdateUserDto = { name: 'Updated Name' };
      prisma.user.update = jest
        .fn()
        .mockResolvedValue({ id: 1, ...updateUserDto });

      const result = await usersService.update(1, updateUserDto);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateUserDto,
      });
      expect(result).toEqual({ id: 1, ...updateUserDto });
    });
  });

  describe('remove', () => {
    it('should mark a user as deleted', async () => {
      prisma.user.update = jest
        .fn()
        .mockResolvedValue({ id: 1, isDeleted: true });

      const result = await usersService.remove(1);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isDeleted: true },
      });
      expect(result).toEqual({ id: 1, isDeleted: true });
    });
  });
});
