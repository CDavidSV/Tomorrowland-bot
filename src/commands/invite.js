const config = require('../../config.json');
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Invite me to your server')
    .setDMPermission(true),
    botPerms: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
    callback: async (interaction) => {
        const inviteUrl = config.inviteLink;

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Invite Tomorrowland 24/7 :)')
                    .setURL(inviteUrl)
                    .setStyle(ButtonStyle.Link),
            );

        const inviteEmbed = new EmbedBuilder()
            .setAuthor({ name: `Tomorrowland Bot Invite`, iconURL: interaction.client.user.avatarURL()})
            .setDescription("Bring the party to your server!")
            .setColor(config.embeds.colors.main)
            .setTimestamp()

        await interaction.reply({embeds: [inviteEmbed], components: [row]});
    }
}