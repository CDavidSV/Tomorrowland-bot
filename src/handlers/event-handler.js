const getFiles = require("../util/get-files.js");

// Get all Events and listen.
const setupEvents = (client) => {
    getFiles('./src/events', '.js', 'EVENTS').forEach((eventFile) => {
        const event = require(`${eventFile}`);

        if (!event) throw new Error('event file not found'.red);

        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    });
}

module.exports = setupEvents;