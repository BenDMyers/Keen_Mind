import { bold, italic, EmbedBuilder } from "@discordjs/builders";
import type { Armor } from "../types/dnd-api";
import { BLUE } from "../utils/colors";

const armorCategories = ['Heavy', 'Medium', 'Light'];

const genericArmorDescription = 'Anyone can put on a suit of armor or strap a Shield to an arm. Only those proficient in the armor’s use know how to wear it effectively, however. Your class gives you proficiency with certain types of armor. If you wear armor that you lack proficiency with, you have disadvantage on any ability check, saving throw, or Attack roll that involves Strength or Dexterity, and you can’t cast Spells.';

const heavyArmorDescription = 'Heavier armor interferes with the wearer’s ability to move quickly, stealthily, and freely. If the Armor table shows “Str 13” or “Str 15” in the Strength column for an armor type, the armor reduces the wearer’s speed by 10 feet unless the wearer has a Strength score equal to or higher than the listed score.';

const shieldDescription = 'A Shield is made from wood or metal and is carried in one hand. Wielding a Shield increases your Armor Class by 2. You can benefit from only one Shield at a time.';

function formatArmorClass(armor: Armor) {
	if (!armor.armor_class?.base) return '';

	const {base, dex_bonus, max_bonus} = armor.armor_class;
	const isShield = armor.armor_category === 'Shield';

	const displayBits: string[] = [];
	displayBits.push(isShield ?
		`+${base}` :
		base.toString()
	);

	if (dex_bonus) {
		displayBits.push('+ DEX');
		if (max_bonus) {
			displayBits.push(`(max +${max_bonus})`);
		}
	}

	return displayBits.join(' ');
}

function addArmorDetails(embed: EmbedBuilder, armor: Armor) {
	if (armor.armor_class?.base) {
		const armorClass = formatArmorClass(armor);
		embed.addFields({name: 'Armor Class', value: armorClass, inline: true});
	}

	if (armor.str_minimum) {
		embed.addFields({name: 'Min Strength', value: armor.str_minimum.toString(), inline: true});
	}

	if (armor.stealth_disadvantage) {
		embed.addFields({name: 'Stealth', value: 'Disadvantage', inline: true});
	}

	if (armor.cost) {
		const cost: string[] = [];
		if (armor.cost.quantity) cost.push(armor.cost.quantity.toString());
		if (armor.cost.unit) cost.push(armor.cost.unit);
		embed.addFields({name: 'Cost', value: cost.join(' '), inline: true});
	}

	if (armor.weight) {
		embed.addFields({name: 'Weight', value: `${armor.weight} lbs`, inline: true});
	}
}

function addArmorDescription(embed: EmbedBuilder, armor: Armor) {
	const lines: string[] = [];
	const {armor_category, desc} = armor;
	const isWearableArmor = armorCategories.includes(armor_category);

	let subtitle: string | undefined;
	if (isWearableArmor) {
		subtitle = `${armor_category} Armor`;
	} else if (Array.isArray(desc) && desc.length > 0) {
		subtitle = desc.shift();
	}

	if (subtitle) {
		lines.push(bold(italic(subtitle)));
	}

	if (Array.isArray(desc) && desc.length > 0) {
		lines.push(...desc);
	}

	if (isWearableArmor) {
		lines.push(genericArmorDescription);
	}

	if (armor_category === 'Heavy') {
		lines.push(heavyArmorDescription);
	}

	if (armor_category === 'Shield') {
		lines.push(shieldDescription);
	}

	const embedDescription = lines.join('\n\n');
	embed.setDescription(embedDescription);
}

function formatArmorEmbed(armor: Armor) {
	const embed = new EmbedBuilder()
		.setTitle(armor.name)
		.setColor(BLUE);

	addArmorDetails(embed, armor);
	addArmorDescription(embed, armor);
	return [embed];
}

export default formatArmorEmbed;