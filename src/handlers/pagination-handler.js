const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const paginationHandler = async (interaction, itemsList, options = { quantity: 10 }) => {
    if (itemsList.length === 0) throw new Error('No items');
    
    let embeds = [];
    const embedQuantity = Math.ceil(itemsList.length / options.quantity);

    const pages = [];

    for (let i = 0; i < itemsList.length; i += options.quantity) {
        pages.push(itemsList.slice(i, i + options.quantity));
    }

    let count = 1;
    for (let i = 0; i < embedQuantity; i++) {
        let items = options.description && options.description.length !== 0 ? `${options.description}\n\n` : '';
        const embed = new EmbedBuilder()
            .setTitle(options.title || null)
            .addFields(options.fields || [])
            .setColor(options.color || null)
            .setThumbnail(options.thumbnail || null)
        
        if (embedQuantity > 1) embed.setFooter({ text: `Page ${i + 1} of ${embedQuantity}` });

        for (let [index, item] of pages[i].entries()) {
            items += `\`${count}\` ${item}\n`;
            count++;
        }
        embed.setDescription(items);

        embeds.push(embed);
    }

    // Buttons.
    const paginationButtons = new ActionRowBuilder()
    .addComponents([
        new ButtonBuilder().setCustomId('previous').setLabel('<').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('next').setLabel('>').setStyle(ButtonStyle.Primary)
    ]);

    // Pagination button colletor.
    const collector = interaction.channel.createMessageComponentCollector({
        filter: (buttonInteraction) => buttonInteraction.customId === 'next' || buttonInteraction.customId === 'previous',
        time: 900_000
    });

    // Disable buttons if there's only one embed.
    if (embedQuantity === 1) {
        paginationButtons.components[0].setDisabled(true); 
        paginationButtons.components[1].setDisabled(true);
    } else {
        paginationButtons.components[0].setDisabled(true);
    }
    const replyMsg = await interaction.reply({ embeds: [embeds[0]], components: [paginationButtons],  fetchReply: true });
    
    setTimeout(async () => {
        paginationButtons.components[0].setDisabled(true); 
        paginationButtons.components[1].setDisabled(true);

        await replyMsg.edit({ components: [paginationButtons] }.catch(console.error));
    }, 900_000);

    // Current index for the embeds array.
    let currentIndex = 0;

    collector.on('collect', async (buttonInteraction) => {
        switch (buttonInteraction.customId) {
            case 'next':
                paginationButtons.components[0].setDisabled(false); 
                if (currentIndex + 1 >= embeds.length - 1) {
                    paginationButtons.components[1].setDisabled(true);
                }

                currentIndex++;
                await replyMsg.edit({ embeds: [embeds[currentIndex]], components: [paginationButtons] });
                break;
            case 'previous':
                paginationButtons.components[1].setDisabled(false);
                if (currentIndex - 1 <= 0) {
                    paginationButtons.components[0].setDisabled(true);
                }

                currentIndex--;
                await replyMsg.edit({ embeds: [embeds[currentIndex]], components: [paginationButtons] });
                break;
        }
        await buttonInteraction.deferUpdate().catch(console.error);
    });

    return replyMsg;
}

module.exports = paginationHandler;