import fetch from 'node-fetch'
import { SlashCommandBuilder } from "discord.js";
import type { ApiReference, ApiReferenceList, Monster } from "../types/dnd-api";
import type { CommandConfig } from "../types/slash-command";
import { BASE_URL, placeholderDetail } from "../utils/constants";
import { indexify, sluggify } from '../utils/sluggify';
import { formatMonsterEmbed } from '../replies/format-monster-embed';

async function fetchAllMonsters() {
	const allMonsters: ApiReferenceList = await fetch(BASE_URL + '/api/monsters/')
		.then(res => res.json());
	return allMonsters.results.map(monster => monster.name);
}

/**
 * @param query requested monster name, formatted for query strings
 */
 async function fetchMonsters(query: string) {
	const monsters: ApiReferenceList = await fetch(
		`${BASE_URL}/api/monsters?name=${query}`
	).then(res => res.json());
	return monsters;
}

async function fetchMonsterDetails(matchedItem: ApiReference) {
	const {index} = matchedItem;
	const endpoint = matchedItem.url ?? `/api/monsters/${index}`;
	const url = BASE_URL + endpoint;
	const monster: Monster = await fetch(url).then(res => res.json());
	return monster;
}

const command: CommandConfig = {
	data: new SlashCommandBuilder()
		.setName('monster')
		.setDescription('Get a statblock for a monster')
		.addStringOption((option) => (
			option
				.setName('name')
				.setDescription(`Monster's name`)
				.setRequired(true)
				.setAutocomplete(true)
		)),
	async execute(interaction) {
		const monsterName = interaction.options.getString('name');

		if (!monsterName && !monsterName?.length) return;

		try {
			const query = sluggify([monsterName]);
			const {count, results} = await fetchMonsters(query);
			const apiIndex = indexify([monsterName]);
			const exactMatch = results.find(item => (item.index === apiIndex));

			if (count === 0) {
				interaction.reply(`I couldn't find any monsters called _${monsterName}_. Try again with a shorter query`);
			}

			const monster = exactMatch || results[0];
			if (monster) {
				const monsterDetails = await fetchMonsterDetails(monster);
				const embeds = formatMonsterEmbed(monsterDetails);
				for (const embed of embeds) {
					const embedJson = embed.toJSON();
					if (embedJson.fields?.length && embedJson.fields.length % 3 === 2) {
						embed.addFields(placeholderDetail);
					}
				}
				interaction.reply({embeds});
			}
		} catch (err) {
			console.error(err);
		}
	},
	autocompleteOptions: fetchAllMonsters()
		.then(monsters => monsters.map(monster => ({name: monster, value: monster})))
};

export default command;