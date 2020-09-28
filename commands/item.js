const fetch = require('node-fetch');
const usage = require('../replies/usage');
const {YELLOW, GRAY} = require('../utils/colors');
const {indexify, sluggify} = require('../utils/sluggify');

const filteredOutProperties = ['monk', 'special'];

function formatProperties(properties) {
	return properties
		.filter(prop => !filteredOutProperties.includes(prop.index))
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

async function getAdventuringGearDetails(gear) {
	const fields = [];

	if (gear.cost) {
		const cost = [];
		if (gear.cost.quantity) cost.push(gear.cost.quantity);
		if (gear.cost.unit) cost.push(gear.cost.unit);
		fields.push({name: 'Cost', value: cost.join(' '), inline: true});
	}

	if (gear.weight) {
		fields.push({name: 'Weight', value: `${gear.weight} lbs`, inline: true});
	}

	let subtitle = 'Adventuring Gear';
	if (gear.equipment_category) {
		switch(gear.equipment_category.index) {
			case 'tools':
				subtitle = gear.tool_category || gear.equipment_category.name || subtitle;
				break;
			case 'adventuring-gear':
				subtitle = (gear.gear_category && gear.gear_category.name) || gear.equipment_category.name || subtitle;
				break;
			default:
				break;
		}
	}
	let desc = `***${subtitle}***`;

	if (gear.desc) {
		const description = Array.isArray(gear.desc) ?
			gear.desc.join('\n\n') :
			gear.desc;

		desc += `\n\n${description}`;
	}

	if (gear.contents && gear.contents.length) {
		const response = await fetch('https://www.dnd5eapi.co/api/equipment/').then(res => res.json());
		const allItems = response.results;
		const contentsList = gear.contents.map((content) => {
			const {name} = allItems.find(item => item.url === content.item_url);
			return `${content.quantity}x ${name}`;
		});
		desc += `\n\n${contentsList.join('\n')}`;
	}

	const details = {
		color: GRAY,
		title: gear.name,
		description: desc,
		fields
	};
	return details;
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

	if (weapon.properties && weapon.properties.length) {
		const formatted = formatProperties(weapon.properties);
		if (formatted) fields.push({name: 'Properties', value: formatted, inline: true});
	}

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