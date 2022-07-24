const { ApplicationCommandType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const pool = require("../../postgresql");
module.exports = {
    name: "delete_blog",
    description: "Удаление личного блога.",
    type: ApplicationCommandType.String,
    run: Run
}
async function Run(client, interaction) {
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
        });

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

    interaction.reply({content: `Вы уверены что хотите удалить свой блог? [ <#${user.rows[0].channel_id}> ] 
Если вы удалите то потеряете все сообщения!`, components: [button], ephemeral: true});

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
            const channel = interaction.guild.channels.cache.get(user.rows[0].channel_id)
            if(channel) channel.delete();
            await pool.query(
                "UPDATE person SET channel_id = 'None', blog = false, messages = 0 WHERE user_id = $1 AND guild_id = $2",
                [
                    interaction.user.id,
                    interaction.guildId
                ]);

            await pool.query("UPDATE guild SET blog_count = blog_count - 1");

            return ButtonInteraction.followUp({content: "Блог был удален!", ephemeral: true});
        }
        if(id === "cancel") return ButtonInteraction.followUp({
            content: "Отменено удаление блога",
            ephemeral: true
        });

    });
}