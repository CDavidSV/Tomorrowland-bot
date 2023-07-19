const { ColorResolvable, EmbedBuilder, Events } = require("discord.js");
const config = require("../../config.json");

/**
 * 
 * @param options 
 * @param commandName 
 * @param client 
 * @returns subCommand file object
 */
const fetchSubCommandFile = (options, commandName, client) => {
    const subCommand = options.getSubcommand(false);
    const subCommandGroup = options.getSubcommandGroup();
    const subCommandName = subCommandGroup ? `${subCommandGroup}.${subCommand}` : subCommand;
    const subCommandFile = client.subCommands.get(`${commandName}.${subCommandName}`);

    return subCommandFile;
}

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            const { commandName, client, options } = interaction;
            const command = client.slashCommands.get(commandName);
            
            // Check if the bot has sufficient permissions to perform the command.
            if (command.botPerms && interaction.guild && !interaction.guild.members.me.permissions.has(command.botPerms)) {
                const noPermissions = new EmbedBuilder()
                .setColor(config.embeds.colors.error)
                .setAuthor({ name: "I don't have enough permissions to perform this action.", iconURL: config.embeds.images.errorImg })
                interaction.reply({ embeds: [noPermissions], ephemeral: true });
                return;
            }

            const subCommandFile = fetchSubCommandFile(options, commandName, client);

            if (!subCommandFile && !command.callback) {
                await interaction.reply({
                    content: "This command is outdated.",
                    ephemeral: true
                });
                return;
            }
            
            try {
                await (subCommandFile?.callback ?? command.callback)(interaction);
            } catch (err) {
                console.error(err);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true }).catch((err) => console.error(err));
                } else {
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true }).catch((err) => console.error(err));
                }
            }
        } else if (interaction.isAutocomplete()) {
            const { commandName, client, options } = interaction;
            const command = client.slashCommands.get(commandName);

            const subCommandFile = fetchSubCommandFile(options, commandName, client);

            try {
                await (subCommandFile?.autoComplete ?? command.autoComplete)(interaction);
            } catch (err) {
                console.error('Unhandled Error: ', err);
            }
        }
    }
};