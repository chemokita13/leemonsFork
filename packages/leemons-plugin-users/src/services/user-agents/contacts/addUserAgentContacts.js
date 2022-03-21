const _ = require('lodash');
const { table } = require('../../tables');

/**
 * ES: Dice que los user agents en _fromUserAgent tienen acceso a ver a todos los user agents en _toUserAgent
 * @public
 * @static
 * @param {string|string[]} _fromUserAgent - User agent id/s
 * @param {string|string[]} _toUserAgent - User agent id/s
 * @param {any=} transacting - DB Transaction
 * @return {Promise<boolean>}
 * */
async function addUserAgentContacts(
  _fromUserAgent,
  _toUserAgent,
  { target = null, transacting: _transacting } = {}
) {
  const fromUserAgents = _.isArray(_fromUserAgent) ? _fromUserAgent : [_fromUserAgent];
  const toUserAgents = _.isArray(_toUserAgent) ? _toUserAgent : [_toUserAgent];
  return global.utils.withTransaction(
    async (transacting) => {
      const pluginName = this.calledFrom;
      const allUserAgentIds = fromUserAgents.concat(toUserAgents);

      const userAgents = await table.userAgent.find(
        { id_$in: allUserAgentIds },
        {
          columns: ['role', 'id'],
          transacting,
        }
      );
      const userAgentRoles = _.map(userAgents, 'role');
      const [roleCenter, roleProfile] = await Promise.all([
        table.roleCenter.find(
          { role_$in: userAgentRoles },
          {
            columns: ['id', 'role', 'center'],
            transacting,
          }
        ),
        table.profileRole.find(
          { role_$in: userAgentRoles },
          {
            columns: ['id', 'role', 'profile'],
            transacting,
          }
        ),
      ]);

      const roleCenterByRole = _.keyBy(roleCenter, 'role');
      const roleProfileByRole = _.keyBy(roleProfile, 'role');
      const userAgentsById = _.keyBy(userAgents, 'id');

      const promises = [];

      _.forEach(fromUserAgents, (fromUserAgent) => {
        const gPromises = [];
        const fromCenter = roleCenterByRole[userAgentsById[fromUserAgent].role].center;
        const fromProfile = roleProfileByRole[userAgentsById[fromUserAgent].role].profile;
        _.forEach(toUserAgents, (toUserAgent) => {
          const toCenter = roleCenterByRole[userAgentsById[toUserAgent].role].center;
          const toProfile = roleProfileByRole[userAgentsById[toUserAgent].role].profile;
          gPromises.push(
            table.userAgentContacts.set(
              {
                fromUserAgent,
                toUserAgent,
                pluginName,
                target,
              },
              {
                fromUserAgent,
                fromCenter,
                fromProfile,
                toUserAgent,
                toCenter,
                toProfile,
                pluginName,
                target,
              },
              { transacting }
            )
          );
        });
        promises.push(Promise.all(gPromises));
      });

      return await Promise.all(promises);
    },
    table.userAgentContacts,
    _transacting
  );
}

module.exports = { addUserAgentContacts };
