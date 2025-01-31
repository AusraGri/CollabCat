import type { Database } from '@server/database'
import type { PointClaims, Points } from '@server/database/types'
import type { DeleteResult, Insertable } from 'kysely'
import {
  pointsKeysPublic,
  type PointsClaimed,
  type PointsPublic,
} from '@server/entities/points'

export interface PointAlterObject {
  groupId?: number
  userId: number
  points: number
  action: '+' | '-' | '='
}

export type DeletePoints = Omit<PointAlterObject, 'points' | 'action'>

export function pointsRepository(db: Database) {
  return {
    async createPoints(pointObject: Insertable<Points>): Promise<PointsPublic> {
      return db
        .insertInto('points')
        .values(pointObject)
        .returning(pointsKeysPublic)
        .executeTakeFirstOrThrow()
    },

    async getPoints(queryData: {
      userId: number
      groupId?: number
    }): Promise<PointsPublic | undefined> {
      let query = db
        .selectFrom('points')
        .select(pointsKeysPublic)
        .where('userId', '=', queryData.userId)

      if (queryData.groupId) {
        query = query.where('points.groupId', '=', queryData.groupId)
      }

      if (queryData.groupId === undefined) {
        query = query.where('points.groupId', 'is', null)
      }

      return query.executeTakeFirst()
    },

    async addPointClaims(
      claimData: Insertable<PointClaims>
    ): Promise<PointsClaimed> {
      return db
        .insertInto('pointClaims')
        .values(claimData)
        .returningAll()
        .executeTakeFirstOrThrow()
    },

    async getPointClaims(claimData: {
      userId: number
      taskId: number
      taskInstanceDate: Date
    }): Promise<PointsClaimed | undefined> {
      return db
        .selectFrom('pointClaims')
        .select([
          'pointClaims.claimedAt',
          'pointClaims.id',
          'pointClaims.taskId',
          'pointClaims.taskInstanceDate',
          'pointClaims.userId',
        ])
        .where('pointClaims.taskId', '=', claimData.taskId)
        .where('pointClaims.userId', '=', claimData.userId)
        .where('pointClaims.taskInstanceDate', '=', claimData.taskInstanceDate)
        .executeTakeFirst()
    },

    async deletePoints(options: DeletePoints): Promise<DeleteResult> {
      let query = db.deleteFrom('points').where('userId', '=', options.userId)
      if (options.groupId !== undefined) {
        query = query.where('groupId', '=', options.groupId)
      } else {
        query = query.where('groupId', 'is', null)
      }

      return query.executeTakeFirst()
    },

    async alterPoints(object: PointAlterObject): Promise<PointsPublic> {
      let query = db
        .updateTable('points')
        .set((eb) => {
          if (object.action === '+') {
            return { points: eb('points', '+', object.points) }
          }

          if (object.action === '-') {
            return { points: eb('points', '-', object.points) }
          }

          return { points: object.points }
        })
        .where('userId', '=', object.userId)

      if (object.groupId !== undefined) {
        query = query.where('groupId', '=', object.groupId)
      }

      if (!object.groupId) {
        query = query.where('groupId', 'is', null)
      }

      return query.returning(pointsKeysPublic).executeTakeFirstOrThrow()
    },
  }
}

export type PointsRepository = ReturnType<typeof pointsRepository>
