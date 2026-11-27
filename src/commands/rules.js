const { SlashCommandBuilder } = require('discord.js');
const { baseEmbed } = require('../utils/embeds');
const { config } = require('../config');
module.exports = {
  data: new SlashCommandBuilder().setName('rules').setDescription('Show the TakenMC server rules.'),
  async execute({ reply }) {
    const rules = Array.isArray(config.rules) && config.rules.length ? config.rules : ['Please follow staff instructions and treat other players respectfully.'];
    await reply({ embeds: [baseEmbed(`${config.serverName} • Rules`, rules.map((rule, index) => `**${index + 1}.** ${rule}`).join('\n'))] });
  }
};
