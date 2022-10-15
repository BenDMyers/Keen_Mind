import { bold, italic, EmbedBuilder } from "@discordjs/builders";
import type { ApiReference, Damage, Range, Weapon } from "../types/dnd-api";
import { YELLOW } from "../utils/colors";
import { formatNumberWithCommas } from "../utils/format-numbers";
import { createTableEmbed, extractTables } from "./tables";

const filteredOutProperties = ['_id', 'monk', 'special'];

function formatDamage(damage: Damage) {
	const {damage_dice, damage_type} = damage;
	const bits: string[] = [];
	if (damage.damage_dice) {
		bits.push(damage_dice);
	}
	if (damage_type?.name) {
		bits.push(damage_type.name);
	}
	return bits.join(' ');
}

function formatRange(range: Range) {
	const bits: string[] = [];
	const {normal, long} = range;
	bits.push(`${normal} ft`);

	if (long) {
		bits.push(`${long} ft`);
	}

	return bits.join('/');
}

export function formatProperties(properties: ApiReference[]) {
	return properties
		.filter(prop => !filteredOutProperties.includes(prop.index))
		.map(prop => prop.name)
		.join(', ');
}

function addWeaponDetails(embed: EmbedBuilder, weapon: Weapon) {
	const {damage, two_handed_damage} = weapon;

	if (damage) {
		const formattedDamage = formatDamage(damage);
		embed.addFields({name: 'Damage', value: formattedDamage, inline: true});
	}

	if (two_handed_damage) {
		const formattedTwoHandedDamage = formatDamage(two_handed_damage);
		embed.addFields({name: 'Two-Handed Damage', value: formattedTwoHandedDamage, inline: true});
	}

	if (weapon.range) {
		const formattedRange = formatRange(weapon.range);
		embed.addFields({name: 'Range', value: formattedRange, inline: true});
	}

	if (weapon.throw_range) {
		const formattedThrowRange = formatRange(weapon.throw_range);
		embed.addFields({name: 'Throw Range', value: formattedThrowRange, inline: true});
	}

	if (weapon.cost) {
		const cost = `${formatNumberWithCommas(weapon.cost.quantity)} ${weapon.cost.unit}`;
		embed.addFields({name: 'Cost', value: cost, inline: true});
	}

	if (weapon.weight) {
		embed.addFields({name: 'Weight', value: `${weapon.weight} lbs`, inline: true});
	}

	if (weapon.properties) {
		const formattedProperties = formatProperties(weapon.properties);
		embed.addFields({name: 'Properties', value: formattedProperties, inline: true});
	}
}

function addWeaponDescription(mainEmbed: EmbedBuilder, weapon: Weapon, allEmbeds: EmbedBuilder[]) {
	const lines: string[] = [];

	const providedDescription = weapon.special?.length ? weapon.special : weapon.desc;

	if (Array.isArray(providedDescription) && providedDescription.length > 0 && providedDescription[0].includes('Weapon')) {
		const subtitle = providedDescription.shift() as string;
		lines.push(bold(italic(subtitle)));
	} else {
		const subtitleBits: string[] = ['Weapon'];
		if (weapon.category_range) {
			subtitleBits.unshift(weapon.category_range);
		}
		const subtitle = subtitleBits.join(' ');
		lines.push(bold(italic(subtitle)));
	}

	if (Array.isArray(providedDescription)) {
		const {description, tables} = extractTables(providedDescription);
		const tableEmbeds = tables.map(table => createTableEmbed(table, YELLOW));
		lines.push(...description);
		allEmbeds.push(...tableEmbeds);
	} else {
		lines.push(providedDescription);
	}

	mainEmbed.setDescription(lines.join('\n\n'));
}

function formatWeaponEmbed(weapon: Weapon) {
	const mainEmbed = new EmbedBuilder()
		.setTitle(weapon.name)
		.setColor(YELLOW);
	
	const embeds = [mainEmbed];

	addWeaponDetails(mainEmbed, weapon);
	addWeaponDescription(mainEmbed, weapon, embeds);

	return embeds;
}

export default formatWeaponEmbed;