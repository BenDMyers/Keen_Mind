const commonFractions = {
	'0.25': '1/4',
	'0.5': '1/2',
	'0.75': '3/4'
};

/**
 * @param {Number} decimal potentially decimal number
 * @returns {String} number or a fraction
 */
function formatFraction(decimal) {
	return commonFractions[decimal] || decimal.toString();
}

/**
 * @param {Number} number number to format
 * @returns {String} number with groups of three digits grouped by commas
 */
function formatNumberWithCommas(number) {
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

module.exports = {
	formatFraction,
	formatNumberWithCommas
};