const fetch = require('node-fetch');
const usage = require('../replies/usage');
const {YELLOW} = require('../utils/colors');
const {indexify, sluggify} = require('../utils/sluggify');

function formatProperties(properties) {
	return properties
		.filter(prop => prop.index !== 'monk')
		.map(prop => prop.name)
		.join(', ');
}

async function getItemDetails(matchedItem) {
	const {url} = matchedItem;
	const item = await fetch(`https://www.dnd5eapi.co${url}`).then(res => res.json());

	switch (item.equipment_category.index) {
		case 'armor':
			return getArmorDetails(item);
		case 'weapon':
			return getWeaponDetails(item);
		default:
			return getAdventuringGearDetails(item);
	}
}

function getAdventuringGearDetails(gear) {
	const embed = {};
	return embed;
}

function getArmorDetails(armor) {
	const details = {};
	return details;
}

function getWeaponDetails(weapon) {
	const fields = [];

	if (weapon.damage) {
		const damage = [];
		if (weapon.damage.damage_dice) damage.push(weapon.damage.damage_dice);
		if (weapon.damage.damage_type && weapon.damage.damage_type.name) {
			damage.push(weapon.damage.damage_type.name);
		}
		fields.push({name: 'Damage', value: damage.join(' '), inline: true});
	}

	if (weapon['2h_damage']) {
		const twoHandedDamage = `${weapon['2h_damage'].damage_dice} ${weapon['2h_damage'].damage_type.name}`;
		fields.push({name: 'Two-Handed Damage', value: twoHandedDamage, inline: true});
	}

	let range = `${weapon.range.normal} ft`;
	if (weapon.range.long) {
		range += `/${weapon.range.long} ft`;
	}
	fields.push({name: 'Range', value: range, inline: true});

	if (weapon.throw_range) {
		let thrownRange = `${weapon.throw_range.normal} ft`;
		if (weapon.throw_range.long) {
			thrownRange += `/${weapon.throw_range.long} ft`;
		}
		if (thrownRange !== range) fields.push({name: 'Throw Range', value: thrownRange, inline: true});
	}

	if (weapon.cost) {
		const cost = `${weapon.cost.quantity} ${weapon.cost.unit}`;
		fields.push({name: 'Cost', value: cost, inline: true});
	}

	if (weapon.weight) {
		fields.push({name: 'Weight', value: `${weapon.weight} lbs`, inline: true});
	}

	fields.push({name: 'Properties', value: formatProperties(weapon.properties), inline: true});

	let desc = `***${weapon.category_range} Weapon***`;
	if (weapon.special) {
		let specialDescription = Array.isArray(weapon.special) ?
			weapon.special.join('\n\n') :
			weapon.special;
		if (specialDescription.length > 2000) {
			specialDescription = specialDescription.substr(0, 2000) + '…';
		}
		desc += `\n\n${specialDescription}`;
	}

	const details = {
		color: YELLOW,
		title: weapon.name,
		description: desc,
		fields
	};
	return details;
}

module.exports = {
	name: 'item',
	description: 'Find armor, weaponry, or other equipment.',
	async execute(message, args) {
		if (!args || args.length === 0) {
			usage(message, 'item', '!item <partial or full item name>');
			return;
		}

		const fullName = args.join(' ');
		const query = sluggify(args);
		const items = await fetch(`https://www.dnd5eapi.co/api/equipment?name=${query}`)
			.then(res => res.json());

		const index = indexify(args);
		const exactMatch = items.count > 0 && items.results.find(item => item.index === index);

		console.log({items, exactMatch});

		if (items.count === 0) {
			message.reply(`I couldn't find any items called _${fullName}_. Try again with a shorter query`);
		} else if (exactMatch) {
			const itemDetails = await getItemDetails(exactMatch);
			if (items.count > 1) {
				const alternatives = items.results
					.filter(item => item.index !== index)
					.map(alt => `* ${alt.name}`)
					.join('\n');

				itemDetails.footer = {text: `---\nI also found:\n${alternatives}`};
			}

			message.channel.send({embed: itemDetails});
		} else if (items.count === 1) {
			const bestGuess = items.results[0];
			const itemDetails = await getItemDetails(bestGuess);
			itemDetails.footer = {text: '---\nThis was my best guess! Feel free to search again!'};

			message.channel.send({embed: itemDetails});
		} else {
			const alternatives = items.results.map(alt => `* ${alt.name}`);
			message.reply(`I couldn't find _${fullName}_. Did you mean one of these items?\n\n${alternatives.join('\n')}`);
		}
	}
};