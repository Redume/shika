const Discord = require("discord.js");
const yaml = require("yaml");
const fs = require("fs");
const pool = require("../postgresql")
module.exports = async (client) => {
    client.user.setPresence({activities: [{ name: 's.help', type: 5}],  status: 'idle' })
    client.application.commands.set(client.slashArray)

    console.log(`[Discord API] ${client.user.tag} Online!`)

    await pool.connect(err => {
        if(err) throw err;
        console.log('[✅ DataBase] Connected to PostgresSQL');
    })

    process.on('unhandledRejection', error => {
        const hook = new Discord.WebhookClient({id: '884099794337951784', token: 'ERZdjBT5sj4TprvtGnXKwBpQtE-3oCWRAaW2LeKq214nt5izbBuiJ2DhMHM1itNkBXtf'});
        let embed = new Discord.EmbedBuilder()
        embed.setTitle(`${client.user.username}`)
        embed.setColor("#d7342a")
        embed.addFields([{name: `Название: `, value: `\`${error.name}\``},
                               {name: `Откуда: `, value: `\`${error.path || 'Unknow'}\``},
                               {name: `Описание: `, value: `\`\`\`css\n${error.message.slice(0, 1000)}\`\`\``},
                               {name: `Трейс: `, value: `\`\`\`css\n${error.stack.slice(0, 1000)}\`\`\``}])
        hook.send({embeds: [embed]})
    })


    client.on("error", (error) => console.error(error));
    client.on("warn", (warn) => console.warn(warn));
    client.on("debug", (debug) => console.info(debug));

    client.on('messageUpdate', async (oldMessage, newMessage) => {
        if(newMessage.content === oldMessage.content) return;
        client.emit("messageCreate", newMessage)
    })
}