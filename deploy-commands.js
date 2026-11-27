const { REST, Routes } = require('discord.js');
const { env } = require('./src/config');
const commandModules = [
  require('./src/commands/status'), require('./src/commands/ip'), require('./src/commands/ping'), require('./src/commands/help'),
  require('./src/commands/players'), require('./src/commands/java'), require('./src/commands/bedrock'), require('./src/commands/rules'), require('./src/commands/vote')
];

async function deploy() {
  if (!env.token || !env.clientId) throw new Error('DISCORD_TOKEN and CLIENT_ID are required in .env.');
  const rest = new REST({ version: '10' }).setToken(env.token);
  const body = commandModules.map((command) => command.data.toJSON());
  const route = env.guildId
    ? Routes.applicationGuildCommands(env.clientId, env.guildId)
    : Routes.applicationCommands(env.clientId);
  console.log(`[Deploy] Registering ${body.length} slash commands ${env.guildId ? `to guild ${env.guildId}` : 'globally'}...`);
  await rest.put(route, { body });
  console.log('[Deploy] Slash commands registered successfully.');
}

deploy().catch((error) => {
  console.error('[Deploy] Could not register slash commands:', error);
  process.exitCode = 1;
});
