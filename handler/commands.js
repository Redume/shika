const fs = require("fs");
module.exports = async (client) => {
    const commands = fs.readdirSync("./commands/text/").filter(file => file.endsWith(".js"));
    for (const file of commands) {
        try {
            const TextCommands = require(`../commands/text/${file}`);
            client.commands.set(TextCommands.name, TextCommands);
        } catch (error) {
            console.error(error)
        }
    }
    console.log(`[✅ Handler] Loading the commands: ${commands.length}`);
}