import { generateOpenApiDocument } from 'trpc-openapi';
import { appRouter } from '@server/controllers';
// Generate OpenAPI schema document
export const openApiDocument = generateOpenApiDocument(appRouter, {
    title: 'API Family',
    description: 'OpenAPI compliant REST API built using tRPC with Express',
    version: '1.0.0',
    baseUrl: 'http://localhost:3000/api',
    tags: ['tasks'],
  });