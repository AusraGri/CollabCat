import { router } from '@server/trpc'
import getGroupInvitations from './getGroupInvitations'
import validateInvitationToken from './validateInvitationToken'
import deleteInvitation from './deleteInvitation'
import getInvitationData from './getInvitationData'

export default router({
    getGroupInvitations,
    validateInvitationToken,
    deleteInvitation,
    getInvitationData

})