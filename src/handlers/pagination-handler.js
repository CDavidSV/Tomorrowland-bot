const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = class PaginationHandler {
    constructor(interactionId, embeds, page = 1) { 
        this.embeds = embeds;
        this.pages = embeds.length;
        this.id = interactionId;

        if (page > this.pages) {
            this.currentPage = this.pages - 1;
        }
        this.currentPage = page - 1;
        
        // Build Buttons.
        this.paginationButtons = new ActionRowBuilder()
        .addComponents([
            new ButtonBuilder().setCustomId(`previous.${this.id}`).setEmoji('1133857717027614811').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`stop.${this.id}`).setEmoji('1133857126478008430').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId(`next.${this.id}`).setEmoji('1133857705241620530').setStyle(ButtonStyle.Primary)
        ]);

        this.updateButtonState();
    }

    getId() {
        return this.id;
    }

    getPageNumber() {
        return `Page **${this.currentPage + 1}** of **${this.pages}**`;
    }

    updateButtonState() {
        // Check the current page and update the enabled and dissable buttons.
        if (this.pages === 1) {
            this.paginationButtons.components[0].setDisabled(true);
            this.paginationButtons.components[2].setDisabled(true);
        } else if (this.currentPage === 0) {
            this.paginationButtons.components[0].setDisabled(true);
            this.paginationButtons.components[2].setDisabled(false);
        } else if (this.currentPage >= this.pages - 1) {
            this.paginationButtons.components[0].setDisabled(false);
            this.paginationButtons.components[2].setDisabled(true);
        } else {
            this.paginationButtons.components[0].setDisabled(false);
            this.paginationButtons.components[2].setDisabled(false);
        }
    }

    updateEmbeds(newEmbedsList) {
        this.embeds = newEmbedsList;
        this.pages = this.embeds.length;

        if (this.currentPage >= this.pages -1) {
            this.currentPage = this.pages - 1;
        }

        this.updateButtonState();
    }

    getCurrentEmbed() {
        return this.embeds[this.currentPage];
    }

    getButtons() {
        return this.paginationButtons;
    }

    nextPage() {
        if (this.currentPage >= this.pages - 1) {
            return { pageNumber: `Page **${this.currentPage + 1}** of **${this.pages}**`, embed: this.embeds[-1], buttons: this.paginationButtons };
        }

        this.currentPage++;
        this.updateButtonState();
        return { pageNumber: `Page **${this.currentPage + 1}** of **${this.pages}**`, embed: this.embeds[this.currentPage], buttons: this.paginationButtons };
    }

    previousPage() {
        if (this.currentPage === 0) {
            return { pageNumber: `Page **${this.currentPage + 1}** of **${this.pages}**`, embed: this.embeds[this.currentPage], buttons: this.paginationButtons };
        }

        this.currentPage--;
        this.updateButtonState();
        return { pageNumber: `Page **${this.currentPage + 1}** of **${this.pages}**`, embed: this.embeds[this.currentPage], buttons: this.paginationButtons };
    }

    getPage(page) {
        // Cases where the page is out of bounds.
        if (page >= this.pages) {
            this.paginationButtons.components[0].setDisabled(false);
            this.paginationButtons.components[2].setDisabled(true);

            this.currentPage = this.pages - 1;
            return { pageNumber: `Page **${this.currentPage + 1}** of **${this.pages}**`, embed: this.embeds[-1], buttons: this.paginationButtons };
        }
        if (page <= 1) {
            this.paginationButtons.components[0].setDisabled(true);
            this.paginationButtons.components[2].setDisabled(false);

            this.currentPage = 0;
            return { pageNumber: `Page **${this.currentPage + 1}** of **${this.pages}**`, embed: this.embeds[0], buttons: this.paginationButtons };
        }

        this.updateButtonState();
        return { pageNumber: `Page **${this.currentPage + 1}** of **${this.pages}**`, embed: this.embeds[page - 1], buttons: this.paginationButtons };
    }

    getPageOnButtonId(buttonId) {
        switch (buttonId) {
            case `next.${this.id}`:
                return this.nextPage();
            case `previous.${this.id}`:
                return this.previousPage();
            case `stop.${this.id}`:
                return null;
            default:
                throw new Error('Invalid button id');
        }
    }
}