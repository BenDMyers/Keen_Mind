require('dotenv').config();
const fs = require('fs');
const Discord = require('discord.js');

const client = new Discord.Client();
const prefix = '!';

// Source commands from the `commands/` directory and add them to the Discord client
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.on('message', (message) => {
	if (message.author.bot || !message.content.startsWith(prefix)) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();

	if (!client.commands.has(commandName)) return;

	const command = client.commands.get(commandName);
	command.execute(message, args);
});

client.login(process.env.DISCORD_TOKEN);