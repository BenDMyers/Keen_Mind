const reactions = {
	'Air Elemental': '🌬',
	'Ape': '🦍',
	'Badger': '🦡',
	'Bat': '🦇',
	'Black Bear': '🐻',
	'Boar': '🐗',
	'Brown Bear': '🐻',
	'Camel': '🐪',
	'Crab': '🦀',
	'Deer': '🦌',
	'Dire Wolf': '🐺',
	'Dragon Turtle': '🐢',
	'Unicorn': '🦄',
	'Vampire': '🧛‍♂️',
	'Wolf': '🐺',
	'Zombie': '🧟‍♂️'
};

/**
 * Provides a cutesy emoji reaction to certain queried monsters
 * @param {Message} replyObject 
 * @param {{color: Number, title: String, description: String}} embeddedMessage 
 */
function reactToMonsters(replyObject, embeddedMessage) {
	const {title} = embeddedMessage;
	const reaction = reactions[title];
	if (reaction) {
		replyObject.react(reaction);
	} else if (title.endsWith('Dragon')) {
		replyObject.react('🐉');
	}
}

module.exports = reactToMonsters;