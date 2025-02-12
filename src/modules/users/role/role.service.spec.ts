import { Test, TestingModule } from '@nestjs/testing';
import { RoleService } from './role.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('RoleService', () => {
  let roleService: RoleService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        {
          provide: PrismaService,
          useValue: {
            role: {
              findFirst: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    roleService = moduleRef.get<RoleService>(RoleService);
    prisma = moduleRef.get<PrismaService>(PrismaService);
  });

  describe('getOneById', () => {
    it('should return a role when a valid role ID is provided', async () => {
      const mockRole = { id: 2, name: 'Admin' };
      prisma.role.findFirst = jest.fn().mockResolvedValue(mockRole);

      const result = await roleService.getOneById(2);

      expect(prisma.role.findFirst).toHaveBeenCalledWith({
        where: {
          id: 2,
          NOT: { id: 1 },
        },
      });
      expect(result).toEqual(mockRole);
    });

    it('should return null when the role ID is 1', async () => {
      prisma.role.findFirst = jest.fn().mockResolvedValue(null);

      const result = await roleService.getOneById(1);

      expect(prisma.role.findFirst).toHaveBeenCalledWith({
        where: {
          id: 1,
          NOT: { id: 1 },
        },
      });
      expect(result).toBeNull();
    });

    it('should return null when the role ID does not exist', async () => {
      prisma.role.findFirst = jest.fn().mockResolvedValue(null);

      const result = await roleService.getOneById(99);

      expect(prisma.role.findFirst).toHaveBeenCalledWith({
        where: {
          id: 99,
          NOT: { id: 1 },
        },
      });
      expect(result).toBeNull();
    });
  });
});
