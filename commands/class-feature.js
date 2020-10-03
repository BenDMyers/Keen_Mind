const fetch = require('node-fetch');
const usage = require('../replies/usage');
const {PINK} = require('../utils/colors');
const {indexify, sluggify} = require('../utils/sluggify');

// TODO: Filter out parentheticals in their query and return the first entry in the response

/**
 * Fetch a spell's complete details and convert it into a Discord Embed object
 * @param {{index: String, name: String, url: String}} matchedFeature minimal representation of a class feature, returned from the /features endpoint
 * @returns {{color: Number, title: String, description: String, fields: [{name: String, value: String, inline: Boolean}]}} Discord Embed object for response
 */
async function getClassFeatureDetails(matchedFeature) {
	const {url} = matchedFeature;
	const classFeature = await fetch(`https://www.dnd5eapi.co${url}`).then(res => res.json());

	let subtitle = classFeature.class.name;
	if (classFeature.subclass) subtitle += ` (${classFeature.subclass.name})`;
	if (classFeature.level) subtitle += ` · Level ${classFeature.level}`;
	subtitle = `***${subtitle}***`;

	let description = subtitle;
	if (classFeature.desc) {
		const desc = Array.isArray(classFeature.desc) ?
			classFeature.desc.join('\n\n') :
			classFeature.desc;

		description += `\n\n${desc}`;
	}

	if (description.length >= 2048) {
		description = description.substr(0, 2045) + '…';
	}

	return {
		color: PINK,
		title: classFeature.name,
		description
	};
}

module.exports = {
	name: 'feature',
	description: 'Find a class feature!',
	/**
	 * Responds to a user's query for a class feature
	 * @param {Object} message Discord.js Message object
	 * @param {[String]} args user's full query
	 */
	async execute(message, args) {
		if (!args || args.length === 0) {
			usage(message, 'feature', '!feature <partial or full class feature name>');
		}

		const fullName = args.join(' ');
		const index = indexify(args);
		const query = sluggify(args);

		const classFeatures = await fetch(`https://www.dnd5eapi.co/api/features?name=${query}`)
			.then(res => res.json());

		const exactMatch = classFeatures.count > 0 && classFeatures.results.find(feature => feature.index === index);

		if (classFeatures.count === 0) {
			message.reply(`I couldn't find any class features called _${fullName}_. Try again with a shorter query`);
		} else if (exactMatch) {
			const featureDetails = await getClassFeatureDetails(exactMatch);
			if (classFeatures.count > 1) {
				const alternatives = classFeatures.results
					.filter(feature => feature.index !== index)
					.map(alt => `* ${alt.name}`)
					.join('\n');

				featureDetails.footer = {text: `---\nI also found:\n${alternatives}`};
			}

			message.channel.send({embed: featureDetails});
		} else if (classFeatures.count === 1) {
			const bestGuess = classFeatures.results[0];
			const featureDetails = await getClassFeatureDetails(bestGuess);
			featureDetails.footer = {text: '---\nThis was my best guess! Feel free to search again!'};

			message.channel.send({embed: featureDetails});
		} else {
			const alternatives = classFeatures.results.map(alt => `* ${alt.name}`);
			message.reply(`I couldn't find _${fullName}_. Did you mean one of these class features?\n\n${alternatives.join('\n')}`);
		}
	}
};