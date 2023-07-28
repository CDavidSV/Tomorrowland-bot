const { SlashCommandBuilder, PermissionFlagsBits, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ComponentType } = require("discord.js");
const paginate = require("../util/paginate.js");
const PaginationHandler = require("../handlers/pagination-handler.js");
const config = require("../../config.json");
const lineupScheema = require("../scheemas/lineupScheema.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("lineup")
        .setDescription("Shows the timetable for the current weekend.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages),
    botPerms: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
    callback: async (interaction) => {
        const lineups = await lineupScheema.find().catch((err) => {console.error(err); return null;});

        if (!lineups || lineups.length < 1) return await interaction.reply({ content: "There are no current lineups" });

        let lineupsStream1 = [];
        let lineupsStream2 = [];

        lineups.sort((a, b) => a.startTimestamp - b.startTimestamp);
        for (const lineup of lineups) {
            let message = ``;
            if (Date.now() > lineup.startTimestamp && Date.now() < lineup.endTimestamp) message = `**${lineup.artistName}:** \`Now Playing\`\n*${lineup.stage}*`;
            else if (Date.now() < lineup.startTimestamp) message = `**${lineup.artistName}:** Up Next <t:${lineup.startTimestamp / 1000}:R>\n*${lineup.stage}*`;
            else if (Date.now() > lineup.endTimestamp) message = `**${lineup.artistName}:** Finished <t:${lineup.endTimestamp / 1000}:R>\n*${lineup.stage}*`;

            if (lineup.stream === 1) lineupsStream1.push(message);
            else lineupsStream2.push(message);
        }

        const streamSelect = new StringSelectMenuBuilder()
        .setCustomId(`stream${interaction.id}`)
        .setPlaceholder('Make a selection!')
        .addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel('TV #1')
                .setDescription('Stage: Mainstage')
                .setValue('1')
                .setEmoji('1134553190830977294')
                .setDefault(true),
            new StringSelectMenuOptionBuilder()
                .setLabel('TV #2')
                .setDescription('Stage: Freedom')
                .setValue('2')
                .setEmoji('1134553190830977294'))

        const row = new ActionRowBuilder()
			.addComponents(streamSelect);

        const lineupEmbedsStream1 = paginate(lineupsStream1, 10, { title: "Timetable", description: "Current and upcoming sets on the Mainstage:", color: config.embeds.colors.main, thumbnail: "https://cdn.discordapp.com/attachments/1107660251286745108/1134371336559534191/one_world_radio_logo.png" });
        const lineupEmbedsStream2 = paginate(lineupsStream2, 10,{ title: "Timetable", description: "Current and upcoming sets on the Freedom stage:", color: config.embeds.colors.main, thumbnail: "https://cdn.discordapp.com/attachments/1107660251286745108/1134371336559534191/one_world_radio_logo.png" });
        
        const handlePagination1 = new PaginationHandler(interaction.id, lineupEmbedsStream1);
        const handlePagination2 = new PaginationHandler(interaction.id, lineupEmbedsStream2);

        const replyMsg = await interaction.reply({ content: handlePagination1.getPageNumber(), embeds: [handlePagination1.getCurrentEmbed()], components: [row, handlePagination1.getButtons()], fetchReply: true });

        const selectCollector = interaction.channel.createMessageComponentCollector({ ComponentType: ComponentType.ActionRow, filter: (i) => i.customId === `stream${interaction.id}`, time: 3600000 });
        const buttonCollector = interaction.channel.createMessageComponentCollector({ ComponentType: ComponentType.Button, filter: (i) => i.customId.split('.')[1] === interaction.id, time: 3600000 });

        let menuOption = 1;
        selectCollector.on('collect', async (collectorInteraction) => {
            if (collectorInteraction.values[0] === "1") {
                menuOption = 1;
                row.components[0].options[0].setDefault(true);
                row.components[0].options[1].setDefault(false);
                await replyMsg.edit({ content: handlePagination1.getPageNumber(), embeds: [handlePagination1.getCurrentEmbed()], components: [row, handlePagination1.getButtons()]}).catch(console.error);
            } else {
                menuOption = 2;
                row.components[0].options[0].setDefault(false);
                row.components[0].options[1].setDefault(true);
                await replyMsg.edit({ content: handlePagination2.getPageNumber(), embeds: [handlePagination2.getCurrentEmbed()], components: [row, handlePagination2.getButtons()]}).catch(console.error);
            }
            collectorInteraction.deferUpdate();
        });

        buttonCollector.on('collect', async (collectorInteraction) => {
            let page;
            if (menuOption === 1) {
                page = handlePagination1.getPageOnButtonId(collectorInteraction.customId);
            } else {
                page = handlePagination2.getPageOnButtonId(collectorInteraction.customId);
            }

            if (!page) {
                selectCollector.stop();
                buttonCollector.stop();

                await replyMsg.delete().catch(console.error);
                return;
            }

            replyMsg.edit({ content: page.pageNumber, embeds: [page.embed], components: [row, page.buttons]});

            collectorInteraction.deferUpdate();
        });

        buttonCollector.on('end', async () => {
            await replyMsg.edit({ components: [] }).catch(console.error);
        });
    }
}