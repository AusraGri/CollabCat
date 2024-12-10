import { router } from '@server/trpc'
import getGroupInvitations from './getGroupInvitations'
import validateInvitationToken from './validateInvitationToken'
import deleteInvitation from './deleteInvitation'

export default router({
    getGroupInvitations,
    validateInvitationToken,
    deleteInvitation

})