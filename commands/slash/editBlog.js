const { ApplicationCommandType, ApplicationCommandOptionType, PermissionsBitField } = require('discord.js');
const pool = require("../../postgresql")
module.exports = {
    name: "edit_blog",
    description: "Изменение блога.",
    type: ApplicationCommandType.Mentionable,
    options: [{
        name: "member",
        description: "Добавить или удалить участника в блог.",
        type: ApplicationCommandOptionType.User,
    }, {
        name: "name",
        description: "Изменить название блога.",
        type: ApplicationCommandOptionType.String,
    }, {
        name: "description",
        description: "Изменить описание блога.",
        type: ApplicationCommandOptionType.String
    }],
    run: Run,
};
async function Run(client, interaction) {
    if(interaction.options.getString("name") === null &&
        interaction.options.getString("description") === null &&
        interaction.options.getUser("member") === null
    ) return interaction.reply(
            {
                content: ":x: Нет опций для изменения блога.",
                ephemeral: true
            });
    const user = await pool.query(
        "SELECT * FROM person WHERE user_id = $1 AND guild_id = $2",
        [
            interaction.user.id,
            interaction.guildId
        ]
    );

    if(!user.rows[0]?.blog ? !user.rows[0]?.blog : false) return interaction.reply(
        {
            content: ":x: У вас нет блога",
            ephemeral: true
        }
        );

    const channel = await interaction.guild.channels.cache.get(user.rows[0].channel_id);
    let desc = ``;
    if(interaction.options.getString("name") !== null) {
        if(interaction.options.getString("name").length > 70) return interaction.reply(
            {
                content: ":x: Название блога не должно превышать 70 символов.",
                ephemeral: true
            }
        );

        if(interaction.options.getString("name") === channel.name) return interaction.reply(
            {
                content: ":x: Такое название блога уже используется.",
                ephemeral: true

            }
        );
        desc += `Название вашего блога изменено на ${interaction.options.getString("name")}.\n`;
    }

    if(interaction.options.getString("description") !== null) {
        if(interaction.options.getString("description").length > 1024) return interaction.reply(
            {
                content: ":x: Описание блога не должно превышать 1024 символов.",
                ephemeral: true
            }
        );
        if(channel.topic !== null) {
            if (interaction.options.getString("description") === channel.topic) return interaction.reply(
                {
                    content: ":x: Такое описание блога уже используется .",
                    ephemeral: true
                }
            );
        }

        desc += `Описание блога изменено на ${interaction.options.getString("description")}.\n`;
    }

    if(interaction.options.getMember("member") !== null) {
        if(interaction.options.getMember("member").user.id === interaction.user.id) return interaction.reply(
            {
                content: ":x: Вы не можете добавить себя в блог.",
                ephemeral: true
            }
        );

        if(interaction.options.getMember("member").user.id === channel.guild.ownerID) return interaction.reply(
            {
                content: ":x: Вы не можете добавить владельца блога в блог.",
                ephemeral: true
            }
        );

        if(interaction.options.getMember("member").permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply(
                {
                    content: `:x: Пользователь ${interaction.options.getMember("member").user.username} и так может писать здесь.`,
                    ephemeral: true
                }
            );
        }
    }

    if(interaction.options.getString("name") !== null) channel.setName(interaction.options.getString("name"));
    if(interaction.options.getString("description") !== null) channel.setTopic(interaction.options.getString("description"));
    if(interaction.options.getUser("member") !== null) {
        if (channel.permissionOverwrites.cache.get(
            interaction.options.getMember("member").user.id
        )?.allow?.has(
            [
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ManageMessages
            ]) === undefined) {
            channel.permissionOverwrites.edit(interaction.options.getMember("member").user.id,
                {
                    SendMessages: true,
                    ManageMessages: true,
                }
            )
            desc += `Участник **${interaction.options.getMember("member").user.username}** добавлен в блог.\n`;
        } else {
            channel.permissionOverwrites.delete(interaction.options.getMember("member").user.id)
            desc += `Участник **${interaction.options.getMember("member").user.username}** удален из вашего блога.\n`;
        }
    }

    desc += `\n Ваш блог: [ <#${user.rows[0].channel_id}> ]`;
    interaction.reply({content: desc, ephemeral: true});

}