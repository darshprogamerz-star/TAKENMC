const { SlashCommandBuilder } = require('discord.js');
const { ipEmbed } = require('../utils/embeds');
module.exports = {
  data: new SlashCommandBuilder().setName('ip').setDescription('Show Java and Bedrock server connection details.'),
  async execute({ reply }) { await reply({ embeds: [ipEmbed()] }); }
};
