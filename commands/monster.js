const fetch = require('node-fetch');
const usage = require('../replies/usage');
const getAbilityScoreModifier = require('../utils/ability-score-modifiers');
const {indexify, sluggify} = require('../utils/sluggify');

/**
 * Converts raw ability scores to a list with names and modifiers
 * @param {Monster} stats JSON object representing monster's stats
 * @returns {string}
 */
function listAbilityScores(stats) {
	
}

/**
 * Convert a monster into a Discord Embed object
 * @param {Monster} monster Monster stats returned from the 5e API
 * @returns {{
 * 		color: Number,
 * 		title: String,
 * 		description: String,
 * 		fields: {name: String, value: String, inline: Boolean}[]
 * }} Discord Embed object
 */
async function getMonsterDetails(monster) {

}

module.exports = {
	name: 'monster',
	description: 'Find a monster!',
	async execute(message, args) {
		if (!args || args.length === 0) {
			usage(message, 'monster', '!monster <partial or full monster name>');
			return;
		}

		const fullName = args.join(' ');
		const query = sluggify(args);

		/** @type {{count: number, results: {index: string, name: string, url: string}[]}} */
		const monsters = await fetch(`https://www.dnd5eapi.co/api/monsters?name=${query}`).then(res => res.json());
		const index = indexify(args);
		const exactMatch = monsters.count > 0 && monsters.results.find(monster => monster.index === index);

		if (monsters.count === 0) {
			message.reply(`I couldn't find any monsters called _${fullName}_. Try again with a shorter query.`);
		} else if (exactMatch) {
			const monsterDetails = await getMonsterDetails(exactMatch);
			if (monsters.count > 1) {
				const alternatives = monsters.results
					.filter(monster => monster.index !== index)
					.map(alt => `* ${alt.name}`)
					.join('\n');

				monsterDetails.footer = {text: `---\nI also found:\n${alternatives}`};
			}
			message.channel.send({embed: monsterDetails});
		} else if (monsters.count === 1) {
			const bestGuess = monsters.results[0];
			const monsterDetails = await getMonsterDetails(bestGuess);
			monsterDetails.footer = {text: '---\nThis was my best guess! Feel free to search again!'};
			message.channel.send({embed: monsterDetails});
		} else {
			const alternatives = monsters.results.map(alt => `* ${alt.name}`);
			message.reply(`I couldn't find _${fullName}_. Did you mean one of these monsters?\n\n${alternatives.join('\n')}`);
		}
	}
};

/**
 * @typedef {{
 * 		attack_bonus: Number,
 * 		damage: {
 * 			damage_dice: String,
 * 			damage_type: {index: String, name: String, url: String}
 * 		}[]
 * 		desc: String,
 * 		name: String
 * }} Action
 */

/**
 * @typedef {'acid' | 'bludgeoning' | 'cold' | 'fire' | 'force' | 'lightning' | 'necrotic' | 'piercing' | 'poison' | 'psychic' | 'radiant' | 'slashing' | 'thunder'} DamageType
 */

/**
 * @typedef {{
 * 		proficiency: {index: String, name: String, url: String},
 * 		value: Number
 * }} Proficiency
 */

/**
 * @typedef {{
 * 		actions: Action[],
 * 		alignment: String,
 * 		armor_class: Number,
 * 		challenge_rating: Number,
 * 		charisma: Number,
 * 		condition_immunities: {name: string, index: string, url: string}[],
 * 		constitution: Number,
 * 		damage_immunities: DamageType[],
 * 		damage_resistances: DamageType[],
 * 		damage_vulnerabilities: DamageType[],
 * 		dexterity: Number,
 * 		hit_dice: String,
 * 		hit_points: Number,
 * 		index: String,
 * 		intelligence: Number,
 * 		languages: String,
 * 		name: String,
 * 		proficiencies: Proficiency[],
 * 		senses: Object,
 * 		size: 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan',
 * 		special_abilities: {name: String, desc: String}[],
 * 		speed: {
 * 			climb: String | undefined,
 * 			fly: String | undefined,
 * 			walk: String | undefined
 * 		},
 * 		strength: Number,
 * 		subtype: String | null
 * 		type: String,
 * 		url: String,
 * 		wisdom: Number
 * }} Monster
 */