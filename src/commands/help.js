const { SlashCommandBuilder } = require('discord.js');
const { baseEmbed } = require('../utils/embeds');
const { config } = require('../config');
const descriptions = [
  '`/status` — Live server status and refresh button', '`/players` — Online count and player list', '`/ip` — Java + Bedrock addresses',
  '`/java` — Java Edition connection guide', '`/bedrock` — Bedrock / Mobile / Console guide', '`/rules` — Server rules',
  '`/vote` — Voting links and rewards', '`/ping` — Bot latency', '`/help` — Show this help'
];
module.exports = {
  data: new SlashCommandBuilder().setName('help').setDescription('List TakenMC bot commands.'),
  async execute({ reply }) {
    const embed = baseEmbed(`${config.serverName} • Help`, `${descriptions.join('\n')}\n\nUse slash commands (for example, \`/status\`) or mention the bot (\`@Bot status\`). The \`!status\` prefix also works.`);
    await reply({ embeds: [embed] });
  }
};
