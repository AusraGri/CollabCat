import type { Kysely } from 'kysely'
import { allPermissions } from '../data/permissions'

const permissionValues = allPermissions.map(permission => ({
    permissionName: permission
}));
export async function up(db: Kysely<any>) {
    await db.transaction().execute(async (trx) => {
        await trx
            .insertInto('permissions')
            .values(permissionValues)
            .execute();
    });
}

export async function down(db: Kysely<any>) {
    await db.transaction().execute(async (trx) => {
        const deletePromises = permissionValues.map(permission => 
            trx
                .deleteFrom('permissions')
                .where('permissions.permissionName', '=', permission.permissionName)
                .execute()
        );
        await Promise.all(deletePromises);
    });
}

