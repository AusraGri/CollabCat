import { generateOpenApiDocument } from 'trpc-openapi'
import { appRouter } from '@server/controllers'
import config from '@server/config';

export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'API Family',
  description:
    'First sign up and login, then Authorize with the given JWT token and you are good to go',
  version: '1.0.0',
  baseUrl: 'http://localhost:3000/api',
  tags: ['tasks', 'group', 'user', 'points', 'rewards', 'category', 'invitations'],
  securitySchemes: {
    Auth0: {
      type: 'oauth2',
      flows: {
        implicit: {
          authorizationUrl: `https://${config.auth0.domain}/authorize?audience=${config.auth0.audience}`,
          scopes: {
            openid: 'Open Id',
            profile: 'Profile',
            email: 'E-mail',
          },
        },
      },
    },
  },
});


