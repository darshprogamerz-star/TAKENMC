const { getStatus } = require('../services/minecraft');
const { statusEmbed, ipEmbed, errorEmbed } = require('../utils/embeds');
const cooldowns = require('../utils/cooldowns');
const { config } = require('../config');

async function handleButton(interaction) {
  try {
    if (interaction.customId === 'show_server_ip') {
      await interaction.reply({ embeds: [ipEmbed()], ephemeral: true });
      return;
    }
    if (interaction.customId !== 'refresh_status') {
      await interaction.reply({ embeds: [errorEmbed('That button is no longer supported.')], ephemeral: true });
      return;
    }

    const key = `${interaction.user.id}:refresh_status`;
    const remaining = cooldowns.remaining(key, config.refreshCooldownSeconds);
    if (remaining > 0) {
      await interaction.reply({ content: `Please wait **${remaining} second${remaining === 1 ? '' : 's'}** before refreshing again.`, ephemeral: true });
      return;
    }
    cooldowns.set(key, config.refreshCooldownSeconds);
    await interaction.deferUpdate();
    const status = await getStatus({ force: true });
    // Editing the existing message avoids producing duplicate status posts.
    await interaction.message.edit(statusEmbed(status));
  } catch (error) {
    console.error(`[Button] ${interaction.customId} failed:`, error);
    try {
      if (interaction.deferred || interaction.replied) await interaction.followUp({ embeds: [errorEmbed('Could not refresh the status. The original message may have been deleted.')], ephemeral: true });
      else await interaction.reply({ embeds: [errorEmbed()], ephemeral: true });
    } catch (responseError) {
      // A deleted source message or expired interaction can no longer be answered.
      console.error('[Button] Could not report button error:', responseError);
    }
  }
}

module.exports = { handleButton };
