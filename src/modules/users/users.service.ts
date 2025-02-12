import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { genSalt, hash } from 'bcrypt';
import { AppConfig } from 'src/configurations/app.config';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const password = await this.generatePasswordHash(createUserDto.password);
    const user = { ...createUserDto, password };
    return this.prisma.user.create({
      data: user,
    });
  }

  private async generatePasswordHash(plainPassword: string) {
    const saltRounds =
      this.configService.getOrThrow<AppConfig['bcrypt']['saltRounds']>(
        'bcrypt.saltRounds',
      );
    const salt = await genSalt(saltRounds);
    return hash(plainPassword, salt);
  }

  findAll(pageNumber: number) {
    const usersFetchLimit = this.configService.getOrThrow<
      AppConfig['users']['findAll']['limit']
    >('users.findAll.limit');

    return this.prisma.user.findMany({
      where: {
        isDeleted: false,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      take: usersFetchLimit,
      skip: (pageNumber - 1) * usersFetchLimit,
    });
  }

  findOneById(id: number) {
    return this.prisma.user.findFirst({
      where: {
        id,
        isDeleted: false,
      },
      select: {
        email: true,
        id: true,
        name: true,
        role: true,
        isVerified: true,
      },
    });
  }

  findOneByEmail(email: string, sensitiveInfo = false) {
    return this.prisma.user.findFirst({
      where: {
        email,
        isDeleted: false,
      },
      select: {
        email: true,
        id: true,
        name: true,
        role: true,
        isVerified: true,
        password: sensitiveInfo,
      },
    });
  }

  saveOAuthUser(email: string, name: string, isVerified = false) {
    const defaultRoleId = this.configService.getOrThrow<
      AppConfig['users']['defaultRoleId']
    >('users.defaultRoleId');

    return this.prisma.user.create({
      data: {
        email,
        name,
        roleId: defaultRoleId,
        isVerified,
      },
      select: {
        email: true,
        id: true,
        name: true,
        role: true,
        isVerified: true,
      },
    });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: {
        id,
      },
      data: updateUserDto,
    });
  }

  remove(id: number) {
    return this.prisma.user.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
      },
    });
  }
}
