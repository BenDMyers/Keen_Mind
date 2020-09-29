/**
 * Replies to the user with a usage statement
 * @param {Message} message Discord Message object
 * @param {string} commandName the !-command issued by the user
 * @param {string} usageStatement a helpful description of how to use the given command
 */
function usage(message, commandName, usageStatement) {
	message.reply(`To use the \`!${commandName}\` command, please use \`${usageStatement}\`.`);
}

module.exports = usage;