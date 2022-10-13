import fetch from 'node-fetch'
import {SlashCommandBuilder} from 'discord.js';
import {sluggify, indexify} from '../utils/sluggify';
import { CommandConfig } from '../types/slash-command';

/**
 * @param {string} query requested item name
 * @returns {{count: number, results: any[]}}
 */
async function fetchItems(query: string) {
	const standardItems = await fetch(`https://www.dnd5eapi.co/api/equipment?name=${query}`)
		.then(res => res.json());
	const magicItems = await fetch(`https://www.dnd5eapi.co/api/magic-items?name=${query}`)
		.then(res => res.json());

	const count = (standardItems.count || 0) + (magicItems.count || 0);
	const results = [...(standardItems.results || []), ...(magicItems.results || [])];
	return {count, results};
}

const command: CommandConfig = {
	data: new SlashCommandBuilder()
		.setName('item')
		.setDescription('Get details for an item')
		.addStringOption((option) => (
			option
				.setName('name')
				.setDescription('Name of the armor, weapon, or other item')
				.setRequired(true)
		)),
	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 */
	async execute(interaction) {
		const itemName = interaction.options.getString('name');

		if (!itemName && !itemName?.length) return;

		try {
			const query = sluggify([itemName]);
			const {count /* , results */ } = await fetchItems(query);
			// const apiIndex = indexify(itemName);
			// const exactMatch = results.find(item => (item.index === apiIndex));

			if (count === 0) {
				interaction.reply(`I couldn't find any items called _${itemName}_. Try again with a shorter query`);
			}
		} catch (err) {
			console.error(err);
		}
	}
};

export default command;