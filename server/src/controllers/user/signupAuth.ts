import { publicProcedure } from '@server/trpc'
import { TRPCError } from '@trpc/server'
import provideRepos from '@server/trpc/provideRepos'
import { userRepository } from '@server/repositories/userRepository'
import { assertError } from '@server/utils/errors'
import { idSchema } from '@server/entities/shared'
import { userSchema } from '@server/entities/user'
import { verifyAuth0Token } from '@server/trpc/authenticatedProcedure'
import { authManagement } from '@server/auth0/getManagementToken'
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
      email: z.string().email(),
      picture: z.string().optional(),
    })
  )
  .output(
   userSchema
  )
  .mutation(
    async ({ input: { auth0Token, email, username }, ctx: { repos } }) => {
      // Verify the Auth0 token and get user info from Auth0

      const userFromAuth0 = await verifyAuth0Token(
        auth0Token,
        config.auth0.audience,
        `https://${config.auth0.issuerBaseURL}/`
      )

      if (!userFromAuth0) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid Auth0 token',
        })
      }

      // Extract user details from Auth0 (email, name, sub, etc.)
      const { sub: auth0Id } = userFromAuth0

      // Extract provider based on the `sub` value (the `sub` value contains the provider info)
      const provider = auth0Id.split('|')[0]

      // Check if a user already exists by email
      const existingUser = await repos.userRepository.findByEmail(email)
      if (existingUser) {
        // res.setHeader('Set-Cookie', `authToken=${auth0Token}; HttpOnly; Secure; SameSite=Strict; Path=/;`);
        return existingUser
      }

      // Create a new user record in your database (without the password field)
      const userCreated = await repos.userRepository
        .create({
          email,
          auth0Id,
          username,
          provider,
        })
        .catch((error: unknown) => {
          assertError(error)
          // Handling database errors (e.g., duplicate key)
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
