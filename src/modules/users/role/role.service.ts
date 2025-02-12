import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}

  getOneById(roleId: number) {
    return this.prisma.role.findFirst({
      where: {
        id: roleId,
        NOT: {
          id: 1,
        },
      },
    });
  }
}
