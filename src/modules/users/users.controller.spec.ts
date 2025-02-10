import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { messagesConstant } from 'src/common/constants';
import { CreateUserDto } from './dto/create-user.dto';
import { FindAllUsersDto } from './dto/find-all-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RoleService } from './role/role.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;
  let roleService: RoleService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOneById: jest.fn(),
            findOneByEmail: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: RoleService,
          useValue: {
            getOneById: jest.fn(),
          },
        },
      ],
    }).compile();

    usersController = moduleRef.get<UsersController>(UsersController);
    usersService = moduleRef.get<UsersService>(UsersService);
    roleService = moduleRef.get<RoleService>(RoleService);
  });

  describe('create', () => {
    it('should create a user when role exists and email is not taken', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        roleId: 1,
        name: '',
        password: '',
      };
      roleService.getOneById = jest.fn().mockResolvedValue({ id: 1 });
      usersService.findOneByEmail = jest.fn().mockResolvedValue(null);
      usersService.create = jest
        .fn()
        .mockResolvedValue({ id: 1, ...createUserDto });

      const result = await usersController.create(createUserDto);

      expect(roleService.getOneById).toHaveBeenCalledWith(1);
      expect(usersService.findOneByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual({ message: messagesConstant.ADD_USER_RESPONSE });
    });

    it('should throw BadRequestException if role does not exist', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        roleId: 1,
        name: '',
        password: '',
      };
      roleService.getOneById = jest.fn().mockResolvedValue(null);

      await expect(usersController.create(createUserDto)).rejects.toThrow(
        new BadRequestException(messagesConstant.INVALID_ROLE_ID),
      );
    });

    it('should throw ConflictException if email is already taken', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        roleId: 1,
        name: '',
        password: '',
      };
      roleService.getOneById = jest.fn().mockResolvedValue({ id: 1 });
      usersService.findOneByEmail = jest.fn().mockResolvedValue({ id: 2 });

      await expect(usersController.create(createUserDto)).rejects.toThrow(
        new ConflictException(messagesConstant.USER_ALREADY_EXISTS),
      );
    });
  });

  describe('findAll', () => {
    it('should return a list of users', async () => {
      const mockUsers = [{ id: 1, email: 'test@example.com' }];
      usersService.findAll = jest.fn().mockResolvedValue(mockUsers);

      const queryParams: FindAllUsersDto = { page: 1 };
      const result = await usersController.findAll(queryParams);

      expect(usersService.findAll).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        result: mockUsers,
        message: messagesConstant.USERS_FETCHED,
      });
    });
  });

  describe('findOne', () => {
    it('should return a user if found', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      usersService.findOneById = jest.fn().mockResolvedValue(mockUser);

      const result = await usersController.findOne(1);

      expect(usersService.findOneById).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        message: messagesConstant.USER_FETCHED,
        result: mockUser,
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      usersService.findOneById = jest.fn().mockResolvedValue(null);

      await expect(usersController.findOne(1)).rejects.toThrow(
        new NotFoundException(messagesConstant.USER_NOT_FOUND),
      );
    });
  });

  describe('update', () => {
    it('should update the user if found', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'updated@example.com',
        roleId: 2,
      } as any;
      usersService.findOneById = jest.fn().mockResolvedValue({ id: 1 });
      roleService.getOneById = jest.fn().mockResolvedValue({ id: 2 });

      const result = await usersController.update(1, updateUserDto);

      expect(usersService.findOneById).toHaveBeenCalledWith(1);
      expect(roleService.getOneById).toHaveBeenCalledWith(2);
      expect(usersService.update).toHaveBeenCalledWith(1, updateUserDto);
      expect(result).toEqual({ message: messagesConstant.USER_UPDATED });
    });

    it('should throw NotFoundException if user is not found', async () => {
      usersService.findOneById = jest.fn().mockResolvedValue(null);

      await expect(
        usersController.update(1, { email: 'test@example.com' } as any),
      ).rejects.toThrow(new NotFoundException(messagesConstant.USER_NOT_FOUND));
    });

    it('should throw BadRequestException if role does not exist', async () => {
      usersService.findOneById = jest.fn().mockResolvedValue({ id: 1 });
      roleService.getOneById = jest.fn().mockResolvedValue(null);

      await expect(
        usersController.update(1, {
          email: 'test@example.com',
          roleId: 2,
        } as any),
      ).rejects.toThrow(
        new BadRequestException(messagesConstant.INVALID_ROLE_ID),
      );
    });
  });

  describe('remove', () => {
    it('should delete the user if found', async () => {
      usersService.findOneById = jest.fn().mockResolvedValue({ id: 1 });

      const result = await usersController.remove(1);

      expect(usersService.findOneById).toHaveBeenCalledWith(1);
      expect(usersService.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: messagesConstant.USER_DELETED });
    });

    it('should throw NotFoundException if user is not found', async () => {
      usersService.findOneById = jest.fn().mockResolvedValue(null);

      await expect(usersController.remove(1)).rejects.toThrow(
        new NotFoundException(messagesConstant.USER_NOT_FOUND),
      );
    });
  });
});
