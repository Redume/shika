const yaml = require("yaml");
const fs = require("fs");
const pool = require("../postgresql");
const config = yaml.parse(fs.readFileSync('./config.yaml', 'utf8'));
module.exports = async (client, message) => {
    if(!message.guild) return message.channel.messages.cache.delete(message.id);
    if(message.author.bot && message.author.id !== client.user.id) return message.channel.messages.cache.delete(message.id);
    else if (message.author.bot) return;

    await pool.query(`SELECT * FROM person WHERE user_id = $1 AND guild_id = $2`, [message.author.id, message.guildId], async (err, result) => {
        if (message.author.id.includes(result.rows)) await pool.query("INSERT INTO person (user_id, guild_id) VALUES ($1, $2) RETURNING *", [message.author.id, message.guildId]);
    })

    await pool.query(`SELECT * FROM guild WHERE guild_id = $1`, [message.guildId], async (err, result) => {
        if (message.guildId.includes(result.rows)) await pool.query("INSERT INTO guild (guild_id) VALUES ($1) RETURNING *", [message.guildId]);
    });

    const user = await pool.query(`SELECT * FROM person WHERE user_id = $1 AND guild_id = $2`, [message.author.id, message.guildId]);
    if(user.rows[0]?.channel_id ? user.rows[0]?.channel_id : "None" !== "None") {
        if (message.channel.id === user.rows[0]?.channel_id) await pool.query("UPDATE person SET messages = messages + 1 WHERE guild_id = $1", [message.guildId]);
    }


    const prefix = await pool.query("SELECT * FROM guild WHERE guild_id = $1", [message.guildId]).then((x) => x.rows[0].prefix);
    if (!message.content.startsWith(prefix) || message.cleanContent === prefix) return;

    let args = message.content.slice(prefix.length).trim().split(/ +/g);
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