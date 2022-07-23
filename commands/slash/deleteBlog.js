const { ApplicationCommandType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const pool = require("../../postgresql");
module.exports = {
    name: "delete_blog",
    description: "Удаление блога",
    type: ApplicationCommandType.String,
    run: Run
}
async function Run(client, interaction) {
    const user = await pool.query("SELECT * FROM person WHERE user_id = $1", [interaction.user.id]);

    if(!user.rows[0]?.blog ? !user.rows[0]?.blog : false) return interaction.reply({content: ":x: У вас нет блога", ephemeral: true});

    const button = new ActionRowBuilder()
        button.addComponents(
            new ButtonBuilder()
            .setCustomId("delete")
            .setLabel("Да")
            .setStyle(ButtonStyle.Danger)
    )
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

    collector.on("end", async (ButtonInteraction) => {
        await ButtonInteraction.first().deferUpdate();
        const id = ButtonInteraction.first().customId;

        if(id === "delete") {
            const channel = interaction.guild.channels.cache.get(user.rows[0].channel_id)
            if(channel) channel.delete();
            await pool.query("UPDATE person SET channel_id = 'None', blog = false, channel_create = '0' WHERE user_id = $1", [interaction.user.id]);
            await pool.query("UPDATE guild SET blog_count = blog_count - 1");

            return ButtonInteraction.first().followUp({content: "Блог был удален!", ephemeral: true});
        }
        if(id === "cancel") return ButtonInteraction.first().followUp({content: "Отменено удаление блога", ephemeral: true});

    });

}