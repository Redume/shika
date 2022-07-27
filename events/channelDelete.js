const pool = require("../postgresql");
module.exports = async(client, channel) => {
    if(channel.type !== 0) return;
    const user = await pool.query("SELECT * FROM person WHERE guild_id = $1", [channel.guildId]);
    if(user.rows.length === 0) return;
    if(user.rows[0].channel_id === channel.id) {
        await pool.query("UPDATE person SET channel_id = 'None', blog = false WHERE channel_id = $1", [channel.id]);
        await pool.query("UPDATE guild SET blogs_count = blogs_count - 1 WHERE guild_id = $1", [channel.guildId]);
    }
}