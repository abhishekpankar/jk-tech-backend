import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FindUserByIdResponse } from '../types/response.type';

export type UserDecorator = NonNullable<FindUserByIdResponse>;

export const User = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.user;
  },
);
