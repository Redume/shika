const { ApplicationCommandType, ApplicationCommandOptionType, PermissionsBitField } = require('discord.js');
module.exports = {
    name: "edit",
    description: "Изменение блога.",
    type: ApplicationCommandType.Subcommand,
    options: [
        {
            name: "name",
            description: "Измененние название блога.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "target",
                    description: "Указать название блога.",
                    type: ApplicationCommandOptionType.String,
                },
            ],
        }, {
            name: "description",
            description: "Изменение описание блога.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "target",
                    description: "Указать описание блога.",
                    type: ApplicationCommandOptionType.String,
                },
            ],
        },
        ],
    run: Run,
};
async function Run(client, interaction) {
    if(interaction.options.getString("target") === null) return interaction.reply(
        {
            content: ":x: Вы не указали аргумент.",
            ephemeral: true
        }
    )

    const user = await interaction.member.getData(interaction.member.id, interaction.guild.id);

    if(!user.blog) return interaction.reply({content: ":x: У вас нет блога.", ephemeral: true});

    if(!interaction.guild.members.cache.get(
        client.user.id
    ).permissions.has(
        PermissionsBitField.Flags.ManageChannels
    )
    ) return interaction.reply(
        {
            content: ":x: У бота нет прав изменять ваш блог.",
            ephemeral: true
        }
    );

    const channel = interaction.guild.channels.cache.get(user.channel_id);

    if(interaction.options.getSubcommand() === "name") {
        if(channel.name === interaction.options.getString("target")) {
            channel.setName(interaction.user.username.slice(0, 70));
            return interaction.reply(
                {
                    content: "Название блога было сброшено." +
                    "\nПричина — Одинаковое название" +
                     `\n\nНовое название — ${channel.name.slice(0, 70)}`,
                    ephemeral: true
                }
                );
        }

        if(interaction.options.getString("target").length > 70) return interaction.reply(
            {
                content: ":x: Название блога не должно быть больше 70 символов.",
                ephemeral: true
            }
        )

        channel.setName(interaction.options.getString("target"));

        interaction.reply({content: `Ваш блог переименован в ${interaction.options.getString("target")}`, ephemeral: true});

    } else if(interaction.options.getSubcommand() === "description") {
        if(channel.description === interaction.options.getString("target")) {
            channel.setTopic(null);
            return interaction.reply(
                {
                    content: "Название описания было сброшено." +
                        "\nПричина — Одинаковое название" +
                        `\n\nНовое название — ${channel.name.slice(0, 70)}`,
                    ephemeral: true
                }
            );
        }

        if(interaction.options.getString("target").length > 1000) return interaction.reply(
            {
                content: ":x: Описание блога не должно быть больше 1000 символов.",
                ephemeral: true
            }
        )

        channel.setTopic(interaction.options.getString("target"));
        interaction.reply(
            {
            content: `Описание блога переименовано в ${interaction.options.getString("target")}.`,
                ephemeral: true
            }
            );

    }
}