const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('live')
        .setDescription('Listen to a tomorrowland livestream')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel)
        .setDMPermission(false)
        .addSubcommand(subcommand => 
            subcommand
                .setName('select')
                .setDescription('Select a livestream from the options listed')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('stop')
                .setDescription('Stop the current livestream')
        ),
    botPerms: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect]
}