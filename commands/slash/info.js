const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const pool = require("../../postgresql")
module.exports = {
    name: "info",
    description: "Информация о блогах.",
    type: ApplicationCommandType.String,
    options: [{
        name: "target",
        description: "Укажите пользователя чью информацию хотите посмотреть.",
        type: ApplicationCommandOptionType.User,
    }],
    run: Run,
}
async function Run(client, interaction) {
    const user = await pool.query(
        "SELECT * FROM person WHERE user_id = $1 AND guild_id = $2",
        [interaction.options.getMember("target")?.user?.id  || interaction.user.id, interaction.guildId]
    );

    const guild = await pool.query("SELECT * FROM guild WHERE guild_id = $1", [interaction.guildId]);
    const embed = new EmbedBuilder();

    if(interaction.options.getMember("target") !== null) {
        if(interaction.options.getMember("target").user.bot) return interaction.reply(
            {
                content: ":x: У бота не может быть блога \n" +
                    "Интересно что-бы они писали бы своих блогах... :thinking:",
                ephemeral: true
            });
        if(!user.rows[0]?.blog ? !user.rows[0]?.blog : false) return interaction.reply(
            {
                content: ":x: У этого пользователя нет блога.",
                ephemeral: true
            });
        embed.setAuthor(
            {
                iconURL: interaction.options.getMember("target").user.displayAvatarURL({dynamic: true}),
                name: `Информация о блоге ${interaction.options.getMember("target").user.username}`
            });
    } else {
        if(!user.rows[0]?.blog ? !user.rows[0]?.blog : false) return interaction.reply(
            {
                content: ":x: У вас нет блога", ephemeral: true
            });
        embed.setAuthor(
            {
                iconURL: interaction.user.displayAvatarURL({dynamic: true}),
                name: `Информация о вашем блоге`
            });
    }
    const channel_created = Math.round(
        new Date(
            client.guilds
                .cache.get(interaction.guildId)
                .channels.cache.get(user?.rows[0]?.channel_id)
                ?.createdAt
        )?.getTime() / 1000
    );

    embed.addFields(
        [
            {
                name: "Блог",
                value: `<#${user.rows[0].channel_id}>`
            },
            {
                name: "Всего сообщенеий",
                value: `${user.rows[0].messages}`
            },
            {
                name: "Блог создан",
                value: `<t:${channel_created}:d> <t:${channel_created}:t> | <t:${channel_created}:R>`
            },
        ]
    );

    embed.setFooter({text: `Всего блогов: ${guild.rows[0].blog_count}`});
    interaction.reply({embeds: [embed], ephemeral: true});

}