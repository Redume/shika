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
    const user = await pool.query(
        "SELECT * FROM person WHERE user_id = $1 AND guild_id = $2",
        [
            interaction.user.id,
            interaction.guildId
        ]
    );

    const guild = await pool.query("SELECT * FROM guild WHERE guild_id = $1", [interaction.guildId]);

    if(user.rows[0]?.blog ? user.rows[0]?.blog : false) return interaction.reply({
        content: ":x: У вас уже есть блог",
        ephemeral: true
    });

    if(guild.rows[0].max_blogs <= guild.rows[0].blogs_count) return interaction.reply({
        content: ":x: Вы не можете создать блог, так как уже максимальное кол-во блогов.",
        ephemeral: true
    });


    const channel = await interaction.guild.channels.create({name: interaction.options.getString("name"),
        permissionOverwrites: [{
            id: interaction.guild.id,
            deny: PermissionsBitField.Flags.SendMessages
        }, {
            id: interaction.user.id,
            allow: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageMessages]
        }]
    });

    if(guild.rows[0].blog_parent !== "None") channel.setParent(guild.rows[0].blog_parent);
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

    await pool.query("UPDATE guild SET blog_count = blog_count + 1");

    interaction.reply({content: `Ваш личный блог успешно создан!
                                     <#${channel.id}>`, ephemeral: true});
}