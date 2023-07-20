const DiscordJS = require('discord.js');
const dotenv = require('dotenv');
const setupEvents = require('./handlers/event-handler.js');
const setupCommands = require('./handlers/command-handler.js');
const colors = require('colors');
const reloadStreams = require('./util/reload-streams.js');
const mongoose = require('mongoose');

dotenv.config();
colors.enable();
const Token = process.env.TOKEN;

// Create client and add intents.
(async () => {
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
  
  // Connect to mongo
  await mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('Connected to MongoDB'.green);
  }).catch((e) => {
    console.error(e);
  });
  
  setupEvents(client);
  setupCommands(Token, client);
  
  // This function will run in parallel with the bot. If the database is empty, no streams will be available. 
  // If it's the first time using the bot, run the function once before starting it.
  reloadStreams(); 
  
  // Token.
  client.login(Token);
  
  module.exports = client;
})();