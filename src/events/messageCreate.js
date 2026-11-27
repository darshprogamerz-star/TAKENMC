const { handlePrefix } = require('../handlers/prefixHandler');
module.exports = (client, commands) => {
  client.on('messageCreate', (message) => {
    handlePrefix(message, commands).catch((error) => console.error('[Message] Unexpected handler error:', error));
  });
};
