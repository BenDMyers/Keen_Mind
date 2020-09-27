const fetch = require('node-fetch');
const ordinal = require('../utils/ordinals');
const {indexify, sluggify} = require('../utils/sluggify');
const {PURPLE} = require('../utils/colors');

/**
 * Unabbreviates spell component requirements
 * @param {[String]} components An array of any and all of ['V', 'S', 'M']
 * @returns an expanded, formatted list of spell component requirements
 */
function formatComponents(components) {
	const fullNames = [];
	if (components.includes('V')) fullNames.push('Verbal');
	if (components.includes('S')) fullNames.push('Somatic');
	if (components.includes('M')) fullNames.push('Material');

	return fullNames.join(', ');
}

async function getSpellDetails(matchedSpell) {
	const {url} = matchedSpell;
	const spell = await fetch(`https://www.dnd5eapi.co${url}`).then(res => res.json());

	const fields = [];
	if (spell.casting_time) fields.push({name: 'Casting Time', value: spell.casting_time, inline: true});
	if (spell.range) fields.push({name: 'Range', value: spell.range, inline: true});
	if (spell.components) fields.push({name: 'Components', value: formatComponents(spell.components), inline: true});
	if (spell.duration) fields.push({name: 'Duration', value: spell.duration, inline: true});
	if (spell.damage) {
		const damageDice = spell.damage.damage_at_slot_level[spell.level];
		const damageType = spell.damage.damage_type.name;
		fields.push({name: 'Damage', value: `${damageDice} ${damageType}`, inline: true});
	}
	if (spell.area_of_effect) {
		const {type, size} = spell.area_of_effect;
		fields.push({name: 'Area of Effect', value: `${size}-ft. ${type}`, inline: true});
	}
	if (spell.higher_level) fields.push({name: 'At Higher Levels', value: spell.higher_level});

	const subtitle = `***${ordinal(spell.level)} level ${spell.school.name}***`;
	const spellDescription = Array.isArray(spell.desc) ? spell.desc.join('\n\n') : spell.desc;
	let embedDescription = `${subtitle}\n\n${spellDescription}`;
	if (embedDescription.length > 2048) {
		embedDescription = embedDescription.substr(0, 2045) + '…';
	}

	const details = {
		color: PURPLE,
		title: spell.name,
		description: embedDescription,
		fields
	};

	return details;
}

module.exports = {
	name: 'spell',
	description: 'Find a spell!',
	async execute(message, args) {
		const fullName = args.join(' ');
		const query = sluggify(args);
		const spells = await fetch(`https://www.dnd5eapi.co/api/spells?name=${query}`)
			.then(res => res.json());

		const index = indexify(args);
		const exactMatch = spells.count > 0 && spells.results.find(spell => spell.index === index);

		if (spells.count === 0) {
			message.reply(`I couldn't find any spells called _${fullName}_. Try again with a shorter query`);
		} else if (exactMatch) {
			const spellDetails = await getSpellDetails(exactMatch);
			if (spells.count > 1) {
				const alternatives = spells.results
					.filter(spell => spell.index !== index)
					.map(alt => `* ${alt.name}`)
					.join('\n');

				spellDetails.footer = {text: `---\nI also found:\n${alternatives}`};
			}

			message.channel.send({embed: spellDetails});
		} else if (spells.count === 1) {
			const bestGuess = spells.results[0];
			const spellDetails = await getSpellDetails(bestGuess);
			spellDetails.footer = {text: '---\nThis was my best guess! Feel free to search again!'};

			message.channel.send({embed: spellDetails});
		} else {
			const alternatives = spells.results.map(alt => `* ${alt.name}`);
			message.reply(`I couldn't find _${fullName}_. Did you mean one of these spells?\n\n${alternatives.join('\n')}`);
		}
	}
};