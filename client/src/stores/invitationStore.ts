import { defineStore } from 'pinia'
import { trpc } from '@/trpc'
import type { UserPublic, GroupsPublic, PublicInvitation } from '@server/shared/types'
export interface DecodedToken {
  user: {
    email: string
  }
  iat: number
  exp: number
}

export interface TokenData {
  decoded: DecodedToken
  invitation: PublicInvitation
}

export type ActiveGroup = Omit<GroupsPublic, 'createdByUserId'>
interface InvitationState {
  invitationToken: string | null
  tokenData: TokenData | null
  groupData: GroupsPublic | null
  inviter: UserPublic | null
  invitations: PublicInvitation[] | null
}

export const useInvitationStore = defineStore('invitations', {
  state: (): InvitationState => ({
    invitationToken: null,
    tokenData: null,
    groupData: null,
    inviter: null,
    invitations: null,
  }),

  actions: {
    async validateInvitationToken() {
      try {
        const token = this.invitationToken

        if (!token) throw new Error('Missing invitation token')

        const tokenData = await trpc.invitations.validateInvitationToken.query({
          invitationToken: token,
        })
        this.tokenData = tokenData

        return tokenData
      } catch (error) {
        throw new Error(`Failed to validate the invitation token : ${error}`)
      }
    },

    async fetchInvitations() {
      try {
        const data = await trpc.invitations.getGroupInvitations.query()
        this.invitations = data

        return data
      } catch (error) {
        console.error('Failed to fetch user groups data:', error)
      }
    },

    async getGroupData() {
      try {
        const groupId = this.tokenData?.invitation.groupId

        if (!groupId) throw new Error('Missing group id')

        const [group] = await trpc.groups.getGroupInfo.query({ groupId })
        this.groupData = group

        return group
      } catch (error) {
        throw new Error('Failed to fetch group info')
      }
    },
    async acceptInvitation(invitation?: PublicInvitation) {
      try {
        const groupId = this.tokenData?.invitation.groupId || invitation?.groupId

        if (!groupId) throw new Error('Missing group id')

        await trpc.groups.addUserToGroup.mutate({ groupId })

        if (this.invitations) {
          this.invitations = this.invitations?.filter((inv) => inv.id != invitation?.id) || null
        }
      } catch (error) {
        throw new Error('Failed to fetch group info')
      }
    },
    async getInviterData() {
      try {
        const groupOwnerId = this.groupData?.createdByUserId

        if (!groupOwnerId) throw new Error('Missing inviter id')

        const owner = await trpc.user.getUserById.query({ userId: groupOwnerId })
        this.inviter = owner || null

        return owner
      } catch (error) {
        throw new Error('Failed to retrieve inviter')
      }
    },
    async deleteInvitation() {
      try {
        if (this.invitationToken) {
          await trpc.invitations.deleteInvitation.mutate({ invitationToken: this.invitationToken })

          this.invitationToken = null
          this.groupData = null
          this.tokenData = null
          this.inviter = null
        }
      } catch (error) {
        throw new Error('Failed to delete invitation')
      }
    },
    async declineInvitation(invitation: PublicInvitation) {
      try {
        this.invitations = this.invitations?.filter((inv) => inv.id != invitation.id) || null

        await trpc.invitations.deleteInvitation.mutate({
          invitationToken: invitation.invitationToken,
        })
      } catch (error) {
        console.log('error while deleting invitation')
      }
    },
  },
  persist: {
    storage: sessionStorage,
    pick: ['invitationToken'],
  },
})

export type InvitationStore = ReturnType<typeof useInvitationStore>
