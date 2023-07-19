module.exports = {
    subCommand: 'live.stop',
    callback: async (interaction) => {
        const guildPlayer = interaction.client.players.get(interaction.guild.id);

        if (!guildPlayer) await interaction.reply({ content: 'There is no player on this server at the moment.', ephemeral: true });

        if (!interaction.member?.voice.channel) {
            await interaction.reply({ content: "You need to be inside a ****voice channel****.", ephemeral: true });
            return;
        }
        if (guildPlayer.requestedBy !== interaction.member.user) {
            await interaction.reply({ content: "You don't have permission to control this player.", ephemeral: true });
            return;
        }

        guildPlayer.player.stop();
        guildPlayer.connection.destroy();

        // Edit the embed to change state to stopped.
        guildPlayer.embed.setFields({ name: 'State', value: 'Stopped'})

        await interaction.reply({ content: 'The player has been stopped.', ephemeral: true });
        await guildPlayer.message.edit({ embeds: [guildPlayer.embed] });

        interaction.client.players.delete(interaction.guild.id);
    }
}