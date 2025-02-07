import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  NotFoundException,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { messagesConstant } from 'src/common/constants/messages.constant';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { FindAllBlogsDto } from './dto/find-all-blogs.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { Public, User } from 'src/common/decorators';
import { FindUserByIdResponse } from 'src/common/types/response.type';

@ApiTags('Blogs')
@Controller({
  path: 'blogs',
  version: '1',
})
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Post()
  async create(
    @Body() createBlogDto: CreateBlogDto,
    @User() user: FindUserByIdResponse,
  ) {
    await this.blogsService.create(user.id, createBlogDto);
    return {
      message: messagesConstant.ADD_BLOG_RESPONSE,
    };
  }

  @Get()
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
  })
  async findAll(@Query() queryParams: FindAllBlogsDto) {
    const { page } = queryParams;
    const result = await this.blogsService.findAll(page);
    return {
      result,
      message: messagesConstant.BLOGS_FETCHED,
    };
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const blog = await this.blogsService.findOneById(id);
    if (!blog) {
      throw new NotFoundException(messagesConstant.BLOG_NOT_FOUND);
    }
    return {
      message: messagesConstant.BLOG_FETCHED,
      result: blog,
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBlogDto: UpdateBlogDto,
  ) {
    const blog = await this.blogsService.findOneById(id);
    if (!blog) {
      throw new NotFoundException(messagesConstant.BLOG_NOT_FOUND);
    }
    // if (updateUserDto.roleId) {
    //   const role = await this.roleService.getOneById(updateUserDto.roleId);
    //   if (!role) {
    //     throw new BadRequestException(messagesConstant.INVALID_ROLE_ID);
    //   }
    // }
    await this.blogsService.update(id, updateBlogDto);
    return {
      message: messagesConstant.BLOG_UPDATED,
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const blog = await this.blogsService.findOneById(id);
    if (!blog) {
      throw new NotFoundException(messagesConstant.BLOG_NOT_FOUND);
    }
    await this.blogsService.remove(id);
    return {
      message: messagesConstant.BLOG_DELETED,
    };
  }
}
