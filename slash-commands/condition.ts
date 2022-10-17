import { SlashCommandBuilder } from "discord.js";
import fetch from "node-fetch";
import formatConditionEmbed from "../replies/format-condition-embed";
import type { ApiReference, ApiReferenceList, Condition } from "../types/dnd-api";
import type { CommandConfig } from "../types/slash-command";
import { BASE_URL, placeholderDetail } from "../utils/constants";
import { createAutocompleteOptions } from "../utils/map-to-autocomplete";
import { indexify, sluggify } from "../utils/sluggify";

async function fetchAllConditions() {
	const allConditions: ApiReferenceList = await fetch(BASE_URL + '/api/conditions/')
		.then(res => res.json());
	return allConditions.results.map(condition => condition.name);
}

async function fetchConditions(query: string) {
	const conditions: ApiReferenceList = await fetch(
		`${BASE_URL}/api/conditions?name=${query}`
	).then(res => res.json());
	return conditions;
}

async function fetchConditionDetails(matchedCondition: ApiReference) {
	const {index} = matchedCondition;
	const endpoint = matchedCondition.url ?? `/api/conditions/${index}`;
	const url = BASE_URL + endpoint;
	const condition: Condition = await fetch(url).then(res => res.json());
	return condition;
}

const command: CommandConfig = {
	data: new SlashCommandBuilder()
		.setName('condition')
		.setDescription('Get the rules for a given condition')
		.addStringOption(option => (
			option
				.setName('name')
				.setDescription('Condition name')
				.setRequired(true)
				.setAutocomplete(true)
		)),
	autocompleteOptions: fetchAllConditions().then(createAutocompleteOptions),
	async execute(interaction) {
		const conditionName = interaction.options.getString('name');

		if (!conditionName?.length) return;

		try {
			const query = sluggify([conditionName]);
			const {count, results} = await fetchConditions(query);
			const apiIndex = indexify([conditionName]);
			const exactMatch = results.find(item => (item.index === apiIndex));

			if (count === 0) {
				interaction.reply(`I couldn't find any conditions called _${conditionName}_. Try again with a shorter query`);
			}

			const spell = exactMatch || results[0];
			if (spell) {
				const conditionDetails = await fetchConditionDetails(spell);
				const embeds = formatConditionEmbed(conditionDetails);
				interaction.reply({embeds});
			}
		} catch (err) {
			console.error(err);
		}
	}
};

export default command;