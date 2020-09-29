/**
 * Converts an `args` array into a cleansed, query-friendly format
 * @param {[String]} args words in the user's query
 * @param {String} delimiter character(s) used to separate multiple words in the query
 * @returns {String} Args formatted to be used in a URL as a query
 */
const sluggify = (args) => {
	return args
		.map(arg => arg.replace(/'/g, '%27'))
		.join('+')
		.toLowerCase();
};

/**
 * Converts an `args` array into the sluglike format used by the D&D 5e API's `index` property
 * @param {[String]} args words in the user's query
 * @param {String} delimiter character(s) used to separate multiple words in the query
 * @returns {String} Args formatted like an `index` in a 5e API object
 */
const indexify = (args) => {
	return args
		.map(arg => arg.replace(/\W+/g, ''))
		.join('-')
		.toLowerCase();
};

module.exports = {sluggify, indexify};