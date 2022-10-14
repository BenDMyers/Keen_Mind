/**
 * Formats an object key by removing underscores and applying proper capitialization
 * @param key object key
 * @returns formatted key
 */
function formatKey(key: string) {
	return key
		.replace(/_/g, ' ')
		.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1));
}

/**
 * Converts an object to a comma-separated list of its key–value pairs
 * @param obj any arbitrary object
 * @returns comma-separated key–value pairs
 */
function formatObjectAsCsv({_id, ...obj}: any) {
	if (Object.keys(obj).length === 0) {
		return '';
	}

	return Object.entries(obj)
		.map(([key, value]) => `${formatKey(key)} ${value}`)
		.join(', ');
}

export default formatObjectAsCsv;