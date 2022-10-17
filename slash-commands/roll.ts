import type { CommandConfig } from '../types/slash-command';
import type { ChatInputCommandInteraction } from 'discord.js';
import {SlashCommandBuilder} from 'discord.js';
import {DiceRoll} from '@dice-roller/rpg-dice-roller';

const command: CommandConfig = {
	data: new SlashCommandBuilder()
		.setName('roll')
		.setDescription('Roll some dice using dice notation')
		.addStringOption((option) => (
			option
				.setName('notation')
				.setDescription('Dice notation for this roll')
				.setRequired(true)
		)),
	async execute(interaction: ChatInputCommandInteraction) {
		const notation = interaction.options.getString('notation');

		if (!notation) return;

		try {
			const roll = new DiceRoll(notation);
			const response = `\`${roll.output}\`\n= **${roll.total}**`;

			if (response.length >= 2000) {
				await interaction.reply(`Trust me, you rolled a **${roll.total}**.`);
			} else {
				await interaction.reply(response);
			}
		} catch (err) {
			await interaction.reply('Sorry! That wasn\'t a valid roll!');
		}
	}
};

export default command;