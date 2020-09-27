/**
 * Converts an `args` array into a cleansed, query-friendly format
 * @param {[String]} args words in the user's query
 * @param {String} delimiter character(s) used to separate multiple words in the query
 */
const sluggify = (args) => {
	return args
		.map(arg => arg.replace(/'/g, '%27'))
		.join('+')
		.toLowerCase();
};

const indexify = (args) => {
	return args
		.map(arg => arg.replace(/\W+/g, ''))
		.join('-')
		.toLowerCase();
};

module.exports = {sluggify, indexify};