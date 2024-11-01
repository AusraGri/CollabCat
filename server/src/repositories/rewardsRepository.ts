import type { Database } from '@server/database'
import type { Rewards } from '@server/database/types'
import type { DeleteResult, Insertable, Selectable, Updateable } from 'kysely'
import { rewardsKeysAll, type RewardUpdateables} from '@server/entities/rewards'


export interface RewardUpdate {
    id: number
    createdByUserId: number
    reward: Updateable<RewardUpdateables>
  }

export interface GetRewards {
    id?: number
    groupId?: number
    createdByUserId?: number
    targetUserIds?: number[]
  }

export function rewardsRepository(db: Database) {
  return {
    async createReward(reward: Insertable<Rewards>): Promise<Selectable<Rewards>> {
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
            (getOptions.targetUserIds === undefined || getOptions.targetUserIds.length === 0)
        ) {
            return []
        }

        let query = db.selectFrom('rewards').select(rewardsKeysAll)

        if (getOptions.id !== undefined){
            query = query.where('id', '=', getOptions.id)
        }

        if (getOptions.createdByUserId !== undefined){
            query = query.where('createdByUserId', '=', getOptions.createdByUserId)
        }

        if (getOptions.groupId !== undefined){
            query = query.where('groupId', '=', getOptions.groupId)
        }

        if (getOptions.targetUserIds!== undefined && getOptions.targetUserIds.length > 0){
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

    async updateReward(object:RewardUpdate): Promise<Selectable<Rewards>> {
        return db
          .updateTable('rewards')
          .set(object.reward)
          .where('createdByUserId', '=', object.createdByUserId)
          .where('id', '=', object.id)
          .returning(rewardsKeysAll)
          .executeTakeFirstOrThrow()
      },
  }
}

export type RewardsRepository = ReturnType<typeof rewardsRepository>
