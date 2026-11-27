const http = require('node:http');
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
  console.error('DISCORD_TOKEN is missing. Add it to the environment or copy .env.example to .env.');
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const commands = new Collection(commandModules.map((command) => [command.data.name, command]));
readyEvent(client);
interactionEvent(client, commands);
messageEvent(client, commands);
client.on('error', (error) => console.error('[Discord] Client error:', error));

// Render Web Services require an HTTP listener. This small endpoint is only a health check;
// Discord bot commands and gateway traffic continue to use discord.js as usual.
const healthServer = http.createServer((request, response) => {
  const pathname = new URL(request.url || '/', 'http://localhost').pathname;
  if (request.method === 'GET' && (pathname === '/' || pathname === '/health')) {
    response.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
    response.end(JSON.stringify({ status: 'ok', discord: client.isReady() ? 'ready' : 'connecting' }));
    return;
  }
  response.writeHead(404, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify({ error: 'Not found' }));
});

const port = Number(process.env.PORT) || 3000;
healthServer.on('error', (error) => {
  console.error('[HTTP] Health server error:', error);
  process.exit(1);
});
healthServer.listen(port, '0.0.0.0', () => {
  console.log(`[HTTP] Health endpoint listening on port ${port}.`);
});

client.login(env.token).catch((error) => {
  console.error('[Startup] Discord login failed. Check DISCORD_TOKEN and bot settings:', error);
  process.exit(1);
});

function shutdown(signal) {
  console.log(`[Process] ${signal} received; shutting down cleanly.`);
  client.destroy();
  healthServer.close(() => process.exit(0));
  // Ensure shutdown completes if the HTTP listener cannot close cleanly.
  setTimeout(() => process.exit(0), 5000).unref();
}

process.once('SIGTERM', () => shutdown('SIGTERM'));
process.once('SIGINT', () => shutdown('SIGINT'));
