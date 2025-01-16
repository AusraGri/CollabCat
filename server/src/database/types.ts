import type { ColumnType } from 'kysely'

export type Generated<T> =
  T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>

export type Timestamp = ColumnType<Date, Date | string, Date | string>

export interface Categories {
  createdByUserId: number | null
  groupId: number | null
  id: Generated<number>
  isDefault: Generated<boolean>
  isGroupDefault: Generated<boolean>
  title: string
}

export interface CompletedTasks {
  completedAt: Generated<Timestamp>
  completedBy: number | null
  id: Generated<number>
  instanceDate: Timestamp
  taskId: number
}

export interface Groups {
  createdAt: Generated<Timestamp>
  createdByUserId: number
  id: Generated<number>
  name: string
}

export interface Invitations {
  createdAt: Generated<Timestamp>
  email: string
  groupId: number
  id: Generated<number>
  invitationToken: string
}

export interface PointClaims {
  claimedAt: Generated<Timestamp>
  id: Generated<number>
  taskId: number
  taskInstanceDate: Timestamp
  userId: number
}

export interface Points {
  createdAt: Generated<Timestamp>
  groupId: number | null
  points: Generated<number>
  userId: number
}

export interface RecurringPattern {
  dayOfMonth: number[] | null
  dayOfWeek: number[] | null
  maxNumOfOccurrences: number | null
  monthOfYear: number[] | null
  recurringType: string
  separationCount: Generated<number>
  taskId: number
  weekOfMonth: number[] | null
}

export interface RewardClaims {
  claimedAt: Generated<Timestamp>
  id: Generated<number>
  rewardId: number
  userId: number
}

export interface Rewards {
  amount: number | null
  cost: number
  createdByUserId: number
  groupId: number | null
  id: Generated<number>
  targetUserIds: number[] | null
  title: string
}

export interface Tasks {
  assignedUserId: number | null
  categoryId: number | null
  completedAt: Timestamp | null
  createdByUserId: number
  description: string | null
  endDate: Timestamp | null
  groupId: number | null
  id: Generated<number>
  importance: string | null
  isCompleted: Generated<boolean>
  isRecurring: Generated<boolean | null>
  points: number | null
  startDate: Timestamp | null
  startTime: string | null
  title: string
}

export interface User {
  auth0Id: string
  createdAt: Generated<Timestamp>
  email: string
  id: Generated<number>
  picture: string | null
  provider: Generated<string>
  updatedAt: Generated<Timestamp>
  username: string | null
}

export interface UserGroups {
  groupId: number
  role: string
  userId: number
}

export interface DB {
  categories: Categories
  completedTasks: CompletedTasks
  groups: Groups
  invitations: Invitations
  pointClaims: PointClaims
  points: Points
  recurringPattern: RecurringPattern
  rewardClaims: RewardClaims
  rewards: Rewards
  tasks: Tasks
  user: User
  userGroups: UserGroups
}
