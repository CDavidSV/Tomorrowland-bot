const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ComponentType } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, VoiceConnectionStatus, AudioPlayerStatus } = require('@discordjs/voice');
const config = require('../../config.json');
const getLiveStreams = require('../util/get-livestreams.js');
const ytdl = require('ytdl-core');

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