const { SlashCommandBuilder } = require('discord.js');
const { baseEmbed } = require('../utils/embeds');
const { config } = require('../config');
module.exports = {
  data: new SlashCommandBuilder().setName('vote').setDescription('Show voting links and rewards.'),
  async execute({ reply }) {
    const links = (Array.isArray(config.voteLinks) ? config.voteLinks : []).map((item) => {
      const name = item?.name || 'Vote here';
      const url = item?.url || '';
      return /^https:\/\//i.test(url) ? `[${name}](${url})` : `**${name}** — link not configured`;
    });
    const description = `${config.voteRewards || 'Thanks for supporting TakenMC!'}\n\n${links.length ? links.join('\n') : 'Voting links are not configured yet.'}`;
    await reply({ embeds: [baseEmbed(`${config.serverName} • Vote`, description)] });
  }
};
