const fetch = require('node-fetch');
const usage = require('../replies/usage');
const {YELLOW, GRAY, BLUE} = require('../utils/colors');
const {indexify, sluggify} = require('../utils/sluggify');

const filteredOutProperties = ['monk', 'special'];
const armorCategories = ['Heavy', 'Medium', 'Light']; // for armor-armor, not shields and such
const placeholderDetail = {name: '\u200B', value: '\u200B', inline: true};

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

	if (gear.speed) {
		const speed = [];
		if (gear.speed.quantity) speed.push(gear.speed.quantity);
		if (gear.speed.unit) speed.push(gear.speed.unit);
		fields.push({name: 'Speed', value: speed.join(' '), inline: true});
	}

	if (gear.capacity) fields.push({name: 'Capacity', value: gear.capacity, inline: true});

	let subtitle = 'Adventuring Gear';
	if (gear.equipment_category) {
		switch(gear.equipment_category.index) {
			case 'tools':
				subtitle = gear.tool_category || gear.equipment_category.name || subtitle;
				break;
			case 'adventuring-gear':
				subtitle = (gear.gear_category && gear.gear_category.name) || gear.equipment_category.name || subtitle;
				break;
			case 'mounts-and-vehicles':
				subtitle = gear.vehicle_category || gear.equipment_category.name || subtitle;
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
	const fields = [];

	if (armor.armor_class && armor.armor_class.base) {
		let ac = armor.armor_class.base;
		if (armor.armor_category === 'Shield') {
			ac = `+${ac}`;
		}

		if (armor.armor_class.dex_bonus) {
			let dexBonus = ' + DEX';
			if (armor.armor_class.max_bonus) dexBonus += ` (max +${armor.armor_class.max_bonus})`;
			ac += dexBonus;
		}
		fields.push({name: 'Armor Class', value: ac, inline: true});
	}

	if (armor.str_minimum) fields.push({name: 'Min Strength', value: armor.str_minimum, inline: true});
	if (armor.stealth_disadvantage) fields.push({name: 'Stealth', value: 'Disadvantage', inline: true});

	if (armor.cost) {
		const cost = [];
		if (armor.cost.quantity) cost.push(armor.cost.quantity);
		if (armor.cost.unit) cost.push(armor.cost.unit);
		fields.push({name: 'Cost', value: cost.join(' '), inline: true});
	}

	if (armor.weight) {
		fields.push({name: 'Weight', value: `${armor.weight} lbs`, inline: true});
	}

	let desc = armor.armor_category;
	if (armorCategories.includes(armor.armor_category)) {
		desc += ' Armor';
	}
	desc = `***${desc}***`;

	if (armorCategories.includes(armor.armor_category)) {
		desc += '\n\nAnyone can put on a suit of armor or strap a Shield to an arm. Only those proficient in the armor’s use know how to wear it effectively, however. Your class gives you proficiency with certain types of armor. If you wear armor that you lack proficiency with, you have disadvantage on any ability check, saving throw, or Attack roll that involves Strength or Dexterity, and you can’t cast Spells.';
	}

	if (armor.armor_category === 'Heavy') {
		desc += '\n\nHeavier armor interferes with the wearer’s ability to move quickly, stealthily, and freely. If the Armor table shows “Str 13” or “Str 15” in the Strength column for an armor type, the armor reduces the wearer’s speed by 10 feet unless the wearer has a Strength score equal to or higher than the listed score.';
	}

	if (armor.armor_category === 'Shield') {
		desc += '\n\nA Shield is made from wood or metal and is carried in one hand. Wielding a Shield increases your Armor Class by 2. You can benefit from only one Shield at a time.';
	}

	const details = {
		color: BLUE,
		title: armor.name,
		description: desc,
		fields
	};

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

			if (itemDetails.fields.length % 3 === 2) {
				itemDetails.fields.push(placeholderDetail);
			}

			message.channel.send({embed: itemDetails});
		} else if (items.count === 1) {
			const bestGuess = items.results[0];
			const itemDetails = await getItemDetails(bestGuess);
			itemDetails.footer = {text: '---\nThis was my best guess! Feel free to search again!'};

			if (itemDetails.fields.length % 3 === 2) {
				itemDetails.fields.push(placeholderDetail);
			}

			message.channel.send({embed: itemDetails});
		} else {
			const alternatives = items.results.map(alt => `* ${alt.name}`);
			message.reply(`I couldn't find _${fullName}_. Did you mean one of these items?\n\n${alternatives.join('\n')}`);
		}
	}
};