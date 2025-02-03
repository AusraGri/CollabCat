import type { Database } from '@server/database'
import type { RewardClaims, Rewards } from '@server/database/types'
import type { DeleteResult, Insertable, Selectable, Updateable } from 'kysely'
import { rewardsKeysAll, rewardClaimsKeysAll } from '@server/entities/rewards'
import { pointsKeysPublic } from '@server/entities/points'

export interface RewardUpdate {
  id: number
  reward: Updateable<Rewards>
}

export interface GetRewards {
  id?: number
  groupId?: number
  createdByUserId?: number
  targetUserIds?: number[]
}

export function rewardsRepository(db: Database) {
  return {
    async createReward(
      reward: Insertable<Rewards>
    ): Promise<Selectable<Rewards>> {
      return db
        .insertInto('rewards')
        .values(reward)
        .returning(rewardsKeysAll)
        .executeTakeFirstOrThrow()
    },

    async getRewards(getOptions: GetRewards): Promise<Selectable<Rewards>[]> {
      if (
        getOptions.id === undefined &&
        getOptions.groupId === undefined &&
        getOptions.createdByUserId === undefined &&
        (getOptions.targetUserIds === undefined ||
          getOptions.targetUserIds.length === 0)
      ) {
        return []
      }

      let query = db.selectFrom('rewards').select(rewardsKeysAll)

      if (getOptions.id !== undefined) {
        query = query.where('id', '=', getOptions.id)
      }

      if (getOptions.createdByUserId !== undefined) {
        query = query
          .where('createdByUserId', '=', getOptions.createdByUserId)
          .where('groupId', 'is', null)
      }

      if (getOptions.groupId !== undefined) {
        query = query.where('groupId', '=', getOptions.groupId)
      }

      if (
        getOptions.targetUserIds !== undefined &&
        getOptions.targetUserIds.length > 0
      ) {
        query = query.where('targetUserIds', 'in', getOptions.targetUserIds)
      }

      return query.execute()
    },

    async deleteReward(rewardId: number): Promise<DeleteResult> {
      return db
        .deleteFrom('rewards')
        .where('id', '=', rewardId)
        .executeTakeFirstOrThrow()
    },

    async updateReward(reward: RewardUpdate): Promise<Selectable<Rewards>> {
      return db
        .updateTable('rewards')
        .set(reward.reward)
        .where('id', '=', reward.id)
        .returning(rewardsKeysAll)
        .executeTakeFirstOrThrow()
    },
    async addRewardClaim(data: {
      rewardId: number
      userId: number
    }): Promise<Selectable<RewardClaims>> {
      return db
        .insertInto('rewardClaims')
        .values(data)
        .returning(rewardClaimsKeysAll)
        .executeTakeFirstOrThrow()
    },
    async claimReward(data: {
      rewardId: number
      userId: number
      updatedPoints: number
      groupId?: number
      rewardAmount?: number
    }): Promise<boolean> {
      return db.transaction().execute(async (trx) => {
        const { rewardId, userId, updatedPoints } = data

        const groupId = data.groupId || null

        await trx
          .updateTable('points')
          .set({ points: updatedPoints })
          .where('points.userId', '=', data.userId)
          .where('points.groupId', groupId ? '=' : 'is', groupId)
          .returning(pointsKeysPublic)
          .executeTakeFirstOrThrow()

        if (data.rewardAmount) {
          await trx
            .updateTable('rewards')
            .set({
              amount: data.rewardAmount,
            })
            .where('rewards.id', '=', rewardId)
            .executeTakeFirstOrThrow()
        }

        const result = await trx
          .insertInto('rewardClaims')
          .values({
            rewardId,
            userId,
          })
          .returning('rewardClaims.id')
          .executeTakeFirstOrThrow()

        return !!result
      })
    },
  }
}

export type RewardsRepository = ReturnType<typeof rewardsRepository>
