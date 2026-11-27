const { SlashCommandBuilder } = require('discord.js');
const { getStatus } = require('../services/minecraft');
const { playersEmbed } = require('../utils/embeds');
module.exports = {
  data: new SlashCommandBuilder().setName('players').setDescription('Show the online player count and visible names.'),
  async execute({ reply, defer }) {
    await defer();
    const status = await getStatus();
    await reply({ embeds: [playersEmbed(status)] });
  }
};
