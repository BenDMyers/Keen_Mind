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
		))
		.addBooleanOption((option) => (
			option
				.setName('private')
				.setDescription('If the roll if private, only you will be able to see the results.')
		)),
	async execute(interaction: ChatInputCommandInteraction) {
		const notation = interaction.options.getString('notation');
		const ephemeral = !!interaction.options.getBoolean('private');

		if (!notation) return;

		try {
			const roll = new DiceRoll(notation);
			const response = `\`${roll.output}\`\n= **${roll.total}**`;

			if (response.length >= 2000) {
				await interaction.reply({
					content: `Trust me, you rolled a **${roll.total}**.`,
					ephemeral
				});
			} else {
				await interaction.reply({
					content: response,
					ephemeral
				});
			}
		} catch (err) {
			await interaction.reply({
				content: 'Sorry! That wasn\'t a valid roll!',
				ephemeral
			});
		}
	}
};

export default command;