function usage(message, commandName, usageStatement) {
	message.reply(`To use the \`!${commandName}\` command, please use \`${usageStatement}\`.`);
}

module.exports = usage;