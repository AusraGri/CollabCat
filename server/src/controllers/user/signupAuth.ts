import { publicProcedure } from '@server/trpc'
import { TRPCError } from '@trpc/server'
import provideRepos from '@server/trpc/provideRepos'
import { userRepository } from '@server/repositories/userRepository'
import { assertError } from '@server/utils/errors'
import { userSchema } from '@server/entities/user'
import { verifyAuth0Token } from '@server/auth0/verifyAuth0Token'
import z from 'zod'
import config from '@server/config'

export default publicProcedure
  .use(
    provideRepos({
      userRepository,
    })
  )
  .meta({
    openapi: {
      method: 'POST',
      path: '/user/auth',
      tags: ['user'],
      summary: 'Signup user',
      example: {
        request: {
          auth0Token: 'auth0-token',
        },
      },
    },
  })
  .input(
    z.object({
      auth0Token: z.string(),
      username: z.string(),
      email: z.string().trim().toLowerCase().email(),
      picture: z.string().optional(),
    })
  )
  .output(userSchema)
  .mutation(
    async ({
      input: { auth0Token, email, username, picture },
      ctx: { repos },
    }) => {
      const userFromAuth0 = await verifyAuth0Token(
        auth0Token,
        config.auth0.audience,
        `https://${config.auth0.issuerBaseURL}/`
      )

      if (!userFromAuth0.sub) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid Auth0 token',
        })
      }

      const { sub: auth0Id } = userFromAuth0

      const provider = auth0Id.split('|')[0]

      const existingUser = await repos.userRepository.findByEmail(email)
      if (existingUser && existingUser.auth0Id === auth0Id) {
        return existingUser
      }

      const userCreated = await repos.userRepository
        .createUser({
          email,
          auth0Id,
          username,
          provider,
          picture,
        })
        .catch((error: unknown) => {
          assertError(error)
          if (error.message.includes('duplicate key')) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'User already exists',
              cause: error,
            })
          }

          throw error
        })

      return userCreated
    }
  )
