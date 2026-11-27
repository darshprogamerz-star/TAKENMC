const { SlashCommandBuilder } = require('discord.js');
const { baseEmbed } = require('../utils/embeds');
const { config } = require('../config');
module.exports = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Check the bot response time.'),
  async execute({ reply, interaction, message }) {
    const roundTrip = Math.max(0, Date.now() - (interaction?.createdTimestamp || message?.createdTimestamp || Date.now()));
    const wsPing = interaction?.client?.ws?.ping ?? message?.client?.ws?.ping;
    const lines = [`🏓 **Pong!** ${roundTrip} ms round-trip/message latency`, `WebSocket: ${Number.isFinite(wsPing) ? `${Math.round(wsPing)} ms` : 'unavailable'}`];
    await reply({ embeds: [baseEmbed(`${config.serverName} • Ping`, lines.join('\n'))] });
  }
};
