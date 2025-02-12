import { Test, TestingModule } from '@nestjs/testing';
import { GoogleStrategy } from './google.strategy';
import { UsersService } from 'src/modules/users/users.service';

describe('GoogleStrategy', () => {
  let googleStrategy: GoogleStrategy;
  let mockUserService: Partial<UsersService>;

  beforeEach(async () => {
    mockUserService = {};

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleStrategy,
        {
          provide: UsersService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    googleStrategy = moduleRef.get<GoogleStrategy>(GoogleStrategy);
  });

  describe('validate', () => {
    it('should return user details extracted from Google profile', async () => {
      const profile = {
        id: 'google-id-123',
        name: { givenName: 'John', familyName: 'Doe' },
        emails: [{ value: 'john.doe@example.com' }],
        photos: [{ value: 'http://example.com/john.jpg' }],
      };

      const done = jest.fn();

      await googleStrategy.validate(
        'access-token',
        'refresh-token',
        profile,
        done,
      );

      expect(done).toHaveBeenCalledWith(null, {
        provider: 'google',
        providerId: 'google-id-123',
        email: 'john.doe@example.com',
        name: 'John Doe',
        picture: 'http://example.com/john.jpg',
      });
    });

    it('should handle missing email gracefully', async () => {
      const profile = {
        id: 'google-id-123',
        name: { givenName: 'John', familyName: 'Doe' },
        emails: [],
        photos: [{ value: 'http://example.com/john.jpg' }],
      };

      const done = jest.fn();

      await googleStrategy.validate(
        'access-token',
        'refresh-token',
        profile,
        done,
      );

      expect(done).toHaveBeenCalledWith(null, {
        provider: 'google',
        providerId: 'google-id-123',
        email: undefined,
        name: 'John Doe',
        picture: 'http://example.com/john.jpg',
      });
    });

    it('should handle missing profile picture gracefully', async () => {
      const profile = {
        id: 'google-id-123',
        name: { givenName: 'John', familyName: 'Doe' },
        emails: [{ value: 'john.doe@example.com' }],
        photos: [],
      };

      const done = jest.fn();

      await googleStrategy.validate(
        'access-token',
        'refresh-token',
        profile,
        done,
      );

      expect(done).toHaveBeenCalledWith(null, {
        provider: 'google',
        providerId: 'google-id-123',
        email: 'john.doe@example.com',
        name: 'John Doe',
        picture: undefined,
      });
    });
  });
});
