// const fetch = require('node-fetch');
// const usage = require('../replies/usage');
// const {YELLOW, GRAY, BLUE, GREEN} = require('../utils/colors');
// const parseTable = require('../utils/parse-table');
// const {indexify, sluggify} = require('../utils/sluggify');

// const filteredOutProperties = ['_id', 'monk', 'special'];
// const armorCategories = ['Heavy', 'Medium', 'Light']; // for armor-armor, not shields and such
// const placeholderDetail = {name: '\u200B', value: '\u200B', inline: true};

// /**
//  * Formats an item's list of *relevant* properties as a comma-separated string
//  * @param {[{index: String, name: String}]} properties array of property objects an item can have
//  * @returns {String} comma-separated property list
//  */
// function formatProperties(properties) {
// 	return properties
// 		.filter(prop => !filteredOutProperties.includes(prop.index))
// 		.map(prop => prop.name)
// 		.join(', ');
// }

// /**
//  * Fetch a item's complete details and convert it into a Discord Embed object
//  * @param {{name: String, index: String, url: String}} matchedItem reduced item object returned from the API's /equipment endpoint
//  * @returns {{color: Number, title: String, description: String, fields: [{name: String, value: String, inline: Boolean}]}} Discord Embed object to use in the response
//  */
// async function getItemDetails(matchedItem) {
// 	let {index, url} = matchedItem;
// 	if (!url) {
// 		url = `/api/magic-items/${index}`;
// 	}
// 	const item = await fetch(`https://www.dnd5eapi.co${url}`).then(res => res.json());

// 	switch (item.equipment_category.index || item.equipment_category.name.toLowerCase()) {
// 		case 'armor':
// 			return getArmorDetails(item);
// 		case 'weapon':
// 			return getWeaponDetails(item);
// 		case 'wondrous item':
// 		case 'wondrous-items':
// 			return getWondrousItemDetails(item);
// 		default:
// 			return getAdventuringGearDetails(item);
// 	}
// }

// /**
//  * Convert a piece of adventuring gear into a Discord Embed object
//  * @param {{capacity: String, cost: {quantity: Number, unit: String}, equipment_category: {index: String, name: String}, gear_category: {name: String}, name: String, speed: {quantity: Number, unit: String}, tool_category: String, vehicle_category: String, weight: Number}} gear an Adventuring Gear item returned from the 5e API
//  * @returns {{color: Number, title: String, description: String, fields: [{name: String, value: String, inline: Boolean}]}} Discord Embed object to use in the response
//  */
// async function getAdventuringGearDetails(gear) {
// 	let fields = [];
// 	let footer;

// 	if (gear.cost) {
// 		const cost = [];
// 		if (gear.cost.quantity) cost.push(gear.cost.quantity);
// 		if (gear.cost.unit) cost.push(gear.cost.unit);
// 		fields.push({name: 'Cost', value: cost.join(' '), inline: true});
// 	}

// 	if (gear.weight) {
// 		fields.push({name: 'Weight', value: `${gear.weight} lbs`, inline: true});
// 	}

// 	if (gear.speed) {
// 		const speed = [];
// 		if (gear.speed.quantity) speed.push(gear.speed.quantity);
// 		if (gear.speed.unit) speed.push(gear.speed.unit);
// 		fields.push({name: 'Speed', value: speed.join(' '), inline: true});
// 	}

// 	if (gear.capacity) fields.push({name: 'Capacity', value: gear.capacity, inline: true});

// 	let subtitle = 'Adventuring Gear';
// 	if (gear.equipment_category) {
// 		switch(gear.equipment_category.index) {
// 			case 'tools':
// 				subtitle = gear.tool_category || gear.equipment_category.name || subtitle;
// 				break;
// 			case 'adventuring-gear':
// 				subtitle = (gear.gear_category && gear.gear_category.name) || gear.equipment_category.name || subtitle;
// 				break;
// 			case 'mounts-and-vehicles':
// 				subtitle = gear.vehicle_category || gear.equipment_category.name || subtitle;
// 				break;
// 			default:
// 				break;
// 		}
// 	}
	
// 	const desc = [`***${subtitle}***`];

// 	if (Array.isArray(gear.desc)) {
// 		const tableStart = gear.desc.findIndex(line => line.startsWith('|'));

// 		// Contains a Markdown-formatted table
// 		if (tableStart !== -1) {
// 			const descriptionLines = gear.desc.slice(0, tableStart);
// 			const tableLines = gear.desc.slice(tableStart);

// 			if (descriptionLines.length > 1) {
// 				descriptionLines[0] = `***${descriptionLines[0]}***`;
// 			}
// 			desc.push(...descriptionLines);

// 			const parsedTable = parseTable(tableLines);
// 			fields = parsedTable.fields;
// 			footer = parsedTable.footer;
// 		} else {
// 			desc.push(...gear.desc);
// 		}
// 	} else if (gear.desc) {
// 		desc.push(gear.desc);
// 	}
	
// 	if (gear.contents && gear.contents.length) {
// 		const response = await fetch('https://www.dnd5eapi.co/api/equipment/').then(res => res.json());
// 		const allItems = response.results;
// 		const contentsList = gear.contents.map((content) => {
// 			const {name} = allItems.find(item => item.url === content.item_url);
// 			return `${content.quantity}x ${name}`;
// 		});
// 		desc.push(contentsList.join('\n'));
// 	}

// 	const details = {
// 		color: GRAY,
// 		title: gear.name,
// 		description: desc.join('\n\n').substring(0, 2000),
// 		fields,
// 		footer
// 	};
// 	return details;
// }

// /**
//  * Convert a piece of armor or a shield into a Discord Embed object
//  * @param {{armor_category: String, armor_class: {base: Number, dex_bonus: Boolean, max_bonus: Number}, cost: {quantity: Number, unit: String}, name: String, str_minimum: Number, stealth_disadvantage: Boolean, weight: Number}} armor Armor or Shield item returned from the 5e API
//  * @returns {{color: Number, title: String, description: String, fields: [{name: String, value: String, inline: Boolean}]}} Discord Embed object to use in the response
//  */
// function getArmorDetails(armor) {
// 	const fields = [];

// 	if (armor.armor_class && armor.armor_class.base) {
// 		let ac = armor.armor_class.base;
// 		if (armor.armor_category === 'Shield') {
// 			ac = `+${ac}`;
// 		}

// 		if (armor.armor_class.dex_bonus) {
// 			let dexBonus = ' + DEX';
// 			if (armor.armor_class.max_bonus) dexBonus += ` (max +${armor.armor_class.max_bonus})`;
// 			ac += dexBonus;
// 		}
// 		fields.push({name: 'Armor Class', value: ac, inline: true});
// 	}

// 	if (armor.str_minimum) fields.push({name: 'Min Strength', value: armor.str_minimum, inline: true});
// 	if (armor.stealth_disadvantage) fields.push({name: 'Stealth', value: 'Disadvantage', inline: true});

// 	if (armor.cost) {
// 		const cost = [];
// 		if (armor.cost.quantity) cost.push(armor.cost.quantity);
// 		if (armor.cost.unit) cost.push(armor.cost.unit);
// 		fields.push({name: 'Cost', value: cost.join(' '), inline: true});
// 	}

// 	if (armor.weight) {
// 		fields.push({name: 'Weight', value: `${armor.weight} lbs`, inline: true});
// 	}

// 	let desc = '';
// 	if (armor.armor_category) {
// 		desc = armor.armor_category;
// 		if (armorCategories.includes(armor.armor_category)) {
// 			desc += ' Armor';
// 		}
// 	} else if (Array.isArray(armor.desc) && armor.desc.length > 0) {
// 		desc = armor.desc[0];
// 	}
// 	desc = `***${desc}***`;

// 	if (Array.isArray(armor.desc) && armor.desc.length > 1) {
// 		const providedDescription = armor.desc.slice(1).join('\n\n');
// 		desc += `\n\n${providedDescription}`;
// 	}

// 	if (armorCategories.includes(armor.armor_category)) {
// 		desc += '\n\nAnyone can put on a suit of armor or strap a Shield to an arm. Only those proficient in the armor’s use know how to wear it effectively, however. Your class gives you proficiency with certain types of armor. If you wear armor that you lack proficiency with, you have disadvantage on any ability check, saving throw, or Attack roll that involves Strength or Dexterity, and you can’t cast Spells.';
// 	}

// 	if (armor.armor_category === 'Heavy') {
// 		desc += '\n\nHeavier armor interferes with the wearer’s ability to move quickly, stealthily, and freely. If the Armor table shows “Str 13” or “Str 15” in the Strength column for an armor type, the armor reduces the wearer’s speed by 10 feet unless the wearer has a Strength score equal to or higher than the listed score.';
// 	}

// 	if (armor.armor_category === 'Shield') {
// 		desc += '\n\nA Shield is made from wood or metal and is carried in one hand. Wielding a Shield increases your Armor Class by 2. You can benefit from only one Shield at a time.';
// 	}

// 	const details = {
// 		color: BLUE,
// 		title: armor.name,
// 		description: desc,
// 		fields
// 	};

// 	return details;
// }

// /**
//  * Convert a weapon into a Discord Embed object
//  * @param {{
//  * 		'2h_damage': {damage_dice: String, damage_type: {name: String}},
//  *		category_range: String,
//  * 		cost: {quantity: Number, unit: String},
//  * 		damage: {damage_dice: String, damage_type: {name: String}},
//  * 		desc: String[]
//  * 		name: String,
//  * 		properties: {index: String, name: String}[]
//  * 		range: {long: Number, normal: Number},
//  * 		special: String,
//  * 		throw_range: {long: Number, normal: Number},
//  * 		two_handed_damage: {damage_dice: String, damage_type: {name: String}},
//  * 		weight: Number
//  * }} weapon Weapon item returned from the 5e API
//  * @returns {{color: Number, title: String, description: String, fields: [{name: String, value: String, inline: Boolean}]}} Discord Embed object to use in the response
//  */
// function getWeaponDetails(weapon) {
// 	let fields = [];
// 	let footer;

// 	if (weapon.damage) {
// 		const damage = [];
// 		if (weapon.damage.damage_dice) damage.push(weapon.damage.damage_dice);
// 		if (weapon.damage.damage_type && weapon.damage.damage_type.name) {
// 			damage.push(weapon.damage.damage_type.name);
// 		}
// 		fields.push({name: 'Damage', value: damage.join(' '), inline: true});
// 	}

// 	const twoHanded = weapon.two_handed_damage || weapon['2h_damage'];
// 	if (twoHanded) {
// 		const twoHandedDamage = `${twoHanded.damage_dice} ${twoHanded.damage_type.name}`;
// 		fields.push({name: 'Two-Handed Damage', value: twoHandedDamage, inline: true});
// 	}

// 	if (weapon.range) {
// 		let range = `${weapon.range.normal} ft`;
// 		if (weapon.range.long) {
// 			range += `/${weapon.range.long} ft`;
// 		}
// 		fields.push({name: 'Range', value: range, inline: true});

// 		if (weapon.throw_range) {
// 			let thrownRange = `${weapon.throw_range.normal} ft`;
// 			if (weapon.throw_range.long) {
// 				thrownRange += `/${weapon.throw_range.long} ft`;
// 			}
// 			if (thrownRange !== range) fields.push({name: 'Throw Range', value: thrownRange, inline: true});
// 		}
// 	}


// 	if (weapon.cost) {
// 		const cost = `${weapon.cost.quantity} ${weapon.cost.unit}`;
// 		fields.push({name: 'Cost', value: cost, inline: true});
// 	}

// 	if (weapon.weight) {
// 		fields.push({name: 'Weight', value: `${weapon.weight} lbs`, inline: true});
// 	}

// 	if (weapon.properties && weapon.properties.length) {
// 		const formatted = formatProperties(weapon.properties);
// 		if (formatted) fields.push({name: 'Properties', value: formatted, inline: true});
// 	}

// 	const desc = [];
// 	if (weapon.category_range) {
// 		desc.push(`${weapon.category_range} Weapon`);
// 	}

// 	const providedDescription = weapon.special || weapon.desc;
// 	if (Array.isArray(providedDescription)) {
// 		const tableStart = providedDescription.findIndex(line => line.startsWith('|'));

// 		// Contains a Markdown-formatted table
// 		if (tableStart !== -1) {
// 			const descriptionLines = providedDescription.slice(0, tableStart);
// 			const tableLines = providedDescription.slice(tableStart);

// 			if (descriptionLines.length > 1) {
// 				descriptionLines[0] = `***${descriptionLines[0]}***`;
// 			}
// 			desc.push(...descriptionLines);

// 			const parsedTable = parseTable(tableLines);
// 			fields = parsedTable.fields;
// 			footer = parsedTable.footer;
// 		} else {
// 			desc.push(...providedDescription);
// 		}
// 	} else if (providedDescription) {
// 		desc.push(providedDescription);
// 	}

// 	if (desc[0]) {
// 		desc[0] = `***${desc[0]}***`;
// 	}

// 	const description = desc.length ?
// 		desc.join('\n\n').substring(0, 2000) :
// 		undefined;

// 	const details = {
// 		color: YELLOW,
// 		title: weapon.name,
// 		description,
// 		fields,
// 		footer
// 	};
// 	return details;
// }

// /**
//  * Convert a wondrous item into a Discord Embed object
//  * @param {{
//  * 		desc: [String],
//  * 		name: String
//  * }} wondrousItem Wondrous item returned from the 5e API
//  * @returns {{color: Number, title: String, description: String, fields: [{name: String, value: String, inline: Boolean}]}} Discord Embed object to use in the response
//  */
// async function getWondrousItemDetails(wondrousItem) {
// 	let description = '';
// 	let fields = [];
// 	let footer = '';

// 	if (wondrousItem.desc && typeof wondrousItem.desc === 'string') {
// 		description = wondrousItem.desc;
// 	} else if (wondrousItem.desc && Array.isArray(wondrousItem.desc)) {
// 		const tableStart = wondrousItem.desc.findIndex(line => line.startsWith('|'));

// 		// Contains a Markdown-formatted table
// 		if (tableStart !== -1) {
// 			const descriptionLines = wondrousItem.desc.slice(0, tableStart);
// 			const tableLines = wondrousItem.desc.slice(tableStart);

// 			if (descriptionLines.length > 1) {
// 				descriptionLines[0] = `***${descriptionLines[0]}***`;
// 			}
// 			description = descriptionLines.join('\n\n');

// 			const parsedTable = parseTable(tableLines);
// 			fields = parsedTable.fields;
// 			footer = parsedTable.footer;
// 		} else {
// 			if (wondrousItem.desc.length > 1 && wondrousItem.desc[0].startsWith('Wondrous')) {
// 				wondrousItem.desc[0] = `***${wondrousItem.desc[0]}***`;
// 			}
// 			description = wondrousItem.desc.join('\n\n');
// 		}
// 	}

// 	const details = {
// 		color: GREEN,
// 		title: wondrousItem.name,
// 		description
// 	};

// 	if (fields.length > 0) {
// 		details.fields = fields;
// 	}

// 	if (footer.length > 0) {
// 		details.footer = footer;
// 	}

// 	return details;

// }

// module.exports = {
// 	name: 'item',
// 	description: 'Find armor, weaponry, or other equipment.',
// 	async execute(message, args) {
// 		if (!args || args.length === 0) {
// 			usage(message, 'item', '!item <partial or full item name>');
// 			return;
// 		}

// 		const fullName = args.join(' ');
// 		const query = sluggify(args);

// 		const standardItems = await fetch(`https://www.dnd5eapi.co/api/equipment?name=${query}`).then(res => res.json());
// 		const magicItems = await fetch(`https://www.dnd5eapi.co/api/magic-items?name=${query}`).then(res => res.json());
// 		const items = {
// 			count: standardItems.count + magicItems.count,
// 			results: [...standardItems.results, ...magicItems.results]
// 		};

// 		const index = indexify(args);
// 		const exactMatch = items.count > 0 && items.results.find(item => item.index === index);

// 		if (items.count === 0) {
// 			message.reply(`I couldn't find any items called _${fullName}_. Try again with a shorter query`);
// 		} else if (exactMatch) {
// 			const itemDetails = await getItemDetails(exactMatch);
			
// 			if (itemDetails.footer) {
// 				itemDetails.footer = {text: itemDetails.footer};
// 			} else if (items.count > 1) {
// 				const alternatives = items.results
// 					.filter(item => item.index !== index)
// 					.map(alt => `* ${alt.name}`)
// 					.join('\n');

// 				itemDetails.footer = {text: `---\nI also found:\n${alternatives}`};
// 			}

// 			if (itemDetails.fields && itemDetails.fields.length % 3 === 2) {
// 				itemDetails.fields.push(placeholderDetail);
// 			}

// 			message.channel.send({embed: itemDetails});
// 		} else if (items.count === 1) {
// 			const bestGuess = items.results[0];
// 			const itemDetails = await getItemDetails(bestGuess);

// 			if (itemDetails.footer) {
// 				itemDetails.footer = {text: itemDetails.footer};
// 			} else {
// 				itemDetails.footer = {text: '---\nThis was my best guess! Feel free to search again!'};
// 			}

// 			if (itemDetails.fields.length % 3 === 2) {
// 				itemDetails.fields.push(placeholderDetail);
// 			}

// 			message.channel.send({embed: itemDetails});
// 		} else {
// 			const alternatives = items.results.map(alt => `* ${alt.name}`);
// 			message.reply(`I couldn't find _${fullName}_. Did you mean one of these items?\n\n${alternatives.join('\n')}`);
// 		}
// 	}
// };