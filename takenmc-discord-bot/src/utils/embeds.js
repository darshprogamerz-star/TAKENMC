const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { config } = require('../config');

const color = (hex) => Number.parseInt(hex.replace('#', ''), 16);

function baseEmbed(title, description, tint = config.theme.default) {
  return new EmbedBuilder()
    .setColor(color(tint))
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();
}

function errorEmbed(message = 'Something went wrong. Please try again in a moment.') {
  return baseEmbed('Unable to complete that request', message, config.theme.offline);
}

function ipEmbed() {
  const embed = baseEmbed(`${config.serverName} • Server IP`, 'Connect using the details below.', config.theme.default)
    .addFields(
      { name: 'Java Edition', value: `Address: \`${config.java.host}\`\nPort: \`${config.java.port}\`\nCopy: \`${config.java.host}:${config.java.port}\``, inline: true },
      { name: 'Bedrock Edition', value: `Address: \`${config.bedrock.host}\`\nPort: \`${config.bedrock.port}\`\nCopy: \`${config.bedrock.host}:${config.bedrock.port}\``, inline: true }
    );
  return embed;
}

function statusEmbed(status) {
  const online = Boolean(status.online);
  const state = online ? 'Online' : 'Offline';
  const embed = baseEmbed(`${config.serverName} • Server Status`, `${online ? '🟢' : '🔴'} **${state}**`, online ? config.theme.online : config.theme.offline)
    .addFields(
      { name: 'Server Name', value: config.serverName, inline: true },
      { name: 'Online Players', value: online ? `${status.players.online} / ${status.players.max}` : '0 / 0', inline: true },
      { name: 'Ping / Latency', value: `${Number.isFinite(status.latency) ? status.latency : '—'} ms`, inline: true },
      { name: 'Version / Software', value: online ? [status.version, status.software].filter(Boolean).join(' • ') || 'Unknown' : 'Unavailable while offline', inline: false },
      { name: 'MOTD', value: online && status.motd ? status.motd.slice(0, 1000) : (online ? 'No MOTD provided.' : 'The server could not be reached.'), inline: false }
    )
    .setFooter({ text: `${config.footerText} • ${state}` });

  let files;
  if (online && status.icon) {
    const match = status.icon.match(/^data:image\/(png|jpeg|jpg);base64,([A-Za-z0-9+/=]+)$/);
    if (match) {
      embed.setThumbnail('attachment://server-icon.png');
      files = [{ attachment: Buffer.from(match[2], 'base64'), name: 'server-icon.png' }];
    }
  }
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('refresh_status').setLabel('Refresh').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('show_server_ip').setLabel('Server IP').setStyle(ButtonStyle.Secondary)
  );
  return { embeds: [embed], components: [row], ...(files ? { files } : {}) };
}

function playersEmbed(status) {
  const count = `${status.players.online} / ${status.players.max}`;
  let names;
  if (!status.online) names = 'The server is currently offline.';
  else if (!status.playerListVisible) names = 'Player list is hidden by the server';
  else if (status.playerNames.length === 0) names = 'No players are online right now.';
  else names = status.playerNames.slice(0, 40).map((name) => `• ${name}`).join('\n');
  return baseEmbed(`${config.serverName} • Players`, `**Online:** ${count}\n\n${names}`, status.online ? config.theme.online : config.theme.offline);
}

module.exports = { baseEmbed, errorEmbed, ipEmbed, statusEmbed, playersEmbed };
