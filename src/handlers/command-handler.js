const { REST, Routes } = require("discord.js");
const getFiles = require("../util/get-files.js");
const config = require("../../config.json");

const setupCommands = (token, client) => {
    // Client id 
    const clientId = config.clientId;
    // const clientId = config.testClientId; // For testing only.

    // Get all Commands and determine the type.
    getFiles('./src/commands', '.js', 'SLASH COMMANDS').forEach((commandFile) => {
        const command = require(`${commandFile}`);
        if (!command || !command.data) return;

        if (command.subCommand) {
            return client.subCommands.set(command.subCommand, command);
        }

        client.slashCommands.set(command.data.name, command);
    });

    const rest = new REST().setToken(token);
    (async () => {
        await rest.put(
            // Routes.applicationGuildCommands(clientId, config.testGuildId),
            // { body: Array.from(client.slashCommands.values()).map((command) => {
            //     return command.data.toJSON();
            // })} // Convert slash command data into json.

            Routes.applicationCommands(clientId),
            { body: Array.from(client.slashCommands.values()).map((command) => {
                return command.data.toJSON();
            })}
        )
        .then(() => console.log(`Successfully reloaded application (/) commands.`.green))
        .catch((e => console.error(e)));
    })();
}

module.exports = setupCommands;