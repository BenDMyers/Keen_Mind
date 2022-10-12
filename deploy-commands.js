require('dotenv').config();
const fs = require('fs');
const path = require('path');
const {REST, Routes} = require('discord.js');

const commands = [];
const commandsPath = path.join(__dirname, 'slash-commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

rest.put(Routes.applicationCommands(process.env.DISCORD_APPLICATION_ID), { body: commands })
	.then(data => console.log(`Successfully registered ${data.length} application commands.`))
	.catch(console.error);