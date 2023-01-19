const _ = require('lodash');
const { table } = require('../tables');

async function getUserAgentRoomsList(userAgent, { transacting } = {}) {
  const uair = await table.userAgentInRoom.find({ userAgent }, { transacting });
  const roomKeys = _.map(uair, 'room');
  const [rooms, unreadMessages, userAgents] = await Promise.all([
    table.room.find({ key_$in: roomKeys }, { transacting }),
    table.roomMessagesUnRead.find(
      {
        room_$in: roomKeys,
        userAgent,
      },
      { transacting }
    ),
    table.userAgentInRoom.find({ room_$in: roomKeys }, { transacting }),
  ]);

  const userAgentsByRoom = _.groupBy(userAgents, 'room');

  const userAgen = await leemons
    .getPlugin('users')
    .services.users.getUserAgentsInfo(_.map(userAgents, 'userAgent'), { withProfile: true });
  const userAgentsById = _.keyBy(userAgen, 'id');

  const result = [];
  const unreadMessagesByRoom = _.keyBy(unreadMessages, 'room');
  const uairByRoom = _.keyBy(uair, 'room');
  _.forEach(rooms, (room) => {
    result.push({
      ...room,
      nameReplaces: JSON.parse(room.nameReplaces),
      metadata: JSON.parse(room.metadata),
      muted: uairByRoom[room.id]?.muted || false,
      unreadMessages: unreadMessagesByRoom[room.key]?.count || 0,
      userAgents: _.map(userAgentsByRoom[room.key], (a) => ({
        userAgent: userAgentsById[a.userAgent],
        deleted: a.deleted,
      })),
    });
  });

  return result;
}

module.exports = { getUserAgentRoomsList };
