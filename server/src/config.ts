// import 'dotenv/config'
import 'dotenv-flow/config'
import { z } from 'zod'

process.env.DOTENV_CONFIG_PATH = '/server' 

const { env } = process

if (!env.NODE_ENV) env.NODE_ENV = 'development'

env.TZ = 'UTC'

const isTest = env.NODE_ENV === 'test'
const isDevTest = env.NODE_ENV === 'development' || isTest

const schema = z
  .object({
    env: z
      .enum(['development', 'production', 'staging', 'test'])
      .default('development'),
    isCi: z.preprocess(coerceBoolean, z.boolean().default(false)),
    port: z.coerce.number().default(3000),

    auth: z.object({
      tokenKey: z.string().default(() => {
        if (isDevTest) {
          return 'supersecretkey'
        }

        throw new Error('You must provide a TOKEN_KEY in a production env!')
      }),
      expiresIn: z.string().default('7d'),
      passwordCost: z.coerce.number().default(isDevTest ? 6 : 12),
    }),

    database: z.object({
      connectionString: z.string().url(),
    }),
    testDatabase: z.object({
      connectionString: z.string().url(),
    }),
    auth0: z.object({
      audience: z.string(),
      issuerBaseURL: z.string(),
      clientOriginUrl: z.string(),
      clientId: z.string(),
      clientSecret: z.string(),
    }),
    emailService: z.object({
      host: z.string(),
      port: z.coerce.number().int().positive(),
      auth: z.object({
        user: z.string().email(),
        pass: z.string(),
      }),
    }),
  })
  .readonly()

const config = schema.parse({
  env: env.NODE_ENV,
  port: env.PORT,
  isCi: env.CI,

  auth: {
    tokenKey: env.TOKEN_KEY,
    expiresIn: env.TOKEN_EXPIRES_IN,
    passwordCost: env.PASSWORD_COST,
  },
  auth0: {
    audience: env.AUTH0_AUDIENCE,
    issuerBaseURL: env.AUTH0_DOMAIN,
    clientOriginUrl: env.CLIENT_ORIGIN_URL,
    clientId: env.AUTH0_CLIENT_ID,
    clientSecret: env.AUTH0_CLIENT_SECRET,
  },
  database: {
    connectionString: env.DATABASE_URL,
  },
  testDatabase: {
    connectionString: env.TEST_DATABASE_URL,
  },
  emailService: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  },
})

export default config

function coerceBoolean(value: unknown) {
  if (typeof value === 'string') {
    return value === 'true' || value === '1'
  }

  return undefined
}
