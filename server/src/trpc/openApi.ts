import { generateOpenApiDocument } from 'trpc-openapi'
import { appRouter } from '@server/controllers'


// Generate OpenAPI schema document
export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'API Family',
  description: 'First sign up and login, then Authorize with the given JWT token and you are good to go',
  version: '1.0.0',
  baseUrl: 'http://localhost:3000/api',
  tags: ['tasks', 'group', 'user', 'points', 'rewards'],
  securitySchemes: {
    BearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
  },
})



