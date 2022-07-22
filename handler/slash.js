const fs = require("fs");
module.exports = async (client) => {
    const slash = fs.readdirSync("./commands/slash").filter(file => file.endsWith(".js"));
    for (const file of slash) {
        try {
            const slashCommands = require(`../commands/slash/${file}`);
            client.slash.set(slashCommands.name, slashCommands);
            if(["MESSAGE", "USER"].includes(slashCommands.type)) delete slashCommands.description
            client.slashArray.push(slashCommands)
        } catch (error) {
            console.error(error)
        }
    }
    console.log(`[✔ Handler] Loading slash commands: ${slash.length}`);
}
