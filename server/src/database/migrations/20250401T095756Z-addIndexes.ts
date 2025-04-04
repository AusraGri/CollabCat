import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>) {
  await db.schema
    .createIndex('idx_user_auth0_id')
    .on('user')
    .column('auth0_id')
    .execute()

  await db.schema
    .createIndex('idx_user_email')
    .on('user')
    .column('email')
    .execute()

  await db.schema
    .createIndex('idx_groups_created_by_user_id')
    .on('groups')
    .column('created_by_user_id')
    .execute()

  await db.schema
    .createIndex('idx_user_groups_user_id')
    .on('user_groups')
    .column('user_id')
    .execute()

  await db.schema
    .createIndex('idx_user_groups_group_id')
    .on('user_groups')
    .column('group_id')
    .execute()

  await db.schema
    .createIndex('idx_categories_group_id')
    .on('categories')
    .column('group_id')
    .execute()

  await db.schema
    .createIndex('idx_categories_created_by_user_id')
    .on('categories')
    .column('created_by_user_id')
    .execute()

  await db.schema
    .createIndex('idx_recurring_pattern_task_id')
    .on('recurring_pattern')
    .column('task_id')
    .execute()

  await db.schema
    .createIndex('idx_completed_tasks_task_id')
    .on('completed_tasks')
    .column('task_id')
    .execute()

  await db.schema
    .createIndex('idx_completed_tasks_instance_date')
    .on('completed_tasks')
    .column('instance_date')
    .execute()

  await db.schema
    .createIndex('idx_points_user_id')
    .on('points')
    .column('user_id')
    .execute()

  await db.schema
    .createIndex('idx_points_group_id')
    .on('points')
    .column('group_id')
    .execute()

  await db.schema
    .createIndex('idx_rewards_group_id')
    .on('rewards')
    .column('group_id')
    .execute()

  await db.schema
    .createIndex('idx_rewards_created_by_user_id')
    .on('rewards')
    .column('created_by_user_id')
    .execute()

  await db.schema
    .createIndex('idx_point_claims_user_id')
    .on('point_claims')
    .column('user_id')
    .execute()

  await db.schema
    .createIndex('idx_point_claims_task_id')
    .on('point_claims')
    .column('task_id')
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema.dropIndex('idx_user_auth0_id').execute()

  await db.schema.dropIndex('idx_user_email').execute()

  await db.schema.dropIndex('idx_groups_created_by_user_id').execute()

  await db.schema.dropIndex('idx_user_groups_user_id').execute()

  await db.schema.dropIndex('idx_user_groups_group_id').execute()

  await db.schema.dropIndex('idx_categories_group_id').execute()

  await db.schema.dropIndex('idx_categories_created_by_user_id').execute()

  await db.schema.dropIndex('idx_recurring_pattern_task_id').execute()

  await db.schema.dropIndex('idx_completed_tasks_task_id').execute()

  await db.schema.dropIndex('idx_completed_tasks_instance_date').execute()

  await db.schema.dropIndex('idx_points_user_id').execute()

  await db.schema.dropIndex('idx_points_group_id').execute()

  await db.schema.dropIndex('idx_rewards_group_id').execute()

  await db.schema.dropIndex('idx_rewards_created_by_user_id').execute()

  await db.schema.dropIndex('idx_point_claims_user_id').execute()

  await db.schema.dropIndex('idx_point_claims_task_id').execute()
}
