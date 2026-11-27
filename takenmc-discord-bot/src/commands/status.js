const { SlashCommandBuilder } = require('discord.js');
const { getStatus } = require('../services/minecraft');
const { statusEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder().setName('status').setDescription('Show the live Minecraft server status.'),
  async execute({ reply, defer }) {
    await defer();
    const status = await getStatus();
    await reply(statusEmbed(status));
  }
};
