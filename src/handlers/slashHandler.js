const { errorEmbed } = require('../utils/embeds');

async function handleSlash(interaction, commands) {
  const command = commands.get(interaction.commandName);
  if (!command) {
    try { await interaction.reply({ embeds: [errorEmbed('That command is not available.')], ephemeral: true }); }
    catch (error) { console.error('[Slash] Could not respond to unknown command:', error); }
    return;
  }

  const context = {
    interaction,
    reply: (payload) => interaction.deferred || interaction.replied ? interaction.editReply(payload) : interaction.reply(payload),
    defer: () => interaction.deferred || interaction.replied ? Promise.resolve() : interaction.deferReply()
  };
  try {
    await command.execute(context);
  } catch (error) {
    console.error(`[Slash] /${interaction.commandName} failed:`, error);
    const payload = { embeds: [errorEmbed()], ephemeral: true };
    try {
      if (interaction.deferred || interaction.replied) await interaction.followUp(payload);
      else await interaction.reply(payload);
    } catch (responseError) {
      console.error('[Slash] Failed to send error response:', responseError);
    }
  }
}

module.exports = { handleSlash };
