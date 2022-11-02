import { bold, italic, EmbedBuilder } from "@discordjs/builders";
import type { Monster, MonsterAction, Proficiency, SpecialAbility, Speed, Usage } from "../types/dnd-api";
import getAbilityScoreModifier from "../utils/ability-score-modifiers";
import { RED } from "../utils/colors";
import { formatFraction, formatNumberWithCommas } from "../utils/format-numbers";
import formatObjectAsCsv from "../utils/format-object-as-csv";
import toTitleCase from "../utils/to-title-case";
// import { BASE_URL } from "../utils/constants";

function formatAbilityScore(score: number) {
	const modifier = getAbilityScoreModifier(score);
	return [
		bold(score.toString()),
		italic(`(${modifier})`)
	].join(' ');
}

function addAbilityScores(mainEmbed: EmbedBuilder, monster: Monster) {
	const {strength, dexterity, constitution, intelligence, wisdom, charisma} = monster;

	mainEmbed.addFields(
		{name: 'STR', value: formatAbilityScore(strength), inline: true},
		{name: 'DEX', value: formatAbilityScore(dexterity), inline: true},
		{name: 'CON', value: formatAbilityScore(constitution), inline: true},
		{name: 'INT', value: formatAbilityScore(intelligence), inline: true},
		{name: 'WIS', value: formatAbilityScore(wisdom), inline: true},
		{name: 'CHA', value: formatAbilityScore(charisma), inline: true},
	);
}

function formatNameValuePair(name: string, value: string) {
	return `${bold(name)} ${value}`;
}

function formatUsage(usage: Usage) {
	const bits: string[] = [usage.type];
	if (usage.times) {
		bits.unshift(usage.times.toString());
	}
	return bits.join(' ');
}

function createTraitEmbeds(traits: SpecialAbility[]) {
	const firstTraitEmbed = new EmbedBuilder()
		.setTitle('Traits')
		.setColor(RED);

	const traitEmbeds = [firstTraitEmbed];

	let currentTraitEmbed = firstTraitEmbed;
	let currentDescriptionLines: string[] = [];
	for (const trait of traits) {
		const traitNameBits = [trait.name];
		if (trait.usage) {
			const formattedUsage = formatUsage(trait.usage);
			traitNameBits.push(italic(`(${formattedUsage})`));
		}
		const traitText = trait.desc.replace('\n\n', '\n');

		const traitDescription = formatNameValuePair(traitNameBits.join(' ') + '.', traitText);

		if ([...currentDescriptionLines, traitDescription].join('\n\n').length > 2400) {
			currentTraitEmbed = new EmbedBuilder().setColor(RED);
			traitEmbeds.push(currentTraitEmbed);
			currentDescriptionLines = [];
		}

		currentDescriptionLines.push(traitDescription);
		const description = currentDescriptionLines.join('\n\n');
		currentTraitEmbed.setDescription(description);
	}

	return traitEmbeds;
}

function createActionEmbeds(heading: string, actions: MonsterAction[]) {
	const firstActionEmbed = new EmbedBuilder()
		.setTitle(heading)
		.setColor(RED);
	
	const actionEmbeds = [firstActionEmbed];

	let currentActionEmbed = firstActionEmbed;
	let currentDescriptionLines: string[] = [];
	for (const action of actions) {
		const actionDescription = formatNameValuePair(action.name + '.', action.desc);

		if ([...currentDescriptionLines, actionDescription].join('\n\n').length > 2400) {
			currentActionEmbed = new EmbedBuilder().setColor(RED);
			actionEmbeds.push(currentActionEmbed);
			currentDescriptionLines = [];
		}

		currentDescriptionLines.push(actionDescription);
		const description = currentDescriptionLines.join('\n\n');
		currentActionEmbed.setDescription(description);
	}

	return actionEmbeds;
}

function formatMonsterSubtitle(monster: Monster) {
	let subtitle = `${monster.size} ${monster.type}`;
	if (monster.subtype) {
		subtitle += ` (${monster.subtype})`;
	}
	if (monster.alignment) {
		subtitle += `, ${monster.alignment}`;
	}
	return subtitle;
}

function formatSpeed(speed: Speed) {
	const {walk, ...otherSpeeds} = speed;
	
	const formattedOtherSpeeds = formatObjectAsCsv(otherSpeeds);

	return formattedOtherSpeeds ?
		`${walk}, ${formattedOtherSpeeds}` :
		walk;
}

function formatProficiencies(proficiencies: Proficiency[]) {
	return proficiencies
		.map(p => {
			const name = p.proficiency.name.replace(/.*:\s*/g, '');
			const bonus = p.value >= 0 ? `+${p.value}` : p.value;
			return `${name} ${bonus}`;
		})
		.join(', ');
}

function addMonsterDescription(mainEmbed: EmbedBuilder, monster: Monster, allEmbeds: EmbedBuilder[]) {
	const descriptionLines: string[] = [];

	const subtitle = bold(italic(formatMonsterSubtitle(monster)));
	descriptionLines.push(subtitle, '');

	if (Array.isArray(monster.desc)) {
		descriptionLines.push(...monster.desc, '');
	} else if (typeof monster.desc === 'string') {
		descriptionLines.push(monster.desc, '');
	}

	if (monster.armor_class) {
		descriptionLines.push(
			formatNameValuePair('Armor Class', monster.armor_class.toString())
		);
	}
	if (monster.hit_points) {
		const hitDice = monster.hit_points_roll ?? monster.hit_dice;
		const hitPoints = `${monster.hit_points} ${italic('(' + hitDice + ')')}`;
		descriptionLines.push(
			formatNameValuePair('Hit Points', hitPoints)
		);
	}
	if (monster.speed) {
		const formattedSpeed = formatSpeed(monster.speed);
		descriptionLines.push(
			formatNameValuePair('Speed', formattedSpeed)
		);
	}
	descriptionLines.push('');

	const savingThrowProficiencies = monster.proficiencies?.filter(p => p.proficiency.name.startsWith('Saving Throw: '));
	const skillProficiencies = monster.proficiencies?.filter(p => p.proficiency.name.startsWith('Skill: '));

	if (savingThrowProficiencies?.length) {
		const formattedSavingThrowProficiencies = formatProficiencies(savingThrowProficiencies);
		descriptionLines.push(
			formatNameValuePair('Saving Throws', formattedSavingThrowProficiencies)
		);
	}
	if (skillProficiencies?.length) {
		const formattedSkillProficiencies = formatProficiencies(skillProficiencies);
		descriptionLines.push(
			formatNameValuePair('Skills', formattedSkillProficiencies)
		);
	}
	if (monster.damage_vulnerabilities?.length) {
		const containsCommas = monster.damage_vulnerabilities.some(v => v.includes(','));
		const delimiter = containsCommas ? '; ' : ', ';
		const formattedVulnerabilities = monster.damage_vulnerabilities.map(toTitleCase).join(delimiter);
		descriptionLines.push(
			formatNameValuePair('Damage Vulnerabilities', formattedVulnerabilities)
		);
	}
	if (monster.damage_resistances?.length) {
		const containsCommas = monster.damage_resistances.some(r => r.includes(','));
		const delimiter = containsCommas ? '; ' : ', ';
		const formattedResistances = monster.damage_resistances.map(toTitleCase).join(delimiter);
		descriptionLines.push(
			formatNameValuePair('Damage Resistance', formattedResistances)
		);
	}
	if (monster.damage_immunities?.length) {
		const containsCommas = monster.damage_immunities.some(i => i.includes(','));
		const delimiter = containsCommas ? '; ' : ', ';
		const formattedImmunities = monster.damage_immunities.map(toTitleCase).join(delimiter);
		descriptionLines.push(
			formatNameValuePair('Damage Immunities', formattedImmunities)
		);
	}
	if (monster.condition_immunities?.length) {
		const formattedImmunities = monster.condition_immunities.map(i => toTitleCase(i.name)).join(', ');
		descriptionLines.push(
			formatNameValuePair('Condition Immunities', formattedImmunities)
		);
	}
	if (monster.senses && Object.keys(monster.senses).length > 0) {
		const formattedSenses = formatObjectAsCsv(monster.senses);
		descriptionLines.push(
			formatNameValuePair('Senses', formattedSenses)
		);
	}
	if (monster.languages) {
		descriptionLines.push(
			formatNameValuePair('Languages', monster.languages)
		);
	}
	if (typeof monster.challenge_rating === 'number') {
		const {challenge_rating, xp} = monster;
		const ratingBits = [formatFraction(challenge_rating)];
		if (xp) {
			const formattedXP = formatNumberWithCommas(xp);
			ratingBits.push(`(${formattedXP} XP)`);
		}
		const rating = ratingBits.join(' ');
		descriptionLines.push(
			formatNameValuePair('Challenge', rating)
		);
	}

	let currentEmbed = mainEmbed;
	let currentDescriptionLines: string[] = [];
	for (const line of descriptionLines) {
		if ([...currentDescriptionLines, line].join('\n').length > 2400) {
			currentEmbed = new EmbedBuilder().setColor(RED);
			allEmbeds.push(currentEmbed);
			currentDescriptionLines = [];
		}

		currentDescriptionLines.push(line);
		const description = currentDescriptionLines.join('\n');
		currentEmbed.setDescription(description);
	}
}

export function formatMonsterEmbed(monster: Monster) {
	const mainEmbed = new EmbedBuilder()
		.setTitle(monster.name)
		.setColor(RED);

	const embeds = [mainEmbed];

	if (monster.strength /* use strength as proxy for having all ability scores */) {
		addAbilityScores(mainEmbed, monster);
	}

	addMonsterDescription(mainEmbed, monster, embeds);

	if (monster.special_abilities?.length) {
		const traitEmbeds = createTraitEmbeds(monster.special_abilities);
		embeds.push(...traitEmbeds);
	}

	if (monster.actions?.length) {
		const actionEmbeds = createActionEmbeds('Actions', monster.actions);
		embeds.push(...actionEmbeds);
	}

	if (monster.legendary_actions?.length) {
		const legendaryActionEmbeds = createActionEmbeds('Legendary Actions', monster.legendary_actions);
		embeds.push(...legendaryActionEmbeds);
	}

	return embeds;
}