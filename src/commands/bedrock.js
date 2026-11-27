const { SlashCommandBuilder } = require('discord.js');
const { baseEmbed } = require('../utils/embeds');
const { config } = require('../config');
module.exports = {
  data: new SlashCommandBuilder().setName('bedrock').setDescription('Show Bedrock Edition connection instructions.'),
  async execute({ reply }) {
    const embed = baseEmbed(`${config.serverName} • Bedrock Edition`, `**IP:** \`${config.bedrock.host}\`\n**Port:** \`${config.bedrock.port}\`\n\n**How to join (Bedrock, Mobile, Console)**\n1. Open Minecraft and choose **Play**.\n2. Open the **Servers** tab and select **Add Server**.\n3. Enter the IP and port above, then save and join.`);
    await reply({ embeds: [embed] });
  }
};
