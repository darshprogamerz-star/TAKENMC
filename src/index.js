const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { env } = require('./config');
const commandModules = [
  require('./commands/status'), require('./commands/ip'), require('./commands/ping'), require('./commands/help'),
  require('./commands/players'), require('./commands/java'), require('./commands/bedrock'), require('./commands/rules'), require('./commands/vote')
];
const readyEvent = require('./events/ready');
const interactionEvent = require('./events/interactionCreate');
const messageEvent = require('./events/messageCreate');

process.on('unhandledRejection', (reason) => console.error('[Process] Unhandled promise rejection:', reason));
process.on('uncaughtException', (error) => {
  console.error('[Process] Uncaught exception:', error);
  // Keep the process alive for recoverable listener failures; fatal runtime errors remain visible in logs.
});

if (!env.token) {
  console.error('DISCORD_TOKEN is missing. Copy .env.example to .env and add your bot token.');
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const commands = new Collection(commandModules.map((command) => [command.data.name, command]));
readyEvent(client);
interactionEvent(client, commands);
messageEvent(client, commands);

client.login(env.token).catch((error) => {
  console.error('[Startup] Discord login failed. Check DISCORD_TOKEN and bot settings:', error);
  process.exitCode = 1;
});
