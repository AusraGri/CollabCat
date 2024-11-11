import type { ColumnType } from 'kysely'

export type Generated<T> =
  T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>

export type Timestamp = ColumnType<Date, Date | string, Date | string>

export interface Categories {
  createdByUserId: number | null
  id: Generated<number>
  isDefault: Generated<boolean>
  title: string
}

export interface CompletedTasks {
  completedAt: Generated<Timestamp>
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

export interface RecurringTypes {
  id: Generated<number>
  recurringType: string | null
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

export interface TaskInstanceException {
  createdAt: Timestamp
  createdBy: number
  endDate: Timestamp
  id: Generated<number>
  isCanceled: boolean | null
  isFullDayEvent: Generated<boolean | null>
  isRescheduled: boolean | null
  startDate: Timestamp
  taskId: number
}

export interface Tasks {
  assignedUserId: number | null
  categoryId: number | null
  completedAt: Timestamp | null
  createdByUserId: number
  description: string | null
  endDate: Timestamp | null
  endTime: Timestamp | null
  groupId: number | null
  id: Generated<number>
  importance: string | null
  isCompleted: Generated<boolean>
  isFullDayEvent: Generated<boolean | null>
  parentTaskId: number | null
  points: number | null
  startDate: Timestamp
  startTime: Timestamp | null
  title: string
}

export interface User {
  auth0Id: string | null
  createdAt: Generated<Timestamp>
  email: string
  firstName: string
  id: Generated<number>
  lastName: string
  password: string
  provider: Generated<string>
  updatedAt: Generated<Timestamp>
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
  points: Points
  recurringPattern: RecurringPattern
  recurringTypes: RecurringTypes
  rewards: Rewards
  taskInstanceException: TaskInstanceException
  tasks: Tasks
  user: User
  userGroups: UserGroups
}
