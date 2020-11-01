const dice = require('rpgdicejs');
const usage = require('../replies/usage');



module.exports = {
	name: 'roll',
	description: 'Roll some dice!',
	async execute(message, args) {
		if (!args || args.length === 0) {
			usage(message, 'feature', '!feature <partial or full class feature name>');
		}

		const rollString = args.join('');

		try {
			const roll = dice.eval(rollString);
			const rendered = roll.render();
			message.reply(`\`${rendered}\`\n= **${roll.value}**`);
		} catch (err) {
			message.reply('Sorry! That wasn\'t a valid roll!');
		}
	}
};