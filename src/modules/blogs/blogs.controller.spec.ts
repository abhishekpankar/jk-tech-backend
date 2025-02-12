import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { messagesConstant } from 'src/common/constants';
import { BlogsController } from './blogs.controller';
import { BlogsService } from './blogs.service';

describe('BlogsController', () => {
  let blogsController: BlogsController;
  let blogsService: BlogsService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [BlogsController],
      providers: [
        {
          provide: BlogsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOneById: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    blogsController = moduleRef.get<BlogsController>(BlogsController);
    blogsService = moduleRef.get<BlogsService>(BlogsService);
  });

  describe('create', () => {
    it('should call blogsService.create and return success message', async () => {
      const createBlogDto = {
        title: 'New Blog',
        content: 'Blog Content',
      } as any;
      const user = { id: 1 } as any;

      await expect(
        blogsController.create(createBlogDto, user),
      ).resolves.toEqual({
        message: messagesConstant.ADD_BLOG_RESPONSE,
      });

      expect(blogsService.create).toHaveBeenCalledWith(user.id, createBlogDto);
    });
  });

  describe('findAll', () => {
    it('should call blogsService.findAll and return fetched blogs', async () => {
      const mockBlogs = [{ id: 1, title: 'Blog 1' }];
      blogsService.findAll = jest.fn().mockResolvedValue(mockBlogs);

      const result = await blogsController.findAll({ page: 1 });

      expect(blogsService.findAll).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        result: mockBlogs,
        message: messagesConstant.BLOGS_FETCHED,
      });
    });
  });

  describe('findOne', () => {
    it('should return a blog if found', async () => {
      const mockBlog = { id: 1, title: 'Test Blog' };
      blogsService.findOneById = jest.fn().mockResolvedValue(mockBlog);

      const result = await blogsController.findOne(1);

      expect(blogsService.findOneById).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        message: messagesConstant.BLOG_FETCHED,
        result: mockBlog,
      });
    });

    it('should throw NotFoundException if blog is not found', async () => {
      blogsService.findOneById = jest.fn().mockResolvedValue(null);

      await expect(blogsController.findOne(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a blog if found', async () => {
      const updateBlogDto = { title: 'Updated Blog' } as any;
      const mockBlog = { id: 1, title: 'Old Blog' };
      blogsService.findOneById = jest.fn().mockResolvedValue(mockBlog);

      await expect(blogsController.update(1, updateBlogDto)).resolves.toEqual({
        message: messagesConstant.BLOG_UPDATED,
      });

      expect(blogsService.update).toHaveBeenCalledWith(1, updateBlogDto);
    });

    it('should throw NotFoundException if blog is not found', async () => {
      blogsService.findOneById = jest.fn().mockResolvedValue(null);

      await expect(
        blogsController.update(1, {
          title: 'Updated Blog',
          about: '',
          brief: '',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a blog if found', async () => {
      const mockBlog = { id: 1, title: 'Blog to delete' };
      blogsService.findOneById = jest.fn().mockResolvedValue(mockBlog);

      await expect(blogsController.remove(1)).resolves.toEqual({
        message: messagesConstant.BLOG_DELETED,
      });

      expect(blogsService.remove).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if blog is not found', async () => {
      blogsService.findOneById = jest.fn().mockResolvedValue(null);

      await expect(blogsController.remove(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
