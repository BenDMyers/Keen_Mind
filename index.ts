require('dotenv').config();
import { Interaction } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { CommandConfig } from './types/slash-command';
import {
	Client,
	Collection,
	GatewayIntentBits
} from 'discord.js';
import { CustomDiscordClient } from './types/custom-client';

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages]
}) as CustomDiscordClient;

(async () => {
	// Source commands from the `commands/` directory and add them to the Discord client
	client.commands = new Collection();
	const commandsPath = path.join(__dirname, 'slash-commands');
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = (await import(filePath)).default as CommandConfig;
		// Set a new item in the Collection
		// With the key as the command name and the value as the exported module
		console.log(command);
		client.commands.set(command.data.name, command);
	}
})();
// const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
// for (const file of commandFiles) {
// 	const command = require(`./commands/${file}`);
// 	client.commands.set(command.name, command);
// 	client.commands.set(command.name.charAt(0), command);
// }

// client.on('message', (message) => {
// 	if (message.author.bot || !message.content.startsWith(prefix)) return;

// 	const args = message.content.slice(prefix.length).trim().split(/ +/);
// 	const commandName = args.shift().toLowerCase();

// 	if (!client.commands.has(commandName)) return;

// 	const command = client.commands.get(commandName);
// 	command.execute(message, args);
// });

client.on('interactionCreate', async (interaction: Interaction) => {
	if (!interaction.isChatInputCommand()) return;
	
	const interactionClient = interaction.client as CustomDiscordClient;

	const command = interactionClient.commands.get(interaction.commandName);
	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (err) {
		console.error(err);
		await interaction.reply({
			content: 'There was an error while executing this command!',
			ephemeral: true
		});
	}
});

client.login(process.env.DISCORD_TOKEN);