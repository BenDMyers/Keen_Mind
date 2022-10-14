import { SlashCommandBuilder } from "discord.js";
import type { CommandConfig } from "../types/slash-command";

const command: CommandConfig = {
	data: new SlashCommandBuilder()
		.setName('monster')
		.setDescription('Get a statblock for a monster')
		.addStringOption((option) => (
			option
				.setName('name')
				.setDescription(`Monster's name`)
				.setRequired(true)
		)),
	async execute(interaction) {
		const monsterName = interaction.options.getString('name');

		if (!monsterName && !monsterName?.length) return;

	}
};

export default command;