const { ActivityType } = require('discord.js');
module.exports = (client) => {
  client.once('ready', () => {
    client.user.setPresence({ activities: [{ name: 'TakenMC | /status', type: ActivityType.Watching }], status: 'online' });
    console.log(`[Ready] Logged in as ${client.user.tag} across ${client.guilds.cache.size} server(s).`);
  });
};
