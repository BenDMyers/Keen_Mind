/**
 * titlecases a string
 * @param {string} str string to titlecase
 * @returns {string} titlecased
 */
function toTitleCase(str) {
	return str.replace(/\w\S*/, txt => txt.charAt(0).toUpperCase() + txt.substr(1));
}

module.exports = toTitleCase;