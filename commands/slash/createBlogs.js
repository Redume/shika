const { ApplicationCommandType, ApplicationCommandOptionType, PermissionsBitField } = require('discord.js');
const pool = require("../../postgresql")
module.exports = {
    name: "create_blog",
    description: "Создание личного блога.",
    type: ApplicationCommandType.String,
    options: [{
        name: "name",
        description: "Указать название блога.",
        type: ApplicationCommandOptionType.String,
        required: true,
    }, {
        name: "description",
        description: "Указать описание блога.",
        type: ApplicationCommandOptionType.String,

    }],
    run: Run,
}

async function Run(client, interaction) {
    const user = await interaction.member.getData(interaction.member.id, interaction.guild.id);
    const guild = await interaction.guild.getData(interaction.guild.id);

    if(user.blog) return interaction.reply({content: ":x: У вас уже есть блог.", ephemeral: true});

    if(!interaction.guild.members.cache.get(
            client.user.id
        ).permissions.has(
            PermissionsBitField.Flags.ManageChannels
        )
        ) return interaction.reply(
            {
                content: ":x: У бота нет прав создать вам блог.",
                ephemeral: true
            }
            );

    if(guild.max_blogs === guild.blogs_count) return interaction.reply(
        {
        content: ":x: Вы не можете создать блог, так как уже максимальное кол-во блогов.",
        ephemeral: true
    });

    if(interaction.options.getString("name").length > 70) return interaction.reply(
        {
        content: ":x: Название блога не должно превышать 70 символов.",
        ephemeral: true
        }
    );

    if(interaction.options.getString("description") !== null) {
        if(interaction.options.getString("description").length > 1024) return interaction.reply(
            {
                content: ":x: Описание блога не должно превышать 1024 символов.",
                ephemeral: true
            }
        );
    }
    const channel = await interaction.guild.channels.create({
        name: interaction.options.getString("name"),
        permissionOverwrites: [{
            id: interaction.guild.id,
            deny: PermissionsBitField.Flags.SendMessages
        }, {
            id: interaction.user.id,
            allow: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageMessages]
        }]
    });

    if(guild.blog_parent !== "None") channel.setParent(guild.blog_parent);
    if(interaction.options.getString("description") !== null) channel.setTopic(
        interaction.options.getString('description')
    );

    await pool.query(
        "UPDATE person SET channel_id = $1, blog = true WHERE user_id = $2 AND guild_id = $3",
        [
            channel.id,
            interaction.user.id,
            interaction.guildId
        ]
    );

    await pool.query("UPDATE guild SET blogs_count = blogs_count + 1 WHERE guild_id = $1", [interaction.guildId]);

    interaction.reply({content: `Ваш личный блог успешно создан!
                                     <#${channel.id}>`, ephemeral: true});
}