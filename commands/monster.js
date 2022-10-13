// const fetch = require('node-fetch');
// const reactToMonsters = require('../replies/react-to-monster');
// const usage = require('../replies/usage');
// const getAbilityScoreModifier = require('../utils/ability-score-modifiers');
// const {RED} = require('../utils/colors');
// const {formatFraction, formatNumberWithCommas} = require('../utils/format-numbers');
// const formatObjectAsCsv = require('../utils/format-object-as-csv');
// const {indexify, sluggify} = require('../utils/sluggify');
// const toTitleCase = require('../utils/to-title-case');

// /**
//  * @param {Number} score raw ability score
//  * @returns {String} formatted ability score with modifier
//  */
// function formatAbilityScore(score) {
// 	return `**${score}** *(${getAbilityScoreModifier(score)})*`;
// }

// /**
//  * Converts a monster's raw ability scores to a list of Discord Embed fields with modifiers
//  * @param {Monster} monster queried monster
//  * @returns {{name: String, value: String, inline: Boolean}[]} Discord Embed field objects
//  */
// function listAbilityScores(monster) {
// 	const {strength, dexterity, constitution, intelligence, wisdom, charisma} = monster;

// 	const abilityScores = [
// 		{name: 'STR', value: formatAbilityScore(strength), inline: true},
// 		{name: 'DEX', value: formatAbilityScore(dexterity), inline: true},
// 		{name: 'CON', value: formatAbilityScore(constitution), inline: true},
// 		{name: 'INT', value: formatAbilityScore(intelligence), inline: true},
// 		{name: 'WIS', value: formatAbilityScore(wisdom), inline: true},
// 		{name: 'CHA', value: formatAbilityScore(charisma), inline: true},
// 	];

// 	return abilityScores;
// }

// /**
//  * Formats speeds as a comma-separated list. Walk speed is unlabelled, but the other kinds of speeds are labelled.
//  * @param {{climb: String, fly: String, swim: String, walk: String}} speed
//  * @returns {string} comma-separated list of speeds
//  */
// function formatSpeed(speed) {
// 	const {walk, ...otherSpeeds} = speed;
// 	const formattedOtherSpeeds = formatObjectAsCsv(otherSpeeds);

// 	return formattedOtherSpeeds ?
// 		`${walk}, ${formattedOtherSpeeds}` :
// 		walk;
// }

// /**
//  * Formats proficiencies as a comma-separated list
//  * @param {Proficiency[]} proficiencies list of the monster's proficiencies
//  * @returns {String} comma-separated list of saving throw and/or skill proficiencies
//  */
// function formatProficiencies(proficiencies) {
// 	return proficiencies
// 		.map(p => {
// 			const name = p.proficiency.name.replace(/.*:\s*/g, '');
// 			const bonus = p.value >= 0 ? `+${p.value}` : p.value;
// 			return `${name} ${bonus}`;
// 		})
// 		.join(', ');
// }

// /**
//  * Convert a monster into a Discord Embed object
//  * @param {{name: String, index: String, url: String}} matchedMonster Monster ref returned from the 5e API
//  * @returns {{
//  * 		color: Number,
//  * 		title: String,
//  * 		description: String,
//  * 		fields: {name: String, value: String, inline: Boolean}[] | undefined,
//  * 		followups: {color: Number, title: String, description: String}[] | undefined
//  * }} Discord Embed object, with some optional followup messages
//  */
// async function getMonsterDetails(matchedMonster) {
// 	/** @type {Monster} */
// 	const monster = await fetch(`https://www.dnd5eapi.co${matchedMonster.url}`).then(res => res.json());
// 	const followups = [];

// 	const savingThrowProficiencies = monster.proficiencies && monster.proficiencies.length > 0 && monster.proficiencies.filter(p => p.proficiency.name.startsWith('Saving Throw: '));
// 	const skillProficiencies = monster.proficiencies && monster.proficiencies.length > 0 && monster.proficiencies.filter(p => p.proficiency.name.startsWith('Skill: '));

// 	/** @type {string[]} */
// 	const desc = [];

// 	// Subtitle
// 	let subtitle = `${monster.size} ${monster.type}`;
// 	if (monster.subtype) subtitle += ` (${monster.subtype})`;
// 	if (monster.alignment) subtitle += `, ${monster.alignment}`;
// 	desc.push(`***${subtitle}***\n`);

// 	// Basic details
// 	if (monster.armor_class) {
// 		desc.push(`**Armor Class** ${monster.armor_class}`);
// 	}
// 	if (monster.hit_points) {
// 		desc.push(`**Hit Points** ${monster.hit_points} *(${monster.hit_dice})*`);
// 	}
// 	if (monster.speed) {
// 		desc.push(`**Speed** ${formatSpeed(monster.speed)}`);
// 	}
// 	desc.push('');

// 	// More details
// 	if (savingThrowProficiencies && savingThrowProficiencies.length > 0) {
// 		desc.push(`**Saving Throws** ${formatProficiencies(savingThrowProficiencies)}`);
// 	}
// 	if (skillProficiencies && skillProficiencies.length > 0) {
// 		desc.push(`**Skills** ${formatProficiencies(skillProficiencies)}`);
// 	}
// 	if (monster.damage_vulnerabilities && monster.damage_vulnerabilities.length > 0) {
// 		const containsCommas = monster.damage_vulnerabilities.some(v => v.includes(','));
// 		const delimiter = containsCommas ? '; ' : ', ';
// 		desc.push(`**Vulnerabilities** ${monster.damage_vulnerabilities.map(toTitleCase).join(delimiter)}`);
// 	}
// 	if (monster.damage_resistances && monster.damage_resistances.length > 0) {
// 		const containsCommas = monster.damage_resistances.some(r => r.includes(','));
// 		const delimiter = containsCommas ? '; ' : ', ';
// 		desc.push(`**Damage Resistance** ${monster.damage_resistances.map(toTitleCase).join(delimiter)}`);
// 	}
// 	if (monster.damage_immunities && monster.damage_immunities.length > 0) {
// 		const containsCommas = monster.damage_immunities.some(i => i.includes(','));
// 		const delimiter = containsCommas ? '; ' : ', ';
// 		desc.push(`**Damage Immunities** ${monster.damage_immunities.map(toTitleCase).join(delimiter)}`);
// 	}
// 	if (monster.condition_immunities && monster.condition_immunities.length > 0) {
// 		desc.push(`**Condition Immunities** ${monster.condition_immunities.map(i => toTitleCase(i.name)).join(', ')}`);
// 	}
// 	if (monster.senses && Object.keys(monster.senses).length > 0) {
// 		desc.push(`**Senses** ${formatObjectAsCsv(monster.senses)}`);
// 	}
// 	if (monster.languages) {
// 		desc.push(`**Languages** ${monster.languages}`);
// 	}
// 	if (typeof monster.challenge_rating === 'number') {
// 		let rating = formatFraction(monster.challenge_rating);
// 		if (monster.xp) {
// 			rating += ` (${formatNumberWithCommas(monster.xp)} XP)`;
// 		}
// 		desc.push(`**Challenge** ${rating}`);
// 	}
// 	desc.push('');

// 	// Traits
// 	if (monster.special_abilities && Array.isArray(monster.special_abilities)) {
// 		followups.push({title: 'Traits', description: ''});
// 		for (const specialAbility of monster.special_abilities) {
// 			let traitUsage = '';
// 			if (specialAbility.usage && specialAbility.usage.times) {
// 				traitUsage = ` *(${specialAbility.usage.times} ${specialAbility.usage.type})*`;
// 			} else if (specialAbility.usage) {
// 				traitUsage = ` *(${specialAbility.usage.type})*`;
// 			}
// 			const traitDescription = `**${specialAbility.name}${traitUsage}.** ${specialAbility.desc.replace('\n\n', '\n')}\n\n`;
// 			const currentEmbed = followups[followups.length - 1];
// 			if (currentEmbed.description.length + traitDescription.length > 2048) {
// 				followups.push({description: traitDescription});
// 			} else {
// 				currentEmbed.description += traitDescription;
// 			}
// 		}
// 	}

// 	if (monster.actions && monster.actions.length > 0) {
// 		followups.push({title: 'Actions', description: ''});
// 		for (const action of monster.actions) {
// 			const actionDescription = `**${action.name}.** ${action.desc}\n\n`;
// 			const currentEmbed = followups[followups.length - 1];
// 			if (currentEmbed.description.length + actionDescription.length > 2048) {
// 				followups.push({description: actionDescription});
// 			} else {
// 				currentEmbed.description += actionDescription;
// 			}
// 		}
// 	}

// 	if (monster.legendary_actions && monster.legendary_actions.length > 0) {
// 		followups.push({title: 'Legendary Actions', description: ''});
// 		for (const action of monster.legendary_actions) {
// 			const actionDescription = `**${action.name}.** ${action.desc}\n\n`;
// 			const currentEmbed = followups[followups.length - 1];
// 			if (currentEmbed.description.length + actionDescription.length > 2048) {
// 				followups.push({description: actionDescription});
// 			} else {
// 				currentEmbed.description += actionDescription;
// 			}
// 		}
// 	}

// 	return {
// 		color: RED,
// 		title: monster.name,
// 		description: desc.join('\n').substring(0, 2045),
// 		fields: monster.strength ? listAbilityScores(monster) : undefined,
// 		followups
// 	};
// }

// module.exports = {
// 	name: 'monster',
// 	description: 'Find a monster!',
// 	async execute(message, args) {
// 		if (!args || args.length === 0) {
// 			usage(message, 'monster', '!monster <partial or full monster name>');
// 			return;
// 		}

// 		const fullName = args.join(' ');
// 		const query = sluggify(args);

// 		/** @type {{count: number, results: {index: string, name: string, url: string}[]}} */
// 		const monsters = await fetch(`https://www.dnd5eapi.co/api/monsters?name=${query}`).then(res => res.json());
// 		const index = indexify(args);
// 		const exactMatch = monsters.count > 0 && monsters.results.find(monster => monster.index === index);

// 		if (monsters.count === 0) {
// 			message.reply(`I couldn't find any monsters called _${fullName}_. Try again with a shorter query.`);
// 		} else if (exactMatch) {
// 			const {followups, ...monsterDetails} = await getMonsterDetails(exactMatch);
// 			if (monsters.count > 1) {
// 				const alternatives = monsters.results
// 					.filter(monster => monster.index !== index)
// 					.map(alt => `* ${alt.name}`)
// 					.join('\n');

// 				monsterDetails.footer = {text: `---\nI also found:\n${alternatives}`};
// 			}
// 			const reply = await message.channel.send({embed: monsterDetails});
// 			reactToMonsters(reply, monsterDetails);
// 			followups && followups.forEach(async (followup) => await message.channel.send({embed: followup}));
// 		} else if (monsters.count === 1) {
// 			const bestGuess = monsters.results[0];
// 			const {followups, ...monsterDetails} = await getMonsterDetails(bestGuess);
// 			monsterDetails.footer = {text: '---\nThis was my best guess! Feel free to search again!'};
// 			const reply = await message.channel.send({embed: monsterDetails});
// 			reactToMonsters(reply, monsterDetails);
// 			followups && followups.forEach(async (followup) => await message.channel.send({embed: followup}));
// 		} else {
// 			const alternatives = monsters.results.map(alt => `* ${alt.name}`);
// 			message.reply(`I couldn't find _${fullName}_. Did you mean one of these monsters?\n\n${alternatives.join('\n')}`);
// 		}
// 	}
// };

// /**
//  * @typedef {{
//  * 		attack_bonus: Number,
//  * 		damage: {
//  * 			damage_dice: String,
//  * 			damage_type: {index: String, name: String, url: String}
//  * 		}[]
//  * 		desc: String,
//  * 		name: String,
//  * 		options: {
//  * 			choose: Number,
//  * 			from: {count: Number, name: String, type: String}[][]
//  * 		},
//  * 		usage: {
//  * 			times: Number,
//  * 			type: String
//  * 		}
//  * }} Action
//  */

// /**
//  * @typedef {'acid' | 'bludgeoning' | 'cold' | 'fire' | 'force' | 'lightning' | 'necrotic' | 'piercing' | 'poison' | 'psychic' | 'radiant' | 'slashing' | 'thunder'} DamageType
//  */

// /**
//  * @typedef {{
//  * 		proficiency: {index: String, name: String, url: String},
//  * 		value: Number
//  * }} Proficiency
//  */

// /**
//  * @typedef {{
//  * 		desc: String,
//  * 		name: String,
//  *		spellcasting: {
//  *			ability: {index: String, name: String, url: String},
//  *			components_required: string[],
//  *			dc: Number,
//  *			spells: Spell[]
//  * 		},
//  * 		usage: {
//  * 			times: Number,
//  * 			type: String
//  * 		}
//  * }} SpecialAbility
//  */

// /**
//  * @typedef {{
//  * 		level: Number,
//  * 		name: String,
//  * 		url: String,
//  * 		usage: {
//  * 			times: Number,
//  * 			type: String
//  * 		}
//  * }} Spell
//  */

// /**
//  * @typedef {{
//  * 		actions: Action[],
//  * 		alignment: String,
//  * 		armor_class: Number,
//  * 		challenge_rating: Number,
//  * 		charisma: Number,
//  * 		condition_immunities: {name: string, index: string, url: string}[],
//  * 		constitution: Number,
//  * 		damage_immunities: DamageType[],
//  * 		damage_resistances: DamageType[],
//  * 		damage_vulnerabilities: DamageType[],
//  * 		dexterity: Number,
//  * 		hit_dice: String,
//  * 		hit_points: Number,
//  * 		index: String,
//  * 		intelligence: Number,
//  * 		languages: String,
//  * 		legendary_actions: Action[],
//  * 		name: String,
//  * 		proficiencies: Proficiency[],
//  * 		senses: Object,
//  * 		size: 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan',
//  * 		special_abilities: SpecialAbility[],
//  * 		speed: {
//  * 			climb: String | undefined,
//  * 			fly: String | undefined,
//  * 			walk: String | undefined
//  * 		},
//  * 		strength: Number,
//  * 		subtype: String | null
//  * 		type: String,
//  * 		url: String,
//  * 		wisdom: Number,
//  * 		xp: Number
//  * }} Monster
//  */