const {SlashCommandBuilder} = require('discord.js');
const dice = require('rpgdicejs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('roll')
		.setDescription('roll some dice using familiar dice notation')
		.addStringOption((option) => (
			option
				.setName('notation')
				.setDescription('dice notation for this roll')
				.setRequired(true)
		)),
	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 */
	async execute(interaction) {
		const notation = interaction.options.getString('notation');

		try {
			const roll = dice.eval(notation);
			const rendered = roll.render();
			const response = `\`${rendered}\`\n= **${roll.value}**`;

			if (response.length >= 2000) {
				await interaction.reply(`Trust me, you rolled a **${roll.value}**.`);
			} else {
				await interaction.reply(response);
			}
		} catch (err) {
			await interaction.reply('Sorry! That wasn\'t a valid roll!');
		}
	}
};