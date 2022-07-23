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
    const user = await pool.query("SELECT * FROM person WHERE user_id = $1 AND guild_id = $2", [interaction.options.getUser("target").id || interaction.user.id, interaction.guildId]);
    const guild = await pool.query("SELECT * FROM guild WHERE guild_id = $1", [interaction.guildId]);
    const channel_timestamps = Math.round(new Date(client.guilds.cache.get(interaction.guild.id).channels.cache.get(user.rows[0].channel_id).createdAt).getTime() / 1000);
    const embed = new EmbedBuilder();

    embed.addFields([{name: "Блог", value: `<#${user.rows[0].channel_id}>`},
        {name: "Всего сообщенеий", value: `${user.rows[0].messages}`},
        {name: "Блог создан", value: `<t:${channel_timestamps}:d> <t:${channel_timestamps}:t> | <t:${channel_timestamps}:R>`}]);

    embed.setFooter({text: `Всего блогов: ${guild.rows[0].blog_count}`});

    if(interaction.options.getMember("target") === null) {
        if(!user.rows[0]?.blog ? !user.rows[0]?.blog : false) return interaction.reply({content: ":x: У вас нет блога", ephemeral: true});

        embed.setAuthor({iconURL: interaction.user.displayAvatarURL({dynamic: true}), name: `Информация о вашем блоге`});
    } else {
        if(interaction.options.getMember("target").user.bot) return interaction.reply({content: ":x: У бота нет блога \nИнтересно что-бы они писали бы своих блога... :thinking:", ephemeral: true});
        if(!client.guilds.cache.get(interaction.options.getMember("target").guild.id).members.cache.get(interaction.options.getMember("target").user.id)) return interaction.reply({content: ":x: Не нашлось такого пользователя в этой гильдии", ephemeral: true});
        if(!user.rows[0]?.blog ? !user.rows[0]?.blog : false) return interaction.reply({content: ":x: У пользователя нет блога", ephemeral: true});

        embed.setAuthor({iconURL: interaction.options.getMember("target").user.displayAvatarURL({dynamic: true}), name: `Информация о блоге ${interaction.options.getMember("target").user.username}`});
    }
    interaction.reply({embeds: [embed], ephemeral: true});

}