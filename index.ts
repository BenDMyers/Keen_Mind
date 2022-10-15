require('dotenv').config();
import { ChatInputCommandInteraction, Interaction } from 'discord.js';
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
		if ((command.autocompleteOptions as Promise<any>)?.then) {
			command.autocompleteOptions = await command.autocompleteOptions;
		}
		// Set a new item in the Collection
		// With the key as the command name and the value as the exported module
		console.log(command);
		client.commands.set(command.data.name, command);
	}
})();

client.on('interactionCreate', async (interaction: Interaction) => {
	const interactionClient = interaction.client as CustomDiscordClient;

	const command = interactionClient.commands.get((interaction as ChatInputCommandInteraction).commandName);
	if (!command) return;

	if (interaction.isAutocomplete() && command.autocompleteOptions) {
		const focusedValue = interaction.options.getFocused().toLowerCase();
		const options = (command.autocompleteOptions as {name: string, value: string}[]);
		const completions = options
			.filter(option => option.name.toLowerCase().includes(focusedValue))
			.slice(0, 25);
		await interaction.respond(completions);
	}

	if (!interaction.isChatInputCommand()) return;

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