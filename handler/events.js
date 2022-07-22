const fs = require("fs");
module.exports = async (client) => {
    const events = fs.readdirSync("./events").filter(file => file.endsWith(".js"));
    for (const file of events) {
        try {
            const event = require(`../events/${file}`);
            const eventName = file.split(".")[0];
            client.on(eventName, event.bind(null, client));
        } catch (error) {
            console.error(error)
        }
    }
    console.log(`[✅ Handler] Loading the event: ${events.length}`);
}