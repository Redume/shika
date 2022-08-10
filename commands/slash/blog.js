const {
    ApplicationCommandType,
    ApplicationCommandOptionType,
    PermissionsBitField,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const pool = require("../../postgresql")
module.exports = {
    name: "blog",
    description: "Управление блогом.",
    type: ApplicationCommandType.Subcommand,
    options: [
        {
            name: "create",
            description: "Создание блога.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "name",
                    description: "Название блога.",
                    type: ApplicationCommandOptionType.String,
                }, {
                    name: "description",
                    description: "Описание блога.",
                    type: ApplicationCommandOptionType.String,
                },
            ],
        }, {
            name: "delete",
            description: "Удаление блога.",
            type: ApplicationCommandOptionType.Subcommand,
        }, {
            name: "edit",
            description: "Изменение блога.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "name",
                    description: "Измененние название блога.",
                    type: ApplicationCommandOptionType.String,
                }, {
                    name: "description",
                    description: "Изменение описание блога.",
                    type: ApplicationCommandOptionType.String,
                }, {
                    name: "member",
                    description: "Добавление / Удаление соавтора блога.",
                    type: ApplicationCommandOptionType.User,
                },
            ],
        },
    ],
    run: Run,
}

async function Run(client, interaction) {
    if(interaction.options.getString("name") === null &&
        interaction.options.getString("description") === null &&
        interaction.options.getMember("member") === null &&
        interaction.options.getSubcommand() !== "delete") return interaction.reply(
            {
                content: ":x: Вы не указали аргумент.",
                ephemeral: true
            }
        );

    const user = await interaction.member.getData(interaction.member.id, interaction.guild.id);
    const guild = await interaction.guild.getData(interaction.guild.id);

    if(interaction.options.getSubcommand() === "create") {
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

        if(guild.blogs_count === guild.max_blog) return interaction.reply(
            {
                content: ":x: В гильдии уже максимальное количество блогов.",
                ephemeral: true
            }
        );


        if (interaction.options.getString("name") === null &&
            interaction.options.getString("name").length > 70) return interaction.reply(
            {
                content: ":x: Название блога не должно превышать 70 символов.",
                ephemeral: true
            }
        );


        if(interaction.options.getString("description") !== null &&
            interaction.options.getString("description").length > 1024) return interaction.reply(
            {
                content: ":x: Описание блога не должно превышать 1024 символов.",
                ephemeral: true
            }
        );

        const channel = await interaction.guild.channels.create({
            name: interaction.options.getString("name"),
            topic: interaction.options.getString("description"),
            parent: guild.parent_id,
            permissionOverwrites: [{
                id: interaction.guild.id,
                deny: PermissionsBitField.Flags.SendMessages
            }, {
                id: interaction.user.id,
                allow: [
                    PermissionsBitField.Flags.SendMessages,
                    PermissionsBitField.Flags.ManageMessages,
                    PermissionsBitField.Flags.MentionEveryone,
                    PermissionsBitField.Flags.SendTTSMessages
                ]
            }]
        });

        await pool.query(
            "UPDATE person SET channel_id = $1, blog = true WHERE user_id = $2 AND guild_id = $3",
            [
                channel.id,
                interaction.member.id,
                interaction.guild.id
            ]
        );

        await pool.query("UPDATE guild SET blogs_count = blogs_count + 1 WHERE guild_id = $1", [interaction.guild.id]);

        interaction.reply(
            {
                content: "Ваш личный блог был успешно создан!" +
                        `\n<#${channel.id}>`,
                ephemeral: true
            }
         );
    } else if(interaction.options.getSubcommand() === "delete") {
        if(!user.blog) return interaction.reply({content: ":x: У вас нет блога.", ephemeral: true});

        if(!interaction.guild.members.cache.get(
            client.user.id
        ).permissions.has(
            PermissionsBitField.Flags.ManageChannels
        )
        ) return interaction.reply(
            {
                content: ":x: У бота нет прав удалить ваш блог.",
                ephemeral: true
            }
        );

        const button = new ActionRowBuilder()
        button.addComponents(
            new ButtonBuilder()
                .setCustomId("delete")
                .setLabel("Да")
                .setStyle(ButtonStyle.Danger)
        );

        button.addComponents(
            new ButtonBuilder()
                .setCustomId("cancel")
                .setLabel("Нет")
                .setStyle(ButtonStyle.Primary)
        );

        interaction.reply(
            {
                content: "Вы уверены, что хотите удалить свой блог?",
                ephemeral: true,
                components: [button]
            }
        )

        const filter = (btn) => {
            if(interaction.user.id === btn.user.id) return true;
            return interaction.reply({content: "Вы не можете использовать эту кнопку.", ephemeral: true});
        }

        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            max: 1,
            time: 60000
        });

        collector.on("collect", async (ButtonInteraction) => {
            await ButtonInteraction.deferUpdate();
            const id = ButtonInteraction.customId;

            if(id === "delete") {
                const channel = interaction.guild.channels.cache.get(user.channel_id)
                channel.delete();
                await pool.query(
                    "UPDATE person SET channel_id = null, blog = false, messages = 0 WHERE user_id = $1 AND guild_id = $2",
                    [
                        interaction.user.id,
                        interaction.guildId
                    ]
                );

                await pool.query(
                    "UPDATE guild SET blogs_count = blogs_count - 1 WHERE guild_id = $1",
                    [
                        interaction.guildId
                    ]
                );

                return ButtonInteraction.followUp({content: "Ваш блог успешно был удален!", ephemeral: true});
            }
            if (id === "cancel") return ButtonInteraction.followUp(
                {
                    content: "Отменено удаление блога",
                    ephemeral: true
                }
                );
        });
    } else if(interaction.options.getSubcommand() === "edit") {
        if(!user.blog) return interaction.reply({content: ":x: У вас нет блога.", ephemeral: true});

        if(interaction.options.getMember("member") !== null) {
            if (interaction.user.id === interaction.options.getMember("member").user.id) return interaction.reply({
                    content: ":x: Зачем добавлять самого себя в свой же блог?",
                    ephemeral: true
                }
            )
        }

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

        const channel = await interaction.guild.channels.cache.get(user.channel_id);

        if(interaction.options.getString("name") !== null) {
            if(interaction.options.getString("name") === channel.name) return interaction.reply(
                {
                    content: ":x: Такое названия блог уже используется.",
                    ephemeral: true
                }
            );

            if(interaction.options.getString("name").length > 50) return interaction.reply(
                {
                    content: ":x: Новое название блога не должно превышать 50 символов.",
                    ephemeral: true
                }
            );
        } else if(interaction.options.getString("description") !== null) {
            if(interaction.options.getString("description") === channel.topic) return interaction.reply(
                {
                    content: ":x: Такое описание уже используется.",
                    ephemeral: true
                }
            );

            if(interaction.options.getString("description").length > 1024) return interaction.reply(
                    {
                        content: ":x: Новое описание блога не должно превышать 1024 символов.",
                        ephemeral: true
                    }
                );
        }

        if(interaction.options.getString("description") !== null) channel.setTopic(
            interaction.options.getString("description")
        );

        if(interaction.options.getString("name") !== null) channel.setName(
            interaction.options.getString("name")
        );

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
                        MentionEveryone: false,
                        SendTTSMessages: false
                    }
                )
            } else {
                channel.permissionOverwrites.delete(interaction.options.getMember("member").user.id)
            }
        }

        interaction.reply(
            {
                content: "Ваш блог был успешно отредактирован!",
                ephemeral: true
            }
        );
    }
}