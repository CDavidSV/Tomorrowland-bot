const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const paginationHandler = require("../handlers/pagination-handler.js");
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

        if (!lineups || lineups.length < 1) return await interaction.reply({ content: "There are no current lineups"});

        let lineupsList = [];
        for (const lineup of lineups) {
            lineupsList.push(`**${lineup.artistName}** <t:${lineup.startTimestamp}:R>\n*${lineup.stage}*\n`);
        }

        await paginationHandler(
            interaction, 
            lineupsList, 
            { quantity: 10, title: "Timetable", description: "Current and upcoming sets:", color: config.embeds.colors.main, thumbnail: "https://cdn.discordapp.com/attachments/1107660251286745108/1133268624728146010/one_world_radio_logo.png" });
    }
}