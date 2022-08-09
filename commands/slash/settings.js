const { ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const pool = require("../../postgresql")
module.exports = {
    name: "settings",
    description: "Изменение настроек бота.",
    type: ApplicationCommandType.Subcommand,
    options: [
        {
            name: "max-blogs",
            description: "Максимальное кол-во блогов",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "number",
                    description: "Укажите количество блогов.",
                    type: ApplicationCommandOptionType.Integer,
                    required: true,
                },
            ],
        }, {
            name: "parent",
            description: "Категория где будут создаваться блоги.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "target",
                    description: "Укажите категорию.",
                    type: ApplicationCommandOptionType.Channel,
                    required: true,
                }
            ],
        }, {
            name: "show-settings",
            description: "Показать настройки бота.",
            type: ApplicationCommandOptionType.Subcommand,
        }
    ],
    run: Run,
};
async function Run(client, interaction) {

    const guild = await interaction.guild.getData(interaction.guild.id);

    if (interaction.options.getSubcommand() === "max-blogs") {
        if (interaction.options.getInteger("number") === guild.max_blogs) return interaction.reply(
            {
                content: ":x: Такое значение уже есть.",
                ephemeral: true
            }
        )

        if (interaction.options.getInteger("number") < 1) return interaction.reply(
            {
                content: ":x: Значение не может быть меньше 1.",
                ephemeral: true
            }
        )

        if (interaction.options.getInteger("number") > 500) return interaction.reply(
            {
                content: ":x: Значение не может быть больше 50.",
                ephemeral: true
            }
        )

        await pool.query("UPDATE guild SET max_blogs = $1 WHERE guild_id = $2", [interaction.options.getInteger("number"), interaction.guild.id]);
        return interaction.reply(
            {
                content: "Успешно изменено.",
                ephemeral: true
            }
        )
    } else if (interaction.options.getSubcommand() === "parent") {
        if (interaction.options.getChannel("target").type !== 4) return interaction.reply(
            {
                content: ":x: Вы указали голосовой чат / текстовой чат но не категорию.",
                ephemeral: true
            }
        )

        if (interaction.options.getChannel("target").id === guild.parent_id) return interaction.reply(
            {
                content: ":x: Такое значение уже есть.",
                ephemeral: true
            }
        )

        await pool.query(
            "UPDATE guild SET parent_id = $1 WHERE guild_id = $2",
            [
                interaction.options.getChannel("target").id,
                interaction.guild.id
            ]
        );

        return interaction.reply(
            {
                content: "Успешно изменено.",
                ephemeral: true
            }
        )

    } else if(interaction.options.getSubcommand("show-settings")) {
        let desc = ``;
        if(guild.parent_id === "None") desc += "Категория для блогов не была указана.";
        else desc += `Категория для блогов: <#${guild.parent_id}>`;
        desc += `\nМаксимальное кол-во блогов: ${guild.max_blogs}`;

        return interaction.reply({
            content: desc,
            ephemeral: true
        });
    }
}