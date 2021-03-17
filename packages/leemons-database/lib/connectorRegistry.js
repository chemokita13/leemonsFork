const _ = require('lodash');
const importConnector = require('./importConnector');

function createConnectorRegistry({ connections, defaultConnection }, connectorInstance) {
  const connectors = new Map();
  return {
    load: () => {
      // Register each different connector
      Object.values(connections).forEach((connection) => {
        const { connector } = connection;
        if (!connectors.has(connector)) {
          connectors.set(connector, importConnector(connector)(connectorInstance.leemons));
        }
      });
    },

    init: () =>
      Promise.all(
        [...connectors.values()].map((connector) =>
          connector.init().then(() => {
            [...connector.models.entries()].forEach(([key, value]) => {
              connectorInstance.models.set(key, value);
            });
          })
        )
      ),

    getAll: () => [...connectors.values()],

    get: (key) => connectors.get(key),

    getFromConnection: (key) => connectors.get(connections[key].connector),

    set: (key, value) => connectors.set(key, value),

    get default() {
      return this.get(connections[defaultConnection].connector);
    },
  };
}

module.exports = createConnectorRegistry;
