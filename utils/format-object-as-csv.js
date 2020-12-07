/**
 * Formats an object key by removing underscores and applying proper capitialization
 * @param {string} key object key
 * @returns {string} formatted key
 */
function formatKey(key) {
	return key
		.replace(/_/g, ' ')
		.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1));
}

/**
 * Converts an object to a comma-separated list of its key–value pairs
 * @param {Object} obj any arbitrary object
 * @returns {string} comma-separated key–value pairs
 */
function formatObjectAsCsv({_id, ...obj}) {
	if (Object.keys(obj).length === 0) {
		return '';
	}

	return Object.entries(obj)
		.map(([key, value]) => `${formatKey(key)} ${value}`)
		.join(', ');
}

module.exports = formatObjectAsCsv;