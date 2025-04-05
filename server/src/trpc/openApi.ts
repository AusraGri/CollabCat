import { generateOpenApiDocument } from 'trpc-openapi'
import { appRouter } from '@server/controllers'
import config from '@server/config'

/**
 * Generates the OpenAPI documentation for the API using the app's router.
 *
 * This function:
 * - Uses `generateOpenApiDocument` to generate the API specification based on the provided configuration.
 * - Includes metadata such as title, description, version, and base URL for the API.
 * - Specifies the available API tags to categorize different endpoints.
 * - Defines a security scheme for OAuth2 authentication using Auth0 with implicit flow.
 *
 * @param {object} appRouter - The app's router that defines the API endpoints and their handlers.
 * @param {object} config - Configuration object to define the API documentation metadata.
 * @param {string} config.title - The title of the API documentation.
 * @param {string} config.description - A description of the API and how to use it.
 * @param {string} config.version - The version of the API.
 * @param {string} config.baseUrl - The base URL for the API.
 * @param {string[]} config.tags - A list of tags to categorize the API endpoints.
 * @param {object} config.securitySchemes - Defines the security schemes, such as OAuth2, for authenticating API requests.
 * @returns {object} - The generated OpenAPI specification object.
 */
export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'API Family',
  description:
    'First sign up and login, then Authorize with the given JWT token and you are good to go',
  version: '1.0.0',
  baseUrl: 'http://localhost:3000/api',
  tags: [
    'tasks',
    'group',
    'user',
    'points',
    'rewards',
    'category',
    'invitations',
  ],
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
})
