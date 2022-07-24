const { ApplicationCommandType, EmbedBuilder } = require('discord.js');
const pool = require("../../postgresql");
const declOfNum = require("../../function/declOfNum");
module.exports = {
    name: "top",
    description: "Топ пользователей по кол-во сообщений.",
    type: ApplicationCommandType.String,
    run: Run,
}
async function Run(client, interaction) {
    const embed = new EmbedBuilder();
    const top = await pool.query(
        "SELECT * FROM person WHERE guild_id = $1 ORDER BY messages DESC LIMIT 10",
        [
            interaction.guildId
        ]
    );

    const guild = await pool.query(
        "SELECT * FROM guild WHERE guild_id = $1",
        [
            interaction.guildId
        ]
    );

    let desc = ``;
    if(guild.rows[0].blog_count === 0) return interaction.reply({
        content: ":x: Нет блогов в этой гильдии.",
        ephemeral: true
    });

    for(let i = 0; i < top.rows.length;) {
        if(top.rows[i].blog) {
            desc += `${i+1}. <@!${top.rows[i].user_id}> | <#${top.rows[i].channel_id}> — **${top.rows[i].messages}** ${declOfNum(top.rows[i].messages, 
                ["сообщение", "сообщения", "сообщений"])}\n`;
            i++;
        }
    }
    embed.setDescription(desc)
    interaction.reply({embeds: [embed], ephemeral: true});
}