export const appConfig = () => ({
  jwt: {
    secret: process.env.JWT_SECRET,
    expiry: process.env.JWT_EXPIRY,
  },
  bcrypt: {
    saltRounds: 10,
  },
  swagger: {
    title: 'Wanna Blog',
    version: '1.0',
    path: 'api',
  },
  oAuth: {
    google: {
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_OAUTH_REDIRECT_URI,
    },
  },
  users: {
    findAll: {
      limit: 10,
    },
    defaultRoleId: 3,
  },
  blogs: {
    findAll: {
      limit: 10,
    },
    defaultRoleId: 3,
  },
});

export type AppConfig = ReturnType<typeof appConfig>;
