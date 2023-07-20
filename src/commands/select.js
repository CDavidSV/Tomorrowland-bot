const { EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ComponentType, ButtonBuilder, ButtonStyle } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, VoiceConnectionStatus, AudioPlayerStatus } = require('@discordjs/voice');
const config = require('../../config.json');
const getLiveStreams = require('../util/get-livestreams.js');
const streamsScheema = require('../scheemas/streamsScheema');

// Buttons.
const playerButtons = new ActionRowBuilder()
    .addComponents([
        new ButtonBuilder()
            .setCustomId('stop_player')
            .setLabel('◼')
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId('pause_playback')
            .setLabel('❚❚')
            .setStyle(ButtonStyle.Secondary),
    ]);

const playerButtonsPaused = new ActionRowBuilder()
    .addComponents([
        new ButtonBuilder()
            .setCustomId('stop_player')
            .setLabel('◼')
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId('resume_playback')
            .setLabel('▶')
            .setStyle(ButtonStyle.Success),
    ]);

const handlePLaybackButton = async (interaction) => {
    const guildPlayer = interaction.client.players.get(interaction.guildId);
    if (!guildPlayer) return;

    if (guildPlayer.state === 'playing') {
        guildPlayer.player.pause();
        guildPlayer.state = 'paused';
        
        const modifiedEmbed = guildPlayer.embed.setFields({ name: 'State', value: 'Paused' });
        await guildPlayer.message.edit({ embeds: [modifiedEmbed], components: [playerButtonsPaused] }).catch(console.error);
    } else if (guildPlayer.state === 'paused') {
        guildPlayer.player.unpause();
        guildPlayer.state = 'playing';

        const modifiedEmbed = guildPlayer.embed.setFields({ name: 'State', value: 'Delayed'});
        await guildPlayer.message.edit({ embeds: [modifiedEmbed], components: [playerButtons] }).catch(console.error);
    }
    await interaction.deferUpdate().catch(console.error);
}

const handleStopButton = async (interaction) => {
    const guildPlayer = interaction.client.players.get(interaction.guildId);
    if (!guildPlayer) return;

    guildPlayer.player.removeAllListeners();
    guildPlayer.player.stop(true);
    guildPlayer.connection.destroy();

    // Edit the embed to change state to stopped.
    guildPlayer.embed.setFields({ name: 'State', value: 'Stopped'})

    await guildPlayer.message.edit({ embeds: [guildPlayer.embed], components: [] }).catch(console.error);
    await interaction.deferUpdate().catch(console.error);
    interaction.client.players.delete(interaction.guild.id);
}

module.exports = {
    subCommand: 'live.select',
    callback: async (interaction) => {
        // Custom selector id.
        const id = `${interaction.id}${interaction.guild.id}`;

        // Create the selector.
        const livesEmbed = new EmbedBuilder()
            .setAuthor({name: interaction.client.user.username, iconURL: interaction.client.user.avatarURL()})
            .setTitle('Tomorrowland Livestreams')
            .setDescription('Select a tomorrowland livestream from the options below')

        const selector = new StringSelectMenuBuilder()
            .setCustomId(id)
            .setPlaceholder('Select a livestream')

        // Get current livestreams and add them to the selector.
        let selectOptions = [];
        const liveStreams = await getLiveStreams();
        
        if (!liveStreams || liveStreams.size === 0) {
            await interaction.reply({ content: 'There are no livestreams available at the moment.'});
            return;
        }

        // Start the collector.
        const selectCollector = interaction.channel?.createMessageComponentCollector({
            filter: (selectInteraction) => selectInteraction.customId === id,
            componentType: ComponentType.StringSelect,
            time: 900_000
        });

        // Add the livestreams to the selector as options.
        liveStreams.forEach((liveStream) => {
            selectOptions.push(
                new StringSelectMenuOptionBuilder()
                    .setLabel(liveStream.getTitle())
                    .setValue(liveStream.getVideoId())
                    .setDescription('🔴 Live')
            );
        });

        selector.addOptions(selectOptions);
        const row = new ActionRowBuilder().addComponents(selector);

        const originalMessage = await interaction.reply({ embeds: [livesEmbed], components: [row] });

        // Listen for the selection.
        selectCollector.on('collect', async (selectInteraction) => {
            if (selectInteraction.user.id !== interaction.user.id) {
                await selectInteraction.reply({ content: 'You cannot use this selector.', ephemeral: true });
                originalMessage.edit({ components: [row] });
                return;
            }
            if (!selectInteraction.member?.voice.channel) {
                await selectInteraction.reply({ content: "You need to be inside a ****voice channel****.", ephemeral: true });
                originalMessage.edit({ components: [row] });
                return;
            }
            if (selectInteraction.guild?.members.me?.voice.channel && interaction.member?.voice.channelId != interaction.guild?.members.me?.voice.channelId) {
                await selectInteraction.reply({ content: 'I\'m already inside a voice channel. Come say hi!', ephemeral: true });
                originalMessage.edit({ components: [row] });
                return;
            }
            if (!selectInteraction.member?.voice.channel.viewable) {
                await selectInteraction.reply({ content: 'Insufficient permissions to join the selected voice channel', ephemeral: true });
                originalMessage.edit({ components: [row] });
                return;
            }
            await selectInteraction.deferUpdate();

            const stream = liveStreams.get(selectInteraction.values[0]);
            const baseUrl = 'https://www.youtube.com/watch?v=';

            // Start button Collector.
            const buttonCollector = interaction.channel?.createMessageComponentCollector({
                filter: (buttonInteraction) => buttonInteraction.customId === 'stop_player' || buttonInteraction.customId === 'pause_playback' || buttonInteraction.customId === 'resume_playback',
                componentType: ComponentType.Button
            });
            
            buttonCollector.on('collect', async (buttonInteraction) => {
                if (buttonInteraction.user.id !== interaction.user.id) {
                    await buttonInteraction.reply({ content: 'You cannot control this player.', ephemeral: true });
                    return;
                }
                switch (buttonInteraction.customId) {
                    case 'stop_player':
                        handleStopButton(buttonInteraction);
                        break;
                    case 'pause_playback':
                        handlePLaybackButton(buttonInteraction);
                        break;
                    case 'resume_playback':
                        handlePLaybackButton(buttonInteraction);
                        break;
                }
            });

            // Edit the original message.
            const streamEmbed = new EmbedBuilder()
                .setTitle(stream.getTitle())
                .setURL(baseUrl + stream.getVideoId())
                .setAuthor({ name: 'Tomorrowland Live', iconURL: config.embeds.images.stream })
                .setImage(stream.getThumbnail())
                .setFields({ name: 'State', value: 'Live'})
                .setColor(config.embeds.colors.error)
                .setFooter({ text: `Requested by ${interaction.member.user.username}`, iconURL: interaction.member.user.avatarURL() })
                .setTimestamp()
            await originalMessage.edit({ embeds: [streamEmbed], components: [] }).catch(console.error);

            
            // ----------------- Voice -----------------

            // Join the voice channel.
            const connection = joinVoiceChannel({
                channelId: selectInteraction.member.voice.channelId,
                guildId: selectInteraction.guildId,
                adapterCreator: selectInteraction.guild.voiceAdapterCreator
            });
            
            // Get the manifest url.
            const manifestUrl = stream.getManifestUrl();

            // Create the player and get the stream.
            const player = createAudioPlayer();
            player.play(createAudioResource(manifestUrl, { inputType: 'url' }));

            connection.subscribe(player);

            // Save the player on the client.
            interaction.client.players.set(interaction.guildId, { player: player, connection: connection, message: originalMessage, requestedBy: interaction.member.user, embed: streamEmbed, state: 'playing' });

            // Listen for the player to stop.
            player.on(AudioPlayerStatus.Idle, async () => {
                try {
                    const newStream = await streamsScheema.findById({ _id: stream.getVideoId() });

                    player.stop(true);
                    player.play(createAudioResource(newStream.manifestUrl, { inputType: 'url' }));
                } catch (err) {
                    player.removeAllListeners();
                    player.stop(true);
                    connection.destroy();
                    interaction.client.players.delete(interaction.guildId);
                    console.error(err);
                    await interaction.channel?.send({ content: 'An error ocurred or the stream ended.' }).catch(console.error);
                }
            });

            player.on(AudioPlayerStatus.Playing, async () => {
                await originalMessage.edit({ embeds: [streamEmbed], components: [playerButtons] }).catch(console.error);
            });

            connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
                try {
                    await Promise.race([
                        entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                        entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                    ]);
                } catch (error) {
                    interaction.client.players.delete(interaction.guildId);
                    player.removeAllListeners();
                    player.stop(true);
                    connection.destroy();
                }
            });
        });
    } 
}