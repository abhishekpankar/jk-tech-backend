import { Test, TestingModule } from '@nestjs/testing';
import { BlogsService } from './blogs.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';

describe('BlogsService', () => {
  let blogsService: BlogsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        BlogsService,
        {
          provide: PrismaService,
          useValue: {
            blog: {
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
            getOrThrow: jest.fn().mockReturnValue(10), // Mocking fetch limit
          },
        },
      ],
    }).compile();

    blogsService = moduleRef.get<BlogsService>(BlogsService);
    prismaService = moduleRef.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create and return a new blog', async () => {
      const createBlogDto = {
        title: 'Test Blog',
        about: 'Test About',
        brief: 'Test Brief',
      };
      const mockBlog = { id: 1, ...createBlogDto, addedBy: 1 };
      prismaService.blog.create = jest.fn().mockResolvedValue(mockBlog);

      const result = await blogsService.create(1, createBlogDto);

      expect(prismaService.blog.create).toHaveBeenCalledWith({
        data: { ...createBlogDto, addedBy: 1 },
      });
      expect(result).toEqual(mockBlog);
    });
  });

  describe('findAll', () => {
    it('should return a paginated list of blogs', async () => {
      const mockBlogs = [
        { id: 1, title: 'Blog 1', about: 'About 1', createdAt: new Date() },
      ];
      prismaService.blog.findMany = jest.fn().mockResolvedValue(mockBlogs);

      const result = await blogsService.findAll(1);

      expect(prismaService.blog.findMany).toHaveBeenCalledWith({
        where: { isDeleted: false },
        orderBy: { updatedAt: 'desc' },
        select: { id: true, title: true, about: true, createdAt: true },
        take: 10,
        skip: 0,
      });
      expect(result).toEqual(mockBlogs);
    });
  });

  describe('findOneById', () => {
    it('should return a blog if found', async () => {
      const mockBlog = { id: 1, title: 'Test Blog' };
      prismaService.blog.findFirst = jest.fn().mockResolvedValue(mockBlog);

      const result = await blogsService.findOneById(1);

      expect(prismaService.blog.findFirst).toHaveBeenCalledWith({
        where: { id: 1, isDeleted: false },
      });
      expect(result).toEqual(mockBlog);
    });

    it('should return null if blog is not found', async () => {
      prismaService.blog.findFirst = jest.fn().mockResolvedValue(null);

      const result = await blogsService.findOneById(999);

      expect(prismaService.blog.findFirst).toHaveBeenCalledWith({
        where: { id: 999, isDeleted: false },
      });
      expect(result).toBeNull();
    });
  });

  describe('findOneByKeywords', () => {
    it('should return a blog if found by keyword', async () => {
      const mockBlog = { id: 1, title: 'Test Blog' };
      prismaService.blog.findFirst = jest.fn().mockResolvedValue(mockBlog);

      const result = await blogsService.findOneByKeywords('Test');

      expect(prismaService.blog.findFirst).toHaveBeenCalledWith({
        where: {
          title: { contains: 'Test' },
          isDeleted: false,
        },
      });
      expect(result).toEqual(mockBlog);
    });

    it('should return null if no blog matches the keyword', async () => {
      prismaService.blog.findFirst = jest.fn().mockResolvedValue(null);

      const result = await blogsService.findOneByKeywords('Nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a blog and return updated blog', async () => {
      const updateBlogDto = { title: 'Updated Blog' } as any;
      const mockUpdatedBlog = { id: 1, ...updateBlogDto };
      prismaService.blog.update = jest.fn().mockResolvedValue(mockUpdatedBlog);

      const result = await blogsService.update(1, updateBlogDto);

      expect(prismaService.blog.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateBlogDto,
      });
      expect(result).toEqual(mockUpdatedBlog);
    });
  });

  describe('remove', () => {
    it('should mark a blog as deleted', async () => {
      const mockDeletedBlog = { id: 1, isDeleted: true };
      prismaService.blog.update = jest.fn().mockResolvedValue(mockDeletedBlog);

      const result = await blogsService.remove(1);

      expect(prismaService.blog.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isDeleted: true },
      });
      expect(result).toEqual(mockDeletedBlog);
    });
  });
});
