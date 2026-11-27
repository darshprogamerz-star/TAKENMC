const { errorEmbed } = require('../utils/embeds');

async function handlePrefix(message, commands) {
  if (!message.guild || message.author.bot) return;
  const content = message.content.trim();
  const mention = new RegExp(`^<@!?${message.client.user.id}>\\s*`, 'i');
  let rest;
  if (mention.test(content)) rest = content.replace(mention, '');
  else if (content.startsWith('!')) rest = content.slice(1).trim();
  else return;

  const [name] = rest.split(/\s+/);
  if (!name) return;
  const command = commands.get(name.toLowerCase());
  if (!command) return;
  try {
    await command.execute({
      message,
      reply: (payload) => message.reply(payload),
      defer: async () => {} // Message replies do not have Discord's slash-command response deadline.
    });
  } catch (error) {
    console.error(`[Prefix] ${name} failed:`, error);
    try { await message.reply({ embeds: [errorEmbed()] }); }
    catch (responseError) { console.error('[Prefix] Could not send error reply:', responseError); }
  }
}

module.exports = { handlePrefix };
