const DiscordJS = require('discord.js');
const dotenv = require('dotenv');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, VoiceConnectionStatus, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
dotenv.config();
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


client.on('ready', bot => {
  console.log(`Successfully logged in as ${bot.user.tag}`);

  bot.user.setActivity('Tomorrowland', { type: "LISTENING" });
})

client.on('messageCreate', async msg => {
  const prefix = '$';
  if (msg.author.bot || !msg.content.startsWith(prefix)) return;

  const cmd = msg.content.slice(prefix.length);

  switch (cmd) {
    case '24/7':

      const url = 'https://www.youtube.com/watch?v=J695pAM07Gs';

      if (!msg.member?.voice.channel) {
        msg.reply("You need to be inside a ****voice channel****.");
        return;
      }
      if (msg.guild?.members.me?.voice.channel && msg.member?.voice.channelId != msg.guild?.members.me?.voice.channelId) {
        msg.reply('I\'m already inside another voice channel. Come say hi!');
        return;
      }
      if (!msg.member?.voice.channel.viewable) {
        msg.reply('Insufficient permissions to join the selected voice channel');
        return;
      }

      const connection = joinVoiceChannel({
        channelId: msg.member.voice.channelId,
        guildId: msg.guildId,
        adapterCreator: msg.guild.voiceAdapterCreator
      })

      const player = createAudioPlayer();

      // Get audio from video.
      const videoID = ytdl.getURLVideoID(url);
      const stream = ytdl(videoID, { highWaterMark: 1 << 25, dlChunkSize: 1<<12, quality: [91,92,93,94,95], opusEncoded: true, liveBuffer: 4900 });

      // Create the audio player.
      const resource = createAudioResource(stream);
      player.play(resource);

      // Subscribe to the player.
      const subscription = connection.subscribe(player);

      connection.on(VoiceConnectionStatus.Disconnected, async () => {
        try {
          await Promise.race([
            entersState(connection, VoiceConnectionStatus.Signalling, 1000),
            entersState(connection, VoiceConnectionStatus.Connecting, 1000)
          ])
        } catch (error) {
          player.stop();
          subscription.unsubscribe();
          queue = [];
          if (connection.state.status !== 'destroyed') {
            connection.destroy();
          }
        }
      })

      player.on(AudioPlayerStatus.Idle, () => {
        console.log(`An Error Occured`)                
      })

      break;

  }
})

// Token.
client.login(Token);
