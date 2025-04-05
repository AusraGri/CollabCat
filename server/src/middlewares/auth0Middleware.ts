import { auth } from 'express-oauth2-jwt-bearer'
import config from '@server/config'

/**
 * Middleware to validate an access token using Auth0.
 *
 * This function:
 * - Validates the JWT access token by checking the issuer and audience
 * - Uses the `auth` middleware ( from a package `express-oauth2-jwt-bearer`) to secure routes
 *
 * The middleware will:
 * - Ensure the token is signed by the correct issuer (`issuerBaseURL`)
 * - Ensure the token is valid for the specified audience (`audience`)
 *
 * @param {object} config.auth0 - Configuration object containing the `issuerBaseURL` and `audience` values.
 * @returns {Function} - The middleware function that validates the access token.
 */
export const validateAccessToken = auth({
  issuerBaseURL: `https://${config.auth0.issuerBaseURL}`,
  audience: config.auth0.audience,
})
