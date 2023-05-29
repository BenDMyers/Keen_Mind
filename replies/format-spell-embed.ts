import { bold, italic, EmbedBuilder } from "@discordjs/builders";
import type { Spell } from "../types/dnd-api";
import { PURPLE } from "../utils/colors";
import { placeholderDetail } from "../utils/constants";
import ordinal from "../utils/ordinals";

function formatSpellComponents(spell: Spell) {
	const lines: string[] = [];
	if (spell.components.includes('V')) {
		lines.push('Verbal');
	}
	if (spell.components.includes('S')) {
		lines.push('Somatic');
	}
	if (spell.components.includes('M')) {
		lines.push(
			spell.material ?
				`Material (${spell.material.replace(/\.$/, '')})` :
				'Material'
		);
	}
	return lines.join(', ');
}

function formatSpellDuration(spell: Spell) {
	const durationBits: string[] = [];
	if (spell.concentration) {
		durationBits.push('Concentration');
	}
	if (spell.duration) {
		durationBits.push(spell.duration);
	}
	const duration = durationBits.join(', ');
	return duration;
}

function formatSpellDamage(spell: Spell) {
	if (!spell.damage) return '';
	const {damage_at_slot_level, damage_type} = spell.damage;

	const damageBits: string[] = [];

	if (damage_at_slot_level) {
		damageBits.push(damage_at_slot_level[spell.level]);
	}
	if (damage_type?.name) {
		damageBits.push(damage_type.name);
	}

	return damageBits.join(' ');
}

function addSpellDetails(embed: EmbedBuilder, spell: Spell) {
	let fieldCount = 0;

	if (spell.casting_time) {
		embed.addFields({name: 'Casting Time', value: spell.casting_time, inline: true});
		fieldCount++;
	}
	if (spell.range) {
		embed.addFields({name: 'Range', value: spell.range, inline: true});
		fieldCount++;
	}
	if (spell.components) {
		const components = formatSpellComponents(spell);
		embed.addFields({name: 'Components', value: components, inline: true});
		fieldCount++;
	}
	if (spell.concentration || spell.duration) {
		const duration = formatSpellDuration(spell);
		embed.addFields({name: 'Duration', value: duration, inline: true});
		fieldCount++;
	}
	if (spell.classes?.length) {
		const classes = spell.classes.map(c => c.name).join(', ');
		embed.addFields({name: 'Classes', value: classes, inline: true});
		fieldCount++;
	}
	if (spell.damage) {
		const damage = formatSpellDamage(spell);
		embed.addFields({name: 'Damage', value: damage, inline: true});
		fieldCount++;
	}
	if (spell.area_of_effect) {
		const {size, type} = spell.area_of_effect;
		const areaOfEffect = `${size}-ft ${type}`;
		embed.addFields({name: 'Area of Effect', value: areaOfEffect, inline: true});
		fieldCount++;
	}

	if (fieldCount % 3 === 2) {
		embed.addFields(placeholderDetail);
	}

	if (Array.isArray(spell.higher_level) && spell.higher_level?.length) {
		const atHigherLevels = spell.higher_level.join('\n\n');
		embed.addFields({name: 'At Higher Levels', value: atHigherLevels, inline: false});
	} else if (spell.higher_level && typeof spell.higher_level === 'string') {
		embed.addFields({name: 'At Higher Levels', value: spell.higher_level, inline: false});
	}
}

function formatSpellSubtitle(spell: Spell) {
	const level = spell.level === 0 ? 'Cantrip' : `${ordinal(spell.level)} Level`;
	
	let subtitle = `${level} · ${spell.school.name}`;
	if (spell.ritual) {
		subtitle += ' (Ritual)';
	}
	return subtitle;
}

function addSpellDescription(mainEmbed: EmbedBuilder, spell: Spell, allEmbeds: EmbedBuilder[]) {
	const descriptionLines: string[] = [];

	const subtitle = formatSpellSubtitle(spell);
	descriptionLines.push(bold(italic(subtitle)));

	if (typeof spell.desc === 'string') {
		descriptionLines.push(spell.desc);
	} else if (Array.isArray(spell.desc) && spell.desc?.length) {
		descriptionLines.push(...spell.desc);
	}

	let currentDescriptionLines: string[] = [];
	let currentEmbed = mainEmbed;
	for (const line of descriptionLines) {
		if ([...currentDescriptionLines, line].join('\n\n').length > 2400) {
			currentEmbed = new EmbedBuilder().setColor(PURPLE);
			allEmbeds.push(currentEmbed);
			currentDescriptionLines = [];
		}

		currentDescriptionLines.push(line);
		const description = currentDescriptionLines.join('\n\n');
		currentEmbed.setDescription(description);
	}
}

function formatSpellEmbed(spell: Spell) {
	const mainEmbed = new EmbedBuilder()
		.setTitle(spell.name)
		.setColor(PURPLE);
	
	const embeds = [mainEmbed];

	addSpellDetails(mainEmbed, spell);
	addSpellDescription(mainEmbed, spell, embeds);

	return embeds;
}

export default formatSpellEmbed;