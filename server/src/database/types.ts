import type { ColumnType } from 'kysely'

export type ArrayTypeImpl<T> =
  T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S[], I[], U[]>
    : T[]

export type ArrayType<T> =
  ArrayTypeImpl<T> extends (infer U)[] ? U[] : ArrayTypeImpl<T>

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

export interface Groups {
  createdAt: Generated<Timestamp>
  createdByUserId: number
  id: Generated<number>
  name: string
}

export interface Repeat {
  daysOfWeek: Generated<string | null>
  endDate: Timestamp | null
  endTime: Timestamp | null
  id: Generated<number>
  interval: number | null
  specificDates: ArrayType<Timestamp> | null
  startDate: Timestamp
  startTime: Timestamp | null
  type: string
}

export interface Tasks {
  assignedUserId: number | null
  categoryId: number | null
  completed: Generated<boolean>
  completedAt: Timestamp | null
  createdByUserId: number
  description: string | null
  groupId: number | null
  id: Generated<number>
  importance: string | null
  points: number | null
  repeatId: number | null
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
  groups: Groups
  repeat: Repeat
  tasks: Tasks
  user: User
  userGroups: UserGroups
}
