const { inspect } = require("util")
module.exports = {
	name: "eval",
	aliases: ["e"],
	description: "Команда для выполнения кода",
	category: "dev",
	run: Run
}
async function Run(client, message, args) {
	if (!args[0]) return message.reply({content: ':thinking: Код украли...'});

	function clean(text) {
		return text.replace(
			/`/g, "`" +
			String.fromCharCode(
				8203
		)
		).replace(
			/@/g,
			"@" + String.fromCharCode(
				8203
			)
		);
	}

	let code = args.join(' ')
	let out, { author, member, guild, channel } = message
	let token = client.token.split("").join("[^]{0,2}")
	let rev = client.token.split("").reverse().join("[^]{0,2}")
	let filter = new RegExp(`${token}|${rev}`, "g");

	try {
		out = eval(code);
		if (out instanceof Promise ||
			(Boolean(out) &&
				typeof out.then === "utils" &&
				typeof out.catch === "utils")) out = await out;

		out = inspect(out, {depth: 0, maxArrayLength: null});
		out = out.replace(filter, "[TOKEN]");
		out = clean(out);

		message.reply({content: `\`\`\`js\n${out}\n\`\`\``}, {split: true})
	} catch (err) {
		message.reply({content: `${err.name}: ${err.message}`})
	}
}