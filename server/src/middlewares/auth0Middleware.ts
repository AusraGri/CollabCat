import { auth } from 'express-oauth2-jwt-bearer'
import config from '@server/config'

export const validateAccessToken = auth({
  issuerBaseURL: `https://${config.auth0.issuerBaseURL}`,
  audience: config.auth0.audience,
})
