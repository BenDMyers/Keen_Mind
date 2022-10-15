import { SlashCommandBuilder } from "@discordjs/builders";
import fetch from "node-fetch";
import formatSpellEmbed from "../replies/format-spell-embed";
import type { ApiReference, ApiReferenceList, Spell } from "../types/dnd-api";
import type { CommandConfig } from "../types/slash-command";
import { BASE_URL, placeholderDetail } from "../utils/constants";
import { indexify, sluggify } from "../utils/sluggify";

async function fetchAllSpells() {
	const allSpells: ApiReferenceList = await fetch(BASE_URL + '/api/spells/')
		.then(res => res.json());
	return allSpells.results.map(spell => spell.name);
}

/**
 * @param query requested spell name, formatted for query strings
 */
 async function fetchSpells(query: string) {
	const spells: ApiReferenceList = await fetch(
		`${BASE_URL}/api/spells?name=${query}`
	).then(res => res.json());
	return spells;
}

async function fetchSpellDetails(matchedItem: ApiReference) {
	const {index} = matchedItem;
	const endpoint = matchedItem.url ?? `/api/spells/${index}`;
	const url = BASE_URL + endpoint;
	const spell: Spell = await fetch(url).then(res => res.json());
	return spell;
}

const command: CommandConfig = {
	data: new SlashCommandBuilder()
		.setName('spell')
		.setDescription('Get the details for a spell')
		.addStringOption((option) => (
			option
				.setName('name')
				.setDescription('Name of the spell')
				.setRequired(true)
				.setAutocomplete(true)
		)),
	async execute(interaction) {
		const spellName = interaction.options.getString('name');

		if (!spellName?.length) return;

		try {
			const query = sluggify([spellName]);
			const {count, results} = await fetchSpells(query);
			const apiIndex = indexify([spellName]);
			const exactMatch = results.find(item => (item.index === apiIndex));

			if (count === 0) {
				interaction.reply(`I couldn't find any items called _${spellName}_. Try again with a shorter query`);
			}

			const spell = exactMatch || results[0];
			if (spell) {
				const spellDetails = await fetchSpellDetails(spell);
				const embeds = formatSpellEmbed(spellDetails);
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
	autocompleteOptions: fetchAllSpells()
		.then(spells => spells.map(spell => ({name: spell, value: spell})))
};

export default command;