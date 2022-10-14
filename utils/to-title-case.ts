/**
 * titlecases a string
 * @param str string to titlecase
 * @returns titlecased
 */
function toTitleCase(str: string) {
	return str.replace(/\w\S*/, txt => txt.charAt(0).toUpperCase() + txt.substr(1));
}

export default toTitleCase