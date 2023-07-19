const DiscordJS = require('discord.js');
const dotenv = require('dotenv');
const setupEvents = require('./handlers/event-handler.js');
const setupCommands = require('./handlers/command-handler.js');
const colors = require('colors');

dotenv.config();
colors.enable();
const Token = process.env.TOKEN

// Create client and add intents.
const client = new DiscordJS.Client({
  intents: [
    DiscordJS.GatewayIntentBits.Guilds,
    DiscordJS.GatewayIntentBits.GuildMessages,
    DiscordJS.GatewayIntentBits.MessageContent,
    DiscordJS.GatewayIntentBits.GuildVoiceStates
  ]
});

client.players = new DiscordJS.Collection();
client.subCommands = new DiscordJS.Collection();
client.slashCommands = new DiscordJS.Collection();

setupEvents(client);
setupCommands(Token, client);

// Token.
client.login(Token);

module.exports = client;