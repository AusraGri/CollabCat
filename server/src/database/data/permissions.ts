

const allEntities = [
    'tasks',
    'group',
    'user',
    'points',
    'rewards',
    'categories'
]

const crudActions = ['read', 'create', 'update', 'delete']

const groupActions = ['invite', 'kick']

const rewardsActions = ['claim']

const memberEntities = [
    'tasks',
]

function createPermissions(entities: string[], actions: string[]): string[] {
    const permissions: string[] = [];

    entities.forEach(entity => {
        actions.forEach(action => {
            permissions.push(`${entity}:${action}`);
        });
    });

    return permissions;
}

const groupPermissions = createPermissions(['group'], groupActions)
export const permissions = createPermissions(allEntities, crudActions)

const additionalRewardsPermissions = createPermissions(['rewards'], rewardsActions)
export const allPermissions = [... groupPermissions, ...permissions, ...additionalRewardsPermissions]
export const memberPermissions = [...createPermissions(memberEntities, crudActions), ...additionalRewardsPermissions]