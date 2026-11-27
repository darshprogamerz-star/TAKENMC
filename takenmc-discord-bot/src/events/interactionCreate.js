const { handleSlash } = require('../handlers/slashHandler');
const { handleButton } = require('../handlers/buttonHandler');
module.exports = (client, commands) => {
  client.on('interactionCreate', async (interaction) => {
    try {
      if (interaction.isChatInputCommand()) await handleSlash(interaction, commands);
      else if (interaction.isButton()) await handleButton(interaction);
    } catch (error) {
      console.error('[Interaction] Unexpected interaction error:', error);
    }
  });
};
