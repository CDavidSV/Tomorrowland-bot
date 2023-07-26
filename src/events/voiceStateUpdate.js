const { Events } = require('discord.js');

module.exports = {
    name: Events.VoiceStateUpdate,
    once: false,
    async execute(oldState, newState) {
        if (!newState.guild.members.me.voice.channelId) return;
        if (oldState.channelId !== newState.guild.members.me.voice.channelId) return;

        const voiceChannel = newState.guild.channels.cache.get(newState.guild.members.me.voice.channelId);
        const members = voiceChannel.members;

        if (!members || members.size <= 1) {
            setTimeout(async () => {
                const guildPlayer = newState.client.players.get(newState.guild.id);

                if (!guildPlayer || voiceChannel.members.size > 1) return;
                try {
                    guildPlayer.player.removeAllListeners();
                    guildPlayer.player.stop(true);
                    guildPlayer.buttonCollector.stop();

                    guildPlayer.connection.destroy();
                    newState.client.players.delete(newState.guild.id);

                    // Edit the embed to change state to stopped.
                    guildPlayer.embed.setFields({ name: 'State', value: 'Stopped'})

                    await guildPlayer.message.edit({ embeds: [guildPlayer.embed], components: [] });
                } catch (err) {
                    console.error(err);
                }
            }, 300_000);
        }
    }
}