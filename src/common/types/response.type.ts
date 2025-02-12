import { UsersService } from 'src/modules/users/users.service';

export type FindUserByIdResponse = Awaited<
  ReturnType<UsersService['findOneById']>
>;
