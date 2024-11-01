import type { Database } from '@server/database'
import type { Points } from '@server/database/types'
import type { DeleteResult, Insertable } from 'kysely'
import { pointsKeysPublic, type PointsPublic } from '@server/entities/points'


export interface PointAlterObject {
    userId: number
    points: number
    action: '+' | '-'
}

export function pointsRepository(db: Database) {
  return {
    async createPoints(pointObject: Insertable<Points>): Promise<PointsPublic> {
      return db
        .insertInto('points')
        .values(pointObject)
        .returning(pointsKeysPublic)
        .executeTakeFirstOrThrow()
    },

    async getPoints(userId: number): Promise<PointsPublic> {
      return db
        .selectFrom('points')
        .select(pointsKeysPublic)
        .where('userId', '=', userId)
        .executeTakeFirstOrThrow()
    },

    async deletePoints(userId: number): Promise<DeleteResult> {
      return db
        .deleteFrom('points')
        .where('userId', '=', userId)
        .executeTakeFirstOrThrow()
    },

    async alterPoints(object: PointAlterObject): Promise<PointsPublic> {
        return db
          .updateTable('points')
          .set((eb)=>({
            points: eb('points', object.action, object.points)
          }))
          .where('userId', '=', object.userId)
          .returning(pointsKeysPublic)
          .executeTakeFirstOrThrow()
      },
  }
}

export type PointsRepository = ReturnType<typeof pointsRepository>
