const _ = require('lodash');
const { existUserAgent } = require('./existUserAgent');
const { table } = require('../tables');

async function _updateUserAgentPermissions(userAgentId, { transacting: _transacting } = {}) {
  await existUserAgent({ id: userAgentId }, true, { transacting: _transacting });
  return await global.utils.withTransaction(
    async (transacting) => {
      // ES: Borramos los permisos que salieran desde roles y sacamos todos los roles actuales del usuario, ya sea por que vienen desde grupos/perfiles/o el mismo rol que tiene
      const [groupUserAgent, userAgent] = await Promise.all([
        table.groupUserAgent.find({ userAgent: userAgentId }, { columns: ['group'], transacting }),
        table.userAgent.update({ id: userAgentId }, { reloadPermissions: false }, { transacting }),
        table.userAgentPermission.deleteMany(
          {
            userAgent: userAgentId,
            role_$null: false,
          },
          { transacting }
        ),
      ]);

      // ES: Sacamos los roles de los grupos y los perfiles a los que pertenezca el usuario
      const [groupRoles, profileRoles] = await Promise.all([
        table.groupRole.find(
          { group_$in: _.map(groupUserAgent, 'group') },
          { columns: ['role'], transacting }
        ),
        table.profileRole.find({ role: userAgent.role }, { columns: ['profile'], transacting }),
      ]);

      const profiles = await table.profiles.find(
        { id_$in: _.map(profileRoles, 'profile') },
        {
          columns: ['role'],
          transacting,
        }
      );

      const roleIds = _.uniq(
        [userAgent.role].concat(_.map(groupRoles, 'role')).concat(_.map(profiles, 'role'))
      );

      const [rolePermissions, roleCenter] = await Promise.all([
        table.rolePermission.find({ role_$in: roleIds }, { transacting }),
        table.roleCenter.find({ role_$in: roleIds }, { transacting }),
      ]);

      const roleCenterByRole = _.keyBy(roleCenter, 'role');
      return await table.userAgentPermission.createMany(
        _.map(rolePermissions, (rolePermission) => ({
          userAgent: userAgentId,
          role: rolePermission.role,
          permissionName: rolePermission.permissionName,
          actionName: rolePermission.actionName,
          target: rolePermission.target,
          center: roleCenterByRole[rolePermission.role]
            ? roleCenterByRole[rolePermission.role].center
            : null,
        })),
        { transacting }
      );
    },
    table.userAgent,
    _transacting
  );
}

/**
 * EN:
 * Updates the permissions of the user if it is marked as reload permissions according to their
 * roles and the roles of the groups to which they belong.
 *
 * ES:
 * Borra todos los permisos que ya tuviera el usuario que vinieran desde un rol y vuelve a generar
 * todos los permisos desde los roles en los que esta el usuario
 *
 * @public
 * @static
 * @param {string | string[]} userAgentId - User auth id
 * @param {any=} transacting - DB Transaction
 * @return {Promise<any>}
 * */
async function updateUserAgentPermissions(userAgentId, { transacting } = {}) {
  if (_.isArray(userAgentId)) {
    const results = [];
    for (let i = 0, l = userAgentId.length; i < l; i++) {
      results.push(await _updateUserAgentPermissions(userAgentId[i], { transacting }));
    }
    return results;
  } else {
    return _updateUserAgentPermissions(userAgentId, { transacting });
  }
}

module.exports = { updateUserAgentPermissions };
