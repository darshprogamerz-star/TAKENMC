# TakenMC Discord Bot

A modular Discord bot for **TakenMC** built with Node.js 18+ and discord.js v14. It provides slash commands, bot-mention commands, the optional `!` prefix, interactive server-status controls, and a Java status query with automatic API fallback.

## Features

- `/status`, `/players`, `/ip`, `/java`, `/bedrock`, `/rules`, `/vote`, `/ping`, and `/help`
- Equivalent commands by mentioning the bot (for example, `@TakenMC-Bot status`) or with `!status`
- Status from mcsrvstat.us v3, falling back to mcstatus.io v2; network/API failures are shown as a graceful offline status
- 30-second configurable cache; the Refresh button bypasses that cache and edits the existing message
- Per-user 10-second refresh cooldown and an ephemeral Server IP button
- Rules, vote URLs/rewards, addresses, colors, and timing values are editable in `config.json`

The project keeps commands, handlers, events, utilities, and Minecraft networking in separate modules. Small files are intentionally not merged so each feature has a clear responsibility.

## Requirements

- Node.js 18 or newer and npm
- A Discord application/bot
- Access to the TakenMC Discord server to invite the bot

## 1. Create and configure the Discord bot

1. Open the [Discord Developer Portal](https://discord.com/developers/applications) and choose **New Application**.
2. Name it (for example, `TakenMC Bot`), open **Bot**, and choose **Add Bot**.
3. On the Bot page, copy/reset the bot token. Keep it private; put it only in your local `.env` file.
4. Open **General Information** and copy the **Application ID**. This is the `CLIENT_ID`.
5. On the **Bot** page, enable **Message Content Intent** under **Privileged Gateway Intents**. Without this intent, `@Bot status` and `!status` cannot read message contents. Save the change.
6. To invite the bot, open **OAuth2 → URL Generator**. Select scopes `bot` and `applications.commands`. Select the `View Channels`, `Send Messages`, `Embed Links`, and `Read Message History` bot permissions. Copy the generated URL, open it, and authorize the bot in your server. Do not grant Administrator unless you have a separate reason to do so.

## 2. Install

From a terminal, clone the repository and enter the project folder:

```bash
git clone <your-repository-url>
cd <repository-folder>
npm install
```

This bot uses Node.js's built-in `fetch` (available in Node 18+) for Minecraft API requests, so no extra HTTP client such as axios is needed. `discord.js` and `dotenv` are installed through `package.json`.

## 3. Configure secrets and server settings

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```dotenv
DISCORD_TOKEN=your_real_bot_token
CLIENT_ID=your_application_id
GUILD_ID=your_test_server_id_optional
```

`GUILD_ID` is optional. When present, slash commands register only in that server and update quickly. When empty, commands register globally, and Discord may take time to propagate them.

Edit `config.json` to change server details, theme colors, cache/cooldown values, rules, voting links, or reward copy. The supplied vote URLs are clearly marked example links; replace them before sharing `/vote` with players. Current connection values are Java `takenmc.mcsh.gg:25565` and Bedrock `takenmc.mcsh.gg:19132`.

## 4. Register slash commands

```bash
npm run deploy
```

Run this again whenever slash-command definitions change. Make sure `DISCORD_TOKEN` and `CLIENT_ID` are set. For a quick test, set `GUILD_ID` to your Discord server ID before deploying.

## 5. Run the bot

```bash
npm start
```

For development with Node's watch mode:

```bash
npm run dev
```

## 6. Keep it online 24/7

On a Linux VPS, install PM2 and start the bot from the repository root:

```bash
npm install -g pm2
pm2 start src/index.js --name takenmc-bot
pm2 save
pm2 startup
```

Run the command printed by `pm2 startup` to enable startup on reboot. Other options include a VPS, Railway, or Render. Use a persistent Node worker/service, configure the environment variables in the provider dashboard, and do not upload `.env` or expose the bot token.

## 7. Test commands

After the bot is online and commands have been deployed, try slash commands:

- `/status`
- `/players`
- `/ip`

For message commands, in a channel the bot can read, try:

- `@TakenMC-Bot status`
- `@TakenMC-Bot players`
- `!status`
- `!help`

Replace `TakenMC-Bot` with the bot's actual mention. The bot ignores its own messages and other bot messages. Ensure **Message Content Intent** is enabled in both the Developer Portal and the bot's configured intents (the latter is already set in this project).

## Minecraft status behavior

Java status first requests `https://api.mcsrvstat.us/3/takenmc.mcsh.gg`; if that request fails or reports offline, it tries `https://api.mcstatus.io/v2/status/java/takenmc.mcsh.gg`. If neither provider can confirm the server online, the bot returns an offline result instead of throwing. Latency measures the API request duration. Status results are cached for 30 seconds by default, and the Refresh button forces a fresh API call after the per-user cooldown.

Bedrock status uses a separate function, `getBedrockStatus()`, and the Bedrock endpoint `https://api.mcsrvstat.us/bedrock/3/takenmc.mcsh.gg`; Bedrock uses a different query from Java. The current `/status` command intentionally reports Java status.

## Troubleshooting

- **Bot appears offline:** Check that `npm start` is running, the token is correct, the bot was invited, and the application has the `bot` scope. Inspect the console logs for login errors.
- **Slash commands do not show:** Run `npm run deploy`, confirm `CLIENT_ID`, and confirm the invite used `applications.commands`. Guild deployment with `GUILD_ID` is quickest for testing. Global registration can take time to appear.
- **Mention/prefix commands do not work:** Enable the **Message Content Intent** in Developer Portal → Bot, then restart the process. Also confirm the bot can view and read message history in that channel, and that you mention the actual bot.
- **Server appears offline:** Check the address/ports in `config.json` and whether the Minecraft server is reachable. API timeouts, provider outages, or query restrictions can temporarily show offline. The bot will log provider failures and will continue running.
- **Invalid token:** Reset/copy the token from the Developer Portal's Bot page, update `DISCORD_TOKEN` in `.env`, and restart. Never paste the token into chat, source code, or GitHub.
- **Missing permission or deleted status message:** Grant View Channel, Send Messages, and Embed Links. A Refresh button on a deleted message cannot update that deleted message; the bot logs the issue without crashing.
