const { ApplicationCommandType, EmbedBuilder } = require('discord.js');
const pool = require("../../postgresql");
const declOfNum = require("../../utils/declOfNum");
module.exports = {
    name: "top",
    description: "Топ пользователей по кол-во сообщений.",
    type: ApplicationCommandType.String,
    run: Run,
};
async function Run(client, interaction) {
    const embed = new EmbedBuilder();
    const guild = await interaction.guild.getData(interaction.guild.id);

    let desc = ``;
    if(guild.blogs_count === 0) return interaction.reply({content: ":x: Нет блогов в этой гильдии.", ephemeral: true});

    const top = await pool.query(
        "SELECT * FROM person WHERE guild_id = $1 ORDER BY messages DESC LIMIT 10",
        [
            interaction.guildId
        ]
    );

    const top_users = [
        ":first_place:",
        ":second_place:",
        ":third_place:",
        ":four:",
        ":five:",
        ":six:",
        ":seven:",
        ":eight:",
        ":nine:",
        ":keycap_ten:",
    ];

    for(let i = 0; i < top.rows.length; i++) {
        if(top.rows[i].blog) {
            desc += `${top_users[i]} <@!${top.rows[i].user_id}> |` +
            `<#${top.rows[i].channel_id}> — **${top.rows[i].messages}** `+
                `${declOfNum(top.rows[i].messages, ["сообщение", "сообщения", "сообщений"])}\n`;
        }
    }

    embed.setDescription(desc);
    interaction.reply({embeds: [embed], ephemeral: true});
}