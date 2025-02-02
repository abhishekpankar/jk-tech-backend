export const serverConfig = () => ({
  config: {
    port: process.env.PORT,
    nodeEnv: process.env.NODE_ENV,
  },
});

export type ServerConfig = ReturnType<typeof serverConfig>['config'];
