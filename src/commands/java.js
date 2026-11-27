const { SlashCommandBuilder } = require('discord.js');
const { baseEmbed } = require('../utils/embeds');
const { config } = require('../config');
module.exports = {
  data: new SlashCommandBuilder().setName('java').setDescription('Show Java Edition connection instructions.'),
  async execute({ reply }) {
    const embed = baseEmbed(`${config.serverName} • Java Edition`, `**IP:** \`${config.java.host}\`\n**Port:** \`${config.java.port}\`\n\n**How to join**\n1. Open Minecraft: Java Edition.\n2. Choose **Multiplayer** → **Add Server**.\n3. Enter \`${config.java.host}:${config.java.port}\` and join.`);
    await reply({ embeds: [embed] });
  }
};
