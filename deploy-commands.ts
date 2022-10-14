import type { CommandConfig } from "./types/slash-command";

require('dotenv').config();
import fs from 'fs';
import path from 'path';
import {REST, Routes} from 'discord.js';

const commands = [];
const commandsPath = path.join(__dirname, 'slash-commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));

(async function() {
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = (await import(filePath)).default as CommandConfig;
		// @ts-ignore
		commands.push(command.data.toJSON());
	}
	
	const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN as string);
	
	rest.put(Routes.applicationCommands(process.env.DISCORD_APPLICATION_ID as string), { body: commands })
		.then(data => console.log(`Successfully registered ${(data as any[]).length} application commands.`))
		.catch(console.error);
})();