const yaml = require("yaml");
const fs = require("fs");
const pool = require("../postgresql");
const config = yaml.parse(fs.readFileSync('./config.yaml', 'utf8'));
module.exports = async (client, message) => {
    if(!message.guild) return message.channel.messages.cache.delete(message.id);
    if(message.author.bot && message.author.id !== client.user.id) return message.channel.messages.cache.delete(message.id);
    else if (message.author.bot) return;

    const user = await message.member.getData(message.author.id, message.guild.id);

    if(user.channel_id !== "None") {
        if (message.channel.id === user.channel_id) await pool.query(
            "UPDATE person SET messages = messages + 1 WHERE user_id = $1 AND guild_id = $2",
            [
                message.author.id,
                message.guildId
            ]
        );
    }

    if (!message.content.startsWith("s.") || message.cleanContent === "s.") return;

    let args = message.content.slice("s.".length).trim().split(/ +/g);
    let cmd = args.shift().toLowerCase();
    let command = client.commands.get(cmd) || client.commands.find(x => x.aliases && x.aliases.includes(cmd));

    if (!command) return;
    if (command.category === 'dev' && !config['developers'].includes(message.author.id)) return message.react('❌').catch(() => true);

    try {
        command.run(client, message, args);
    } catch (err) {
        console.error(err)
    }
}