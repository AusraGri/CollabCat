import { ManagementClient } from 'auth0'
import config from '@server/config'

export const authManagement = new ManagementClient({
  domain: config.auth0.clientOriginUrl,
  clientId: config.auth0.clientId,
  clientSecret: config.auth0.clientSecret,
})
