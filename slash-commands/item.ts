import type { ApiReference, ApiReferenceList, Armor, Equipment, Gear, MagicItem, Weapon } from '../types/dnd-api';
import fetch from 'node-fetch'
import { SlashCommandBuilder } from 'discord.js';
import { sluggify, indexify } from '../utils/sluggify';
import { CommandConfig } from '../types/slash-command';
import formatArmorEmbed from '../replies/format-armor-embed';
import formatWeaponEmbed from '../replies/format-weapon-embed';
import formatWondrousItemEmbed from '../replies/format-wondrous-item-embed';
import formatAdventuringGearEmbed from '../replies/format-adventuring-gear-embed';
import { BASE_URL, placeholderDetail } from '../utils/constants';

async function fetchAllItems() {
	const allEquipment: ApiReferenceList = await fetch(BASE_URL + '/api/equipment/').then(res => res.json());
	const allMagicItems: ApiReferenceList = await fetch(BASE_URL + '/api/magic-items/').then(res => res.json());
	const allItems = [...allEquipment.results, ...allMagicItems.results].map(item => item.name);
	allItems.sort();
	return allItems;
}

/**
 * @param query requested item name, formatted for query strings
 */
async function fetchItems(query: string) {
	const equipment: ApiReferenceList = await fetch(
		`${BASE_URL}/api/equipment?name=${query}`
	).then(res => res.json());

	const magicItems: ApiReferenceList = await fetch(
		`${BASE_URL}/api/magic-items?name=${query}`
	).then(res => res.json());

	const count = (equipment.count || 0) + (magicItems.count || 0);
	const results = [...(equipment.results || []), ...(magicItems.results || [])];
	return {count, results} as ApiReferenceList;
}

async function fetchItemDetails(matchedItem: ApiReference) {
	const {index} = matchedItem;
	const endpoint = matchedItem.url ?? `/api/magic-items/${index}`;
	const url = BASE_URL + endpoint;
	const item: Equipment | MagicItem = await fetch(url).then(res => res.json());
	return item;
}

function formatItemEmbeds(item: Equipment | MagicItem) {
	const equipmentCategory = item.equipment_category.index || item.equipment_category.name.toLowerCase();
	switch (equipmentCategory) {
		case 'armor':
			return formatArmorEmbed(item as Armor);
		case 'weapon':
			return formatWeaponEmbed(item as Weapon);
		case 'wondrous-items':
		case 'wondrous item':
			return formatWondrousItemEmbed(item as MagicItem);
		default:
			return formatAdventuringGearEmbed(item as Gear);
	}
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
				.setAutocomplete(true)
		)),
	async execute(interaction) {
		const itemName = interaction.options.getString('name');

		if (!itemName && !itemName?.length) return;

		try {
			const query = sluggify([itemName]);
			const {count, results} = await fetchItems(query);
			const apiIndex = indexify([itemName]);
			const exactMatch = results.find(item => (item.index === apiIndex));

			if (count === 0) {
				interaction.reply(`I couldn't find any items called _${itemName}_. Try again with a shorter query`);
			}

			const item = exactMatch || results[0];
			if (item) {
				const itemDetails = await fetchItemDetails(item);
				const embeds = formatItemEmbeds(itemDetails);
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
	autocompleteOptions: fetchAllItems().then(items => items.map(item => ({name: item, value: item})))
};

export default command;