
export const apiOrigin = (process.env.VITE_API_ORIGIN as string) || 'http://localhost:4000'
export const apiPath = (process.env.VITE_API_PATH as string) || '/api/v1/trpc'

if (typeof apiOrigin !== 'string') {
  throw new Error('VITE_API_ORIGIN is not defined')
}

if (typeof apiPath !== 'string') {
  throw new Error('VITE_API_PATH is not defined')
}
