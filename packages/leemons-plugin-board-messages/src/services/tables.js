const table = {
  messageConfig: leemons.query('plugins_board-messages::message-config'),
  messageConfigPrograms: leemons.query('plugins_board-messages::message-config-programs'),
  messageConfigProfiles: leemons.query('plugins_board-messages::message-config-profiles'),
  messageConfigClasses: leemons.query('plugins_board-messages::message-config-classes'),
  messageConfigCenters: leemons.query('plugins_board-messages::message-config-centers'),
};

module.exports = { table };
